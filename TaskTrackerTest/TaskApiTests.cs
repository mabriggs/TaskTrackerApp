using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data.Common;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using TaskTrackerApp.Server.Data;
using TaskTrackerApp.Server.Models;
using TaskTrackerApp.Server.Shared;

namespace TaskTrackerTest
{

    public class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger, UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new[] { new Claim(ClaimTypes.Name, "Test user") };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "TestScheme");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }


    public class TaskApiTests(WebApplicationFactory<Program> factory)
        : IClassFixture<WebApplicationFactory<Program>>
    {
        // sets up auth and in-memory db
        private HttpClient CreateTestClientWithAuth(SqliteConnection dbConnection,
            Action<AppDbContext> populateDbFunc)
        {
            var client = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // config mock db
                    var dbContextDescriptor = services.SingleOrDefault(
                            d => d.ServiceType ==
                                typeof(DbContextOptions<AppDbContext>));

                    services.Remove(dbContextDescriptor);

                    var dbConnectionDescriptor = services.SingleOrDefault(
                        d => d.ServiceType ==
                            typeof(DbConnection));

                    services.Remove(dbConnectionDescriptor);

                    services.AddSingleton<DbConnection>(dbConnection);

                    services.AddDbContext<AppDbContext>((container, options) =>
                    {
                        var connection = container.GetRequiredService<DbConnection>();
                        options.UseSqlite(connection);
                    });

                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    db.Database.EnsureCreated();

                    populateDbFunc?.Invoke(db);

                    // config auth
                    services.AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = "TestScheme";
                        options.DefaultChallengeScheme = "TestScheme";
                    }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                            "TestScheme", options => { });
                });
            })
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            });

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(scheme: "TestScheme");

            return client;
        }

        [Theory]
        [InlineData("/api/task/getall", HttpStatusCode.OK)]
        [InlineData("/api/task/get?id=1", HttpStatusCode.OK)]
        [InlineData("/api/task/get?id=2", HttpStatusCode.NoContent)]
        public async Task ApiGetCalls_ReturnExpected(string url, HttpStatusCode expectedCode)
        {
            await using var dbConnection = new SqliteConnection("DataSource=:memory:");
            dbConnection.Open();

            static void populateDb(AppDbContext dbContext)
            {
                dbContext.Tasks.Add(new TaskTrackerApp.Server.Models.TaskModel()
                {
                    Id = 1,
                    DueDate = new DateTime(2025, 5, 6),
                    Status = TaskTrackerApp.Server.Models.TaskStatus.NotStarted,
                    Name = "test1"
                });
                dbContext.SaveChanges();
            }

            var client = CreateTestClientWithAuth(dbConnection, populateDb);
            var response = await client.GetAsync(url);
            //response.EnsureSuccessStatusCode();

            Assert.Equal(expectedCode, response.StatusCode);
        }

        [Fact]
        public async Task CreateTask_ReturnsExpected()
        {
            using var dbConnection = new SqliteConnection("DataSource=:memory:");
            dbConnection.Open();
            var client = CreateTestClientWithAuth(dbConnection, null);

            var newTask = new
            {
                id = 0,
                name = "test",
                dueDate = "2025-05-06",
                status = "NotStarted"
            };

            var json = JsonSerializer.Serialize(newTask);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/api/task/create", content);

            response.EnsureSuccessStatusCode();

            var serializerOptions = JsonDefaults.SetJsonSerializerOptions(new JsonSerializerOptions());
            var createdTask = await response.Content.ReadFromJsonAsync<TaskModel>(serializerOptions);

            Assert.Equal("test", createdTask.Name);
            Assert.Equal(
                new DateTime(2025, 5, 6, 0, 0, 0, DateTimeKind.Utc).ToUniversalTime(),
                createdTask.DueDate.ToUniversalTime());
            Assert.Equal(TaskTrackerApp.Server.Models.TaskStatus.NotStarted, createdTask.Status);
        }
    }
}