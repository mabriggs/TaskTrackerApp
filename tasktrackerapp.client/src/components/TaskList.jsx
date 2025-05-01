import React, { useState } from 'react';

function ReadOnlyTaskEntry({ task,
    onEdit,
    onDelete,
    allowEditing
}) {
    return (
        <div>
            <span>{task.name} </span>
            <span>{task.status} </span>
            <span>{task.dueDate.toLocaleDateString && task.dueDate.toLocaleDateString()} </span>
            {allowEditing &&
            (<>
                <button
                    onClick={() => {
                    onEdit(task)
                }} >Edit</button>
                <button
                    onClick={() => {
                        if (confirm(`Delete task "${task.name}"?`)) {
                            onDelete(task)
                        }
                    }}>Delete</button>
            </>)}
        </div>
    );
}

function EditingTaskEntry({
    task,
    submitText,
    onSaveTask,
    onCancel}) {

    function handleSubmit(formData) {
        const updatedTask = {
            id: task.id,
            name: formData.get('Name'),
            status: formData.get('Status'),
            dueDate: formData.get('DueDate')
        };
        // Call the function to update the task in the parent component
        onSaveTask(updatedTask);
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0]; // returns "YYYY-MM-DD"
    }

    const todayDateVal = formatDate(task.dueDate);

    return (
        <div>
            <form action={handleSubmit}>
                <input type="text" name="Name" defaultValue={task.name} />
                <select name="Status" id="status-select" defaultValue={task.status}>
                    <option value="NotStarted">Not Started</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
                <input type="date" name="DueDate" defaultValue={todayDateVal} min={todayDateVal} />
                <button type="submit">{submitText}</button>
                <button onClick={() => onCancel(task)}>Cancel</button>
            </form>
        </div>
    );
}

export default function TaskList({
    tasks,
    onUpdateTask,
    onDeleteTask,
    onCancelTask,
    editingIndex,
    setEditingIndex
}) {
    return (tasks.map((task, i) => (
        editingIndex === i ?
            <EditingTaskEntry
                key={task.id}
                task={task}
                submitText="Save"
                onSaveTask={updatedTask => {
                    onUpdateTask(updatedTask, i);
                    setEditingIndex(-1);
                }}
                onCancel={onCancelTask}
            /> :
            <ReadOnlyTaskEntry
                key={task.id}
                task={task}
                onEdit={() => { setEditingIndex(i) }}
                onDelete={() => {
                    // todo: confirm delete
                    onDeleteTask(task);
                    setEditingIndex(-1);
                }}
                allowEditing={editingIndex === -1}
            />
    )));
}