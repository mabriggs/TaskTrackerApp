import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaskControl from './components/TaskControl';
import './App.css';
import authService from './services/authService';
import Login from './Login';

function RequireAuth({ children }) {
    const token = authService.getToken();
    if (!token) return <Navigate to="/account/login" />;
    return children;
}

function App() {
    const [taskList, setTaskList] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(authService.getToken() != null);

    useEffect(() => {
        if (isLoggedIn) {
            getAllTaskData().then(data => {
                if (data) setTaskList(data);
            });
        }
    }, [isLoggedIn]);

    function convertServerTaskData(data) {
        return {
            ...data,
            dueDate: new Date(data.dueDate)
        };
    }

    async function getAllTaskData() {
        const response = await authService.fetch('/api/Task/GetAll');
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch task data');
        }
    }

    async function createTaskData(task) {
        const response = await authService.fetch('/api/Task/Create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (response.ok) {
            const newTask = await response.json();
            return convertServerTaskData(newTask);
        } else {
            console.error('Failed to save task data');
        }
    }

    async function updateTaskData(task) {
        const response = await authService.fetch('/api/Task/Update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            console.error('Failed to delete task data');
        }
    }

    return (
        <Router>
            <div className="w-full">
                <Routes>
                    <Route path="/"
                        element={
                            <RequireAuth>
                                <div className="text-left">
                                    <button
                                        onClick={() => {
                                            if (confirm("Return to login screen?")) {
                                                authService.logout();
                                                setIsLoggedIn(false);
                                                window.location.href = "/account/login";
                                            }
                                        }}
                                        className="outline-1 text-gray-400 font-bold rounded-xl px-4 py-2 hover:bg-gray-400 hover:text-gray-900"
                                    >
                                        Logout
                                    </button>
                                </div>

                                <div className="text-3xl">Task List</div>
                                {taskList ? (
                                    <TaskControl
                                        taskList={taskList}
                                        setTaskList={setTaskList}
                                        createTaskData={createTaskData}
                                        updateTaskData={updateTaskData}
                                        deleteTaskData={deleteTaskData}
                                    />
                                ) : (
                                    <p>Attempting to fetch tasks...</p>
                                )}
                            </RequireAuth>
                        } />
                    <Route path="/account/login"
                        element={<Login onLogin={() => setIsLoggedIn(true)} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
