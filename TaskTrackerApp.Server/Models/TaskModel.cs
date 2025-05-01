namespace TaskTrackerApp.Server.Models
{
    public enum TaskStatus
    {
        NotStarted,
        InProgress,
        Completed
    }

    public class TaskModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TaskStatus Status { get; set; }
        public DateTime DueDate { get; set; }

    }
}
