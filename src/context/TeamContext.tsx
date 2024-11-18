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
  orderBy
} from 'firebase/firestore';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  imageUrl: string;
  status: 'active' | 'inactive';
  isChampion: boolean;
  reseller?: 'FNAC' | 'Worten' | null;
  createdAt: string;
}

interface TeamContextType {
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<void>;
  updateMember: (member: TeamMember) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

interface TeamProviderProps {
  children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const q = query(collection(db, 'team'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const loadedMembers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        setMembers(loadedMembers);
      } catch (err) {
        setError('Failed to load team members');
        console.error('Error loading team members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  const addMember = async (memberData: Omit<TeamMember, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'team'), {
        ...memberData,
        createdAt: new Date().toISOString()
      });

      const newMember: TeamMember = {
        ...memberData,
        id: docRef.id,
        createdAt: new Date().toISOString()
      };

      setMembers(prev => [...prev, newMember]);
    } catch (err) {
      setError('Failed to add team member');
      console.error('Error adding team member:', err);
      throw err;
    }
  };

  const updateMember = async (updatedMember: TeamMember) => {
    try {
      const memberRef = doc(db, 'team', updatedMember.id);
      await updateDoc(memberRef, {
        ...updatedMember,
        updatedAt: new Date().toISOString()
      });

      setMembers(prev =>
        prev.map(member =>
          member.id === updatedMember.id ? updatedMember : member
        )
      );
    } catch (err) {
      setError('Failed to update team member');
      console.error('Error updating team member:', err);
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'team', id));
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError('Failed to delete team member');
      console.error('Error deleting team member:', err);
      throw err;
    }
  };

  const value = {
    members,
    addMember,
    updateMember,
    deleteMember,
    isLoading,
    error
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}