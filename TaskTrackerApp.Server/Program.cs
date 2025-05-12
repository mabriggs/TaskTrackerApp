using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskTrackerApp.Server;
using TaskTrackerApp.Server.Data;
using TaskTrackerApp.Server.Services;
using TaskTrackerApp.Server.Shared;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        JsonDefaults.SetJsonSerializerOptions(options.JsonSerializerOptions);
    });

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredUniqueChars = 0;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
})
    .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    // currently just using sqlite for everything (was initially going to deploy to azure)
    //if (builder.Environment.IsDevelopment())
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
    //else
    //{
    //    var azureConnString = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING");
    //    options.UseSqlServer(azureConnString);
    //}
});
//builder.Services.AddSingleton<ITaskManager, TaskManagerMock>();
builder.Services.AddScoped<ITaskManager, TaskManagerDb>();
builder.Services.AddScoped<UserManager<IdentityUser>>();


// Configure JWT authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
string jwtKey;
if (builder.Environment.IsDevelopment())
{
    jwtKey = jwtSettings["Key"];
    Console.WriteLine("Dev mode: using JWT key from appSettings.json");
}
else
{
    jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
    Console.WriteLine("Prod mode: using JWT key from environment variable");
}


builder.Services.Configure<JwtSettings>(options =>
{
    builder.Configuration.GetSection("JwtSettings").Bind(options);
    options.Key = jwtKey; // override key at runtime
});

// Enable Authentication & Authorization
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? throw new InvalidOperationException("JWT Key not found")))
        };
    });

builder.Services.AddAuthorization(options =>
{
    // todo: re-enable this
    options.FallbackPolicy = options.DefaultPolicy; // Allows default policy to be used
});


var app = builder.Build();

app.Use(async (context, next) =>
{
    Console.WriteLine($"User authenticated: {context.User.Identity?.IsAuthenticated}");
    Console.WriteLine($"User name: {context.User.Identity?.Name}");
    Console.WriteLine($"Request for {context.Request.Path}");
    await next();
});

//app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html").AllowAnonymous();

// for purposes of this demo app, just keep it simple and apply migrations here
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();

public partial class Program { }