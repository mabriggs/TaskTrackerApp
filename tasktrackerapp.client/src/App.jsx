import { useEffect, useState } from 'react';
import TaskList  from './components/TaskList';
import './App.css';

function App() {
    const [taskList, setTaskList] = useState([]);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editingNewTask, setEditingNewTask] = useState(false);

    useEffect(() => {
        populateTaskData();
    }, []);

    function convertServerTaskData(data) {
        return {
            ...data,
            dueDate: new Date(data.dueDate)
        };
    }

    async function populateTaskData() {
        const response = await fetch('/api/Task/GetAll');
        if (response.ok) {
            console.log("popTaskData", response);
            const data = await response.json();
            setTaskList(data.map(convertServerTaskData));
        } else {
            console.error('Failed to fetch task data');
        }
    }

    async function createTaskData(task) {
        const response = await fetch('/api/Task/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (response.ok) {
            const newTask = await response.json();
            const convTask = convertServerTaskData(newTask);
            return convTask;
        } else {
            console.error('Failed to save task data');
        }
    }

    async function updateTaskData(task) {
        const response = await fetch('/api/Task/Update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (response.ok) {
            const updatedTask = await response.json();
            return convertServerTaskData(updatedTask);
        } else {
            console.error('Failed to update task data');
        }
    }

    async function deleteTaskData(task) {
        const response = await fetch(`/api/Task/Delete?id=${task.id}`, {
            method: "PUT"
        });
        if (!response.ok) {
            // todo: also check response result
            console.error('Failed to delete task data');
        }
    }

    function removeTaskFromList(task) {
        const newTaskList = taskList.filter(t => t !== task);
        setTaskList(newTaskList);
    }

    return (
        <div className="w-full">
            <button
                onClick={() => {
                    const task = {
                        id: 0,
                        name: "",
                        status: "NotStarted",
                        dueDate: new Date()
                    };
                    setTaskList(taskList.concat(task));
                    setEditingIndex(taskList.length); // no -1, accounting for new task
                    setEditingNewTask(true);
                }}
                disabled={editingIndex >= 0}
            >Add</button>

            <TaskList
                tasks={taskList}
                onUpdateTask={(updatedTask, index) => {
                    const getTaskFunc = editingNewTask ? createTaskData : updateTaskData;
                    
                    getTaskFunc(updatedTask)
                        .then(resultTask => {
                            setTaskList(taskList.map((task, i) => {
                                if (i === index) return resultTask
                                else return task;
                            }));
                            setEditingNewTask(false);
                        });
                }}
                onDeleteTask={task => {
                    deleteTaskData(task)
                        .then(() => {
                            removeTaskFromList(task);
                            setEditingNewTask(false);
                        });
                }}
                onCancelTask={(task) => {
                    setEditingIndex(-1);
                    if (editingNewTask) {
                        removeTaskFromList(task);
                        setEditingNewTask(false);
                    }
                }}
                editingIndex={editingIndex}
                setEditingIndex={setEditingIndex}
            />
        </div>
    );
    
}

export default App;