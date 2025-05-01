using TaskTrackerApp.Server.Models;

namespace TaskTrackerApp.Server.Services
{
    public interface ITaskManager
    {
        TaskModel CreateTask(TaskModel task);
        TaskModel GetTask(int id);
        List<TaskModel> GetAllTasks();
        TaskModel UpdateTask(TaskModel updatedTask);
        bool DeleteTask(int id);
    }
}
