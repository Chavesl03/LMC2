import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Completed';
  category: string;
  createdAt: string;
  updatedAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      
      setTasks(updatedTasks);
      setIsLoading(false);
    }, (err) => {
      console.error('Error listening to tasks:', err);
      setError('Failed to load tasks');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: new Date().toISOString()
      });

      return docRef.id;
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const taskRef = doc(db, 'tasks', updatedTask.id);
      await updateDoc(taskRef, {
        ...updatedTask,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    isLoading,
    error
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}