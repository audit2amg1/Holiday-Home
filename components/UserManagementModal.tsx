import React, { useState } from 'react';
import { Users, UserPlus, Trash2, X, Shield } from 'lucide-react';
import { User } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  users: User[];
  onClose: () => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ 
  isOpen, 
  users, 
  onClose, 
  onAddUser, 
  onDeleteUser 
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and password are required');
      return;
    }

    if (users.some(u => u.username === newUsername)) {
      setError('Username already exists');
      return;
    }

    onAddUser({
      username: newUsername,
      password: newPassword,
      isAdmin: false
    });

    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">User Management</h2>
              <p className="text-slate-400 text-sm">Create and remove system users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add User Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
              <UserPlus size={16} /> Add New User
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Username"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create User
              </button>
            </form>
          </div>

          {/* User List */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Existing Users</h3>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${user.isAdmin ? 'bg-red-500' : 'bg-slate-400'}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{user.username}</p>
                      {user.isAdmin && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1 w-fit"><Shield size={10}/> Admin</span>}
                    </div>
                  </div>
                  {!user.isAdmin && (
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;