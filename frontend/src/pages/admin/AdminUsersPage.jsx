import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Shield, Filter, UserCheck, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await adminAPI.getUsers(params);
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { is_active: !currentStatus });
      showToast(`User ${!currentStatus ? 'activated' : 'deactivated'}.`, 'success');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Directory & Governance</h1>
          <p className="text-xs text-slate-500">
            Activate, deactivate, audit, and regulate candidate and recruiter accounts.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search users by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="CANDIDATE">Candidates Only</option>
          <option value="RECRUITER">Recruiters Only</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading user directory...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No users found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Associated Entity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900">{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</p>
                        <p className="text-slate-400 text-[11px]">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                        u.role === 'RECRUITER' ? 'bg-blue-50 text-blue-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {u.company_name || 'Individual Profile'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
