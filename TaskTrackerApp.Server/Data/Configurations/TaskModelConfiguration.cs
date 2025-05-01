using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskTrackerApp.Server.Models;

namespace TaskTrackerApp.Server.Data.Configurations
{
    public class TaskModelConfiguration : IEntityTypeConfiguration<TaskModel>
    {
        public void Configure(EntityTypeBuilder<TaskModel> builder)
        {
            builder.ToTable("Tasks");
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
            builder.Property(t => t.Status).IsRequired();
            builder.Property(t => t.DueDate).IsRequired();
        }
    }
}
