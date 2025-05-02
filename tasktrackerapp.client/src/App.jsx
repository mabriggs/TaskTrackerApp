import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaskList  from './components/TaskList';
import './App.css';
import authService from './services/authService';
import Login from './Login';
import { PlusIcon } from "@heroicons/react/24/outline";

function RequireAuth({ children }) {
    const token = authService.getToken();

    if (!token) {
        return <Navigate to="/account/login" />;
    }

    return children;
};

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
        const response = await authService.fetch('/api/Task/GetAll');
        if (response.ok) {
            console.log("popTaskData", response);
            const data = await response.json();
            setTaskList(data.map(convertServerTaskData));
        } else {
            console.error('Failed to fetch task data');
        }
    }

    async function createTaskData(task) {
        const response = await authService.fetch('/api/Task/Create', {
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
        const response = await authService.fetch('/api/Task/Update', {
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
        const response = await authService.fetch(`/api/Task/Delete?id=${task.id}`, {
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

    function TaskControls() {
        return (<>
            <div className="gap-2 px-4 py-8">
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
                    className="outline px-3 py-1 rounded hover:bg-gray-100 float-right"
                    disabled={editingIndex >= 0}>
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>

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
        </>);
    }

    return (
        <Router>
            <div className="w-full">
                <Routes>
                    <Route path="/"
                        element={
                            <RequireAuth>
                                <TaskControls />
                            </RequireAuth>
                        } />
                    <Route path="/account/login"
                        element={<Login />} />
    {/*                <Route path="*" element={<Navigate to="/" replace />} />*/}
                </Routes>
            </div>
        </Router>);
    
}

export default App;