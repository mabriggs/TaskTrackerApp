using Microsoft.EntityFrameworkCore;
using TaskTrackerApp.Server.Models;

namespace TaskTrackerApp.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration config) : base(options)
        {
        }

        // Define your DbSets here
        public DbSet<TaskModel> Tasks { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite("Data Source=tasktracker.db");
    }
}
