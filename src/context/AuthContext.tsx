import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, encryptPassword, decryptPassword } from '../config/firebase';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  store: string;
  permissions: string[];
  encryptedPassword?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addUser: (userData: { username: string; password: string; name: string; role: string; store: string; }) => Promise<void>;
  updateUser: (id: string, userData: { username: string; password?: string; name: string; role: string; store: string; }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Initial users for offline/demo mode
const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: 'luis.chaves',
    name: 'Luís Chaves',
    role: 'Admin',
    store: 'C.C. El Corte Inglés',
    permissions: ['all'],
    encryptedPassword: encryptPassword('password123')
  }
];

const LOCAL_STORAGE_KEYS = {
  USERS: 'asc_users',
  CURRENT_USER: 'asc_current_user'
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync users with localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Sync current user with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const matchedUser = users.find(u => u.username === username);
      if (!matchedUser || !matchedUser.encryptedPassword) {
        throw new Error('Invalid credentials');
      }

      const decryptedPassword = decryptPassword(matchedUser.encryptedPassword);
      if (password !== decryptedPassword) {
        throw new Error('Invalid credentials');
      }

      setUser(matchedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
  };

  const addUser = async (userData: { username: string; password: string; name: string; role: string; store: string; }) => {
    try {
      // Validate username uniqueness
      if (users.some(u => u.username === userData.username)) {
        throw new Error('Username already exists');
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        username: userData.username,
        name: userData.name,
        role: userData.role,
        store: userData.store,
        permissions: ['view_inventory', 'make_sales'],
        encryptedPassword: encryptPassword(userData.password)
      };

      setUsers(prevUsers => [...prevUsers, newUser]);

      // Try to sync with Firebase if online
      if (!isOffline) {
        try {
          await addDoc(collection(db, 'users'), newUser);
        } catch (error) {
          console.warn('Failed to sync with Firebase, operating in offline mode');
        }
      }

      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
      throw err;
    }
  };

  const updateUser = async (id: string, userData: { username: string; password?: string; name: string; role: string; store: string; }) => {
    try {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...users[userIndex],
        name: userData.name,
        role: userData.role,
        store: userData.store
      };

      // Only update password if a new one is provided
      if (userData.password) {
        updatedUser.encryptedPassword = encryptPassword(userData.password);
      }

      const newUsers = [...users];
      newUsers[userIndex] = updatedUser;
      setUsers(newUsers);

      // Update current user if editing self
      if (user?.id === id) {
        setUser(updatedUser);
      }

      // Try to sync with Firebase if online
      if (!isOffline) {
        try {
          await updateDoc(doc(db, 'users', id), updatedUser);
        } catch (error) {
          console.warn('Failed to sync with Firebase, operating in offline mode');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Prevent deleting the last admin user
      const userToDelete = users.find(u => u.id === id);
      const remainingAdmins = users.filter(u => u.role === 'Admin' && u.id !== id);

      if (userToDelete?.role === 'Admin' && remainingAdmins.length === 0) {
        throw new Error('Cannot delete the last admin user');
      }

      // Prevent deleting the current user
      if (user?.id === id) {
        throw new Error('Cannot delete the currently logged-in user');
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

      // Try to sync with Firebase if online
      if (!isOffline) {
        try {
          await deleteDoc(doc(db, 'users', id));
        } catch (error) {
          console.warn('Failed to sync with Firebase, operating in offline mode');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  const value = {
    user,
    users,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isLoading,
    error,
    isOffline
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}