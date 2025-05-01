using TaskTrackerApp.Server.Data;
using TaskTrackerApp.Server.Models;

namespace TaskTrackerApp.Server.Services
{
    public class TaskManagerDb(AppDbContext dbContext) : ITaskManager
    {
        public TaskModel CreateTask(TaskModel task)
        {
            dbContext.Tasks.Add(task);
            dbContext.SaveChanges();
            return task;
        }

        public bool DeleteTask(int id)
        {
            var task = dbContext.Tasks.FirstOrDefault(t => t.Id == id);
            if (task != null)
            {
                dbContext.Tasks.Remove(task);
                dbContext.SaveChanges();
            }
            return task != null;
        }

        public List<TaskModel> GetAllTasks()
        {
            return [.. dbContext.Tasks];
        }

        public TaskModel GetTask(int id)
        {
            return dbContext.Tasks.FirstOrDefault(t => t.Id == id);
        }

        public TaskModel UpdateTask(TaskModel updatedTask)
        {
            dbContext.Tasks.Update(updatedTask);
            dbContext.SaveChanges();
            return updatedTask;
        }
    }
}
