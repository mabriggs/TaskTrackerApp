using TaskTrackerApp.Server.Models;

namespace TaskTrackerApp.Server.Services
{
    public class TaskManagerMock : ITaskManager
    {
        private int _lastId;

        private readonly List<TaskModel> _taskList = [];


        public TaskManagerMock()
        {
            // Initialize with some sample tasks
            _taskList.Add(new TaskModel { Id = 1, Name = "Task 1", Status = Models.TaskStatus.NotStarted, DueDate = DateTime.Now.AddDays(1) });
            _taskList.Add(new TaskModel { Id = 2, Name = "Task 2", Status = Models.TaskStatus.InProgress, DueDate = DateTime.Now.AddDays(2) });
            _taskList.Add(new TaskModel { Id = 3, Name = "Task 3", Status = Models.TaskStatus.Completed, DueDate = DateTime.Now.AddDays(3) });

            _lastId = _taskList.Count;
        }

        public TaskModel CreateTask(TaskModel task)
        {
            task.Id = _lastId + 1;
            _taskList.Add(task);
            _lastId = task.Id;
            return task;
        }

        public TaskModel GetTask(int id)
        {
            return _taskList.FirstOrDefault(t => t.Id == id);
        }

        public List<TaskModel> GetAllTasks()
        {
            return _taskList;
        }

        public TaskModel UpdateTask(TaskModel updatedTask)
        {
            var task = GetTask(updatedTask.Id);
            if (task != null)
            {
                task.Name = updatedTask.Name;
                task.Status = updatedTask.Status;
                task.DueDate = updatedTask.DueDate;
            }
            return task;
        }

        public bool DeleteTask(int id)
        {
            var task = GetTask(id);
            if (task != null)
            {
                _taskList.Remove(task);
                return true;
            }
            return false;
        }
    }
}
