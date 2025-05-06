using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskTrackerApp.Server.Models;

namespace TaskTrackerApp.Server.Data
{
    public class AppDbContext : IdentityDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration config) : base(options)
        {
        }

        // Define your DbSets here
        public DbSet<TaskModel> Tasks { get; set; }
    }
}
