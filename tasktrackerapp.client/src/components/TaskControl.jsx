import { useState, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, HandThumbDownIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";

function ReadOnlyTaskEntry({ task, onEdit, onDelete, allowEditing }) {
    return (
        <div className="flex flex-row w-full px-4 py-2 my-2 rounded-xl outline outline-1 outline-gray-600 items-center gap-4 overflow-x-auto whitespace-nowrap">
            <div className="basis-1/2 text-left truncate">{task.name}</div>
            <div className="basis-1/6">{task.status}</div>
            <div className="basis-1/6">{new Date(task.dueDate).toLocaleDateString()}</div>
            {allowEditing && (
                <div className="flex gap-2 text-gray-400">
                    <button
                        className="outline px-3 py-1 rounded hover:bg-gray-100"
                        onClick={() => onEdit(task)}
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        className="outline px-3 py-1 rounded hover:bg-gray-100"
                        onClick={() => {
                            if (confirm(`Delete task "${task.name}"?`)) {
                                onDelete(task);
                            }
                        }}
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

function EditingTaskEntry({ task, onSaveTask, onCancel }) {
    const [changeMade, setChangeMade] = useState(false);
    const formRef = useRef();

    function getTaskFromFormData(formData) {
        const rawDate = new Date(formData.get('DueDate'));
        return {
            id: task.id,
            name: formData.get('Name'),
            status: formData.get('Status'),
            dueDate: new Date(Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate())),
        };
    }

    function handleSubmit(formData) {
        const updatedTask = getTaskFromFormData(formData);
        onSaveTask(updatedTask);
    }

    function handleFormChange() {
        const formData = new FormData(formRef.current);
        setChangeMade(changeWasMade(task, getTaskFromFormData(formData)));
    }

    function changeWasMade(task1, task2) {
        const changeMade = task1.name !== task2.name ||
            task1.status !== task2.status ||
            task1.dueDate.getTime() !== task2.dueDate.getTime();
        return changeMade;
    }

    function formatDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    const todayDateVal = formatDate(task.dueDate);

    return (
        <div className="flex w-full px-4 py-2 my-2 rounded-xl outline outline-1 outline-gray-600 items-center gap-4 overflow-x-auto whitespace-nowrap">
            <form action={handleSubmit} ref={formRef} onChange={handleFormChange} className="flex w-full gap-4 items-center">
                <input
                    type="text"
                    name="Name"
                    defaultValue={task.name}
                    className="basis-1/2 text-left outline px-2 py-1 rounded"
                />
                <select
                    name="Status"
                    defaultValue={task.status}
                    className="basis-1/6 outline px-2 py-1 rounded"
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
                    className="basis-1/6 outline px-2 py-1 rounded"
                />
                <div className="flex gap-2">
                    <button type="submit" disabled={!changeMade}
                        className="outline px-3 py-1 rounded hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                        <HandThumbUpIcon
                            className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="outline px-3 py-1 rounded hover:bg-gray-100"
                        onClick={() => {
                            if (!changeMade || confirm("Abandon changes?")) {
                                onCancel(task);
                            }
                        }}>
                        <HandThumbDownIcon className="h-5 w-5" />
                    </button>
                </div>
            </form>
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
    reverseDirection=false
}) {
    const taskList = tasks.map((task, i) =>
        editingIndex === i ? (
            <EditingTaskEntry
                key={task.id}
                task={task}
                submitText="Save"
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
        ));

    if (reverseDirection) {
        taskList.reverse()
    }

    return (
        <div className="w-full">
            {taskList}
        </div>
    );
}

export default function TaskControl({
    taskList,
    setTaskList,
    createTaskData,
    updateTaskData,
    deleteTaskData }) {
    
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editingNewTask, setEditingNewTask] = useState(false);

    function HeaderRow() {
        return (
            <div className="flex flex-row w-full px-4 py-2 my-2 rounded-xl outline outline-1 outline-gray-600 items-center gap-4 overflow-x-auto whitespace-nowrap">
                <div className="basis-1/2 text-left truncate">Name</div>
                <div className="basis-1/6">Status</div>
                <div className="basis-1/6">Due Date</div>

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
            </div>);
    }

    function removeTaskFromList(task) {
        const newTaskList = taskList.filter(t => t !== task);
        setTaskList(newTaskList);
    }

    return (<>
        <h1>TODO LIST</h1>
        <HeaderRow />
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
            reverseDirection={true}
        />
    </>);
}
