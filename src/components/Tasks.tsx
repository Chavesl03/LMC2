import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, Edit2, Trash2, X, ClipboardList, ListChecks } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { useTask } from '../context/TaskContext';
import { useTeam } from '../context/TeamContext';

const TASK_CATEGORIES = {
  'Store Operations': ['Store Operations'],
  'Management': ['Inventory Management', 'Customer Service', 'Training', 'Marketing', 'Maintenance']
};

const CATEGORY_ICONS = {
  'Store Operations': ClipboardList,
  'Management': ListChecks
};

const PRIORITIES = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800'
};

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, isLoading } = useTask();
  const { members } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    status: 'To Do' as 'To Do' | 'In Progress' | 'Completed',
    category: ''
  });

  const handleAddTask = async () => {
    try {
      if (editingTask) {
        await updateTask({
          ...editingTask,
          ...newTask
        });
      } else {
        await addTask(newTask);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'To Do',
        category: ''
      });
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      category: task.category
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleStatusChange = async (task: any, newStatus: 'To Do' | 'In Progress' | 'Completed') => {
    try {
      await updateTask({
        ...task,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Task Management</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setNewTask({
              title: '',
              description: '',
              assignee: '',
              dueDate: new Date().toISOString().split('T')[0],
              priority: 'Medium',
              status: 'To Do',
              category: ''
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Task
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(TASK_CATEGORIES).map(([category, subcategories]) => {
          const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
          const categoryTasks = tasks.filter(task => subcategories.includes(task.category));

          return (
            <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-95" />
                <div className="relative px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-blue-400" />
                    <h3 className="text-lg font-medium text-white tracking-wide">{category}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                      {categoryTasks.length} tasks
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {['To Do', 'In Progress', 'Completed'].map((status) => (
                    <div key={status} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          {status === 'To Do' && <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />}
                          {status === 'In Progress' && <Clock className="h-4 w-4 text-blue-500 mr-2" />}
                          {status === 'Completed' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                          {status}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {categoryTasks.filter(task => task.status === status).length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {categoryTasks
                          .filter(task => task.status === status)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${PRIORITIES[task.priority]}`}>
                                  {task.priority}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditTask(task)}
                                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                    title="Edit task"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                                    title="Delete task"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                              <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                              <div className="mt-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                </div>
                                <div className="mt-2 flex items-center">
                                  <img
                                    className="h-6 w-6 rounded-full"
                                    src={members.find(m => m.name === task.assignee)?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                                    alt={task.assignee}
                                  />
                                  <span className="ml-2 text-sm text-gray-500">{task.assignee}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {Object.entries(TASK_CATEGORIES).map(([category, subcategories]) => (
                    <optgroup key={category} label={category}>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assignee</label>
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select an assignee</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as 'To Do' | 'In Progress' | 'Completed' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;