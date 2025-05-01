using Microsoft.AspNetCore.Mvc;
using TaskTrackerApp.Server.Models;
using TaskTrackerApp.Server.Services;

namespace TaskTrackerApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController(ITaskManager taskManager) : Controller
    {
        [HttpPost("Create")]
        public TaskModel CreateTask(TaskModel task)
        {
            var newTask = taskManager.CreateTask(task);
            return newTask;
        }

        [HttpGet("Get")]
        public TaskModel GetTask(int id)
        {
            var task = taskManager.GetTask(id);
            return task;
        }

        [HttpGet("GetAll")]
        public List<TaskModel> GetAllTasks()
        {
            var tasks = taskManager.GetAllTasks();
            return tasks;
        }

        [HttpPost("Update")]
        public TaskModel UpdateTask(TaskModel updatedTask)
        {
            var task = taskManager.UpdateTask(updatedTask);
            return task;
        }

        [HttpPut("Delete")]
        public IActionResult DeleteTask(int id)
        {
            var result = taskManager.DeleteTask(id);
            return Ok(result);
        }
    }
}
