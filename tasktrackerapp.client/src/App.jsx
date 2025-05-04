import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaskControl from './components/TaskControl';
import './App.css';
import authService from './services/authService';
import Login from './Login';

function RequireAuth({ children }) {
    const token = authService.getToken();

    if (!token) {
        return <Navigate to="/account/login" />;
    }

    return children;
};

function App() {
    const [taskList, setTaskList] = useState([]);
    //let taskList;
    
    useEffect(() => {
        getTaskData().then(data => { setTaskList(data) });
    }, []);

    function convertServerTaskData(data) {
        return {
            ...data,
            dueDate: new Date(data.dueDate)
        };
    }

    async function getTaskData() {
        const response = await authService.fetch('/api/Task/GetAll');
        if (response.ok) {
            console.log("popTaskData", response);
            const data = await response.json();
            return data;
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

    return (
        <Router>
            <div className="w-full">
                <Routes>
                    <Route path="/"
                        element={
                            <RequireAuth>
                                <TaskControl
                                    taskList={taskList}
                                    setTaskList={setTaskList}
                                    createTaskData={createTaskData}
                                    updateTaskData={updateTaskData}
                                    deleteTaskData={deleteTaskData}
                                />
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