import React, { useState } from 'react';
import { Save, UserPlus, Trash2, X, AlertCircle, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ASC_MEMBERS } from '../constants/team';

const Settings = () => {
  const { addUser, updateUser, deleteUser, users, user: currentUser, isOffline } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: '',
    store: ''
  });

  const handleASCMemberSelect = (member: typeof ASC_MEMBERS[0]) => {
    setNewUser({
      ...newUser,
      name: member.name,
      role: member.role,
      store: member.defaultStore,
      username: member.name.toLowerCase().replace(/\s+/g, '.')
    });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user.id);
    setNewUser({
      username: user.username,
      password: '', // Don't populate password for security
      name: user.name,
      role: user.role,
      store: user.store
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setModalError(null);
      if (!newUser.username || (!editingUser && !newUser.password) || !newUser.name || !newUser.role || !newUser.store) {
        throw new Error('All fields are required');
      }

      if (editingUser) {
        await updateUser(editingUser, newUser);
      } else {
        await addUser(newUser);
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: '',
        store: ''
      });
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalError(null);
    setNewUser({
      username: '',
      password: '',
      name: '',
      role: '',
      store: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="space-y-8">
            {/* User Management Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add User
                </button>
              </div>

              {isOffline && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Operating in offline mode. Changes will be synced when connection is restored.</span>
                  </div>
                </div>
              )}

              <div className="mt-4 divide-y divide-gray-200">
                {users.map((user) => (
                  <div key={user.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.role} • {user.store}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        title="Edit user"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                          title="Delete user"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add/Edit User Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {modalError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                      {modalError}
                    </div>
                  )}

                  {/* ASC Members Select */}
                  {!editingUser && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Apple ASC</label>
                      <select
                        onChange={(e) => {
                          const member = ASC_MEMBERS.find(m => m.name === e.target.value);
                          if (member) handleASCMemberSelect(member);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={newUser.name}
                      >
                        <option value="">Select ASC member</option>
                        {ASC_MEMBERS.map(member => (
                          <option key={member.name} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={editingUser !== null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <input
                        type="text"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Store</label>
                      <input
                        type="text"
                        value={newUser.store}
                        onChange={(e) => setNewUser({ ...newUser, store: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingUser ? 'Update User' : 'Add User'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Store Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValue="Apple ASC Store"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValue="Porto, Portugal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValue="contact@appleascstore.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValue="+351 912 345 678"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;