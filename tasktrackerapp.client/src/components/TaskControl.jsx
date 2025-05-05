import { useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    HandThumbDownIcon,
    HandThumbUpIcon,
} from '@heroicons/react/24/outline';

function ReadOnlyTaskEntry({ task, onEdit, onDelete, allowEditing }) {
    const buttonStyleStr = `hover:bg-gray-200 hover:text-gray-900 hover:border-pink-500 p-2 rounded outline-1 mx-1 ${allowEditing ? "" : "invisible" }` ;
    return (
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] rounded-xl w-full px-4 py-2 my-2 outline-1 border-b border-gray-700 text-gray-200 items-center min-h-[3rem]">
            <div className="font-semibold p-1 mx-1">{task.name}</div>
            <div className="text-sm p-1 mx-1">{task.status}</div>
            <div className="text-sm p-1 mx-1">{new Date(task.dueDate).toLocaleDateString()}</div>
            <div className="grid grid-cols-[1fr_1fr] min-w-12">
            <button onClick={() => onEdit(task)}
                className={buttonStyleStr} >
                        <PencilIcon className="h-4 w-4" />
            </button>
            <button
                onClick={() => {
                    if (confirm(`Delete task "${task.name}"?`)) {
                        onDelete(task);
                    }
                }}
                className={buttonStyleStr}>
                    <TrashIcon className="h-4 w-4" />
            </button>
            </div>
        </div>
    );
}

function EditingTaskEntry({ task, onSaveTask, onCancel }) {
    const [name, setName] = useState(task.name);
    const [status, setStatus] = useState(task.status);
    const [dueDate, setDueDate] = useState(formatDate(task.dueDate));

    function formatDate(date) { return new Date(date).toISOString().split('T')[0] };
    const todayDateVal = formatDate(task.dueDate);

    function changeWasMade(task) {
        return task.name !== name || task.status !== status || formatDate(task.dueDate) !== dueDate;
    }

    return (
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] w-full px-4 py-2 my-2 border-gray-700 text-gray-200 items-center min-h-[3rem]">
            <input
                type="text"
                name="Name"
                defaultValue={task.name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700 text-white rounded p-1 mx-1"
            />
            <select
                name="Status"
                defaultValue={task.status}
                onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-700 text-white rounded p-1 mx-1"
            >
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>
            <input
                type="date"
                name="DueDate"
                defaultValue={todayDateVal}
                min={todayDateVal}
                onChange={(e) => setDueDate(e.target.value)}
            className="bg-gray-700 text-white rounded p-1 mx-1"
            />
            <div className="flex gap-2 mx-1">
                <button
                    disabled={!changeWasMade(task)}
                    onClick={() => {
                        if (confirm("Save changes?")) {
                            const rawDate = new Date(dueDate);
                            onSaveTask({
                                id: task.id,
                                name,
                                status,
                                dueDate: new Date(Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate())),
                            });
                        }
                    }}
                    className="hover:bg-gray-200 hover:text-gray-900 hover:outline-pink-500 p-2 rounded disabled:bg-gray-800 disabled:text-gray-500 disabled:outline-0 outline-1"
                >
                    <HandThumbUpIcon className="h-4 w-4" />
                </button>
                <button
                    onClick={() => {
                        if (!changeWasMade(task) || confirm('Abandon changes?')) {
                            onCancel(task);
                        }
                    }}
                    className="hover:bg-gray-200 hover:text-gray-900 hover:outline-orange-800 p-2 rounded outline-1"
                >
                    <HandThumbDownIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function TaskList({
    tasks,
    onUpdateTask,
    onDeleteTask,
    onCancelTask,
    editingIndex,
    setEditingIndex,
    reverseDirection = false,
}) {
    const taskList = tasks.map((task, i) =>
        editingIndex === i ? (
            <EditingTaskEntry
                key={task.id}
                task={task}
                onSaveTask={(updatedTask) => {
                    onUpdateTask(updatedTask, i);
                    setEditingIndex(-1);
                }}
                onCancel={onCancelTask}
            />
        ) : (
            <ReadOnlyTaskEntry
                key={task.id}
                task={task}
                onEdit={() => setEditingIndex(i)}
                onDelete={() => {
                    onDeleteTask(task);
                    setEditingIndex(-1);
                }}
                allowEditing={editingIndex === -1}
            />
        )
    );

    if (reverseDirection) taskList.reverse();

    return <div>{taskList}</div>;
}

export default function TaskControl({ taskList, setTaskList, createTaskData, updateTaskData, deleteTaskData }) {
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editingNewTask, setEditingNewTask] = useState(false);

    function addNewTask() {
        const task = {
            id: 0,
            name: '',
            status: 'NotStarted',
            dueDate: new Date(),
        };
        setTaskList([...taskList, task]);
        setEditingIndex(taskList.length);
        setEditingNewTask(true);
    }

    function removeTaskFromList(task) {
        setTaskList(taskList.filter((t) => t !== task));
    }

    return (
        <div className="p-4 rounded-xl shadow mb-4 text-gray-200">
            <div className="justify-between items-center mb-4 py-2 px-4 bg-gray-200 text-gray-900 text-xl font-bold rounded-xl">
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center">
                    <div>Name</div>
                    <div>Status</div>
                    <div>Due Date</div>
                    <div className="flex gap-2 mx-1">
                        <button
                            className="p-2 invisible">
                            <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={addNewTask}
                            disabled={editingIndex >= 0}
                            className="hover:bg-gray-800 hover:text-gray-200 text-gray-900 outline-gray-900 outline-1 p-1 rounded disabled:text-gray-400 disabled:bg-gray-300 disabled:outline-gray-400"
                        >
                            <PlusIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
               
            </div>
            <TaskList
                tasks={taskList}
                onUpdateTask={(updatedTask, index) => {
                    const getTaskFunc = editingNewTask ? createTaskData : updateTaskData;
                    getTaskFunc(updatedTask).then((resultTask) => {
                        setTaskList(taskList.map((task, i) => (i === index ? resultTask : task)));
                        setEditingNewTask(false);
                    });
                }}
                onDeleteTask={(task) => {
                    deleteTaskData(task).then(() => {
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
                reverseDirection={true}
            />
        </div>
    );
}
