import React, { useState } from 'react';
import { UserPlus, Mail, Phone, MapPin, X, Edit2, Trash2, Camera } from 'lucide-react';
import { useTeam } from '../context/TeamContext';

const STORE_LOCATIONS = [
  'C.C.Colombo',
  'C.C.Vasco da Gama',
  'C.C. Armazéns do Chiado',
  'C.C. Almada Forum',
  'C.C. El Corte Inglés',
  'C.C. Cascais Shopping',
  'C.C. Norte Shopping'
];

const ROLES = [
  'Vendedor',
  'VQ1',
  'VQ2',
  'RD',
  'CA',
  'GFV'
];

const RESELLERS = ['FNAC', 'Worten', 'El Corte Inglés'] as const;

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

const getResellerBadgeStyle = (reseller: typeof RESELLERS[number]) => {
  switch (reseller) {
    case 'FNAC':
      return 'bg-[#f4b942]/10 text-[#f4b942] border border-[#f4b942]/20';
    case 'Worten':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'El Corte Inglés':
      return 'bg-green-100 text-green-800 border border-green-200';
    default:
      return '';
  }
};

const TeamManagement = () => {
  const { members, addMember, updateMember, deleteMember, isLoading } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    status: 'active' as const,
    isChampion: false,
    imageUrl: DEFAULT_IMAGE,
    reseller: null as (typeof RESELLERS[number] | null)
  });

  const handleAddMember = async () => {
    if (newMember.name && newMember.role && newMember.email && newMember.phone && newMember.location) {
      try {
        if (editingMember) {
          await updateMember({
            ...editingMember,
            ...newMember
          });
        } else {
          await addMember(newMember);
        }

        setNewMember({
          name: '',
          role: '',
          email: '',
          phone: '',
          location: '',
          status: 'active',
          isChampion: false,
          imageUrl: DEFAULT_IMAGE,
          reseller: null
        });
        setEditingMember(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving member:', error);
        alert('Failed to save team member. Please try again.');
      }
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setNewMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteMember(id);
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete team member. Please try again.');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMember({ ...newMember, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">Loading team members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
        <button
          onClick={() => {
            setEditingMember(null);
            setNewMember({
              name: '',
              role: '',
              email: '',
              phone: '',
              location: '',
              status: 'active',
              isChampion: false,
              imageUrl: DEFAULT_IMAGE,
              reseller: null
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="relative group">
                      <img className="h-12 w-12 rounded-full object-cover" src={member.imageUrl} alt="" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                        <button
                          onClick={() => updateMember({ ...member, status: member.status === 'active' ? 'inactive' : 'active' })}
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            member.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {member.status}
                        </button>
                        {member.isChampion && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Champion
                          </span>
                        )}
                        {member.reseller && (
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResellerBadgeStyle(member.reseller)}`}>
                            {member.reseller}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="flex-shrink-0 h-4 w-4 mr-1" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 h-4 w-4 mr-1" />
                          {member.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        title="Edit member"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Delete member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex space-x-4">
                      <a href={`tel:${member.phone}`} className="text-gray-400 hover:text-gray-500">
                        <Phone className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add/Edit Team Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingMember(null);
                  setNewMember({
                    name: '',
                    role: '',
                    email: '',
                    phone: '',
                    location: '',
                    status: 'active',
                    isChampion: false,
                    imageUrl: DEFAULT_IMAGE,
                    reseller: null
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={newMember.imageUrl || DEFAULT_IMAGE}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Camera className="h-5 w-5 text-gray-500" />
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+351 912 345 678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <select
                  value={newMember.location}
                  onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a store</option>
                  {STORE_LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newMember.status}
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value as 'active' | 'inactive' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programs & Affiliations</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="champion-program"
                      checked={newMember.isChampion}
                      onChange={(e) => setNewMember({ ...newMember, isChampion: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="champion-program" className="ml-2 block text-sm text-gray-700">
                      Champion Program Member
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Reseller Affiliation</label>
                    <select
                      value={newMember.reseller || ''}
                      onChange={(e) => setNewMember({ ...newMember, reseller: e.target.value as typeof RESELLERS[number] | null })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {RESELLERS.map((reseller) => (
                        <option key={reseller} value={reseller}>
                          {reseller}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMember(null);
                    setNewMember({
                      name: '',
                      role: '',
                      email: '',
                      phone: '',
                      location: '',
                      status: 'active',
                      isChampion: false,
                      imageUrl: DEFAULT_IMAGE,
                      reseller: null
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;