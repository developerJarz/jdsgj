"use client";

import React, { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Customer & User Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">Roster of registered beauty shoppers, rewards, and staff roles</p>
      </div>

      {/* Search and Summary */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search by customer name, mobile phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sg-pink"
        />
        <span className="text-xs text-gray-400 font-semibold">{filtered.length} Total Users</span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading customer roster from MongoDB...</div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Reward Points</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 block">{user.name}</span>
                      <span className="text-[10px] text-gray-400">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 block">📱 {user.phone}</span>
                      {user.email && <span className="text-gray-400 text-[11px]">{user.email}</span>}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-black text-amber-600">
                        🎁 {user.rewardPoints || 0} pts
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-gray-100 text-gray-800">
                        {user.orderCount || 0} orders
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        className="px-3 py-1 bg-gray-100 hover:bg-sg-pink hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {user.role === 'admin' ? 'Demote to Customer' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
