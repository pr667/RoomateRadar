// src/pages/Dashboard/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { formatDate, formatRent } from '../../utils/formatters';

const TABS = ['Stats', 'Users', 'Listings'];

const ROLE_COLORS = {
  seeker: 'bg-blue-100 text-blue-700',
  host: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

function StatCard({ label, value, icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Stats');

  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Listings state
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await API.get('/admin/stats');
      setStats(res.data?.stats || res.data);
    } catch {
      setError('Failed to load stats.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await API.get('/admin/users');
      setUsers(res.data?.users || res.data || []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      const res = await API.get('/admin/listings');
      setListings(res.data?.listings || res.data || []);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchListings();
  }, [fetchStats, fetchUsers, fetchListings]);

  const handleToggleUser = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await API.put(`/admin/users/${userId}/toggle`);
      const updated = res.data?.user || res.data;
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updated } : u))
      );
    } catch {
      setError('Failed to toggle user status.');
    } finally {
      setActionLoading('');
    }
  };

  const handleToggleListing = async (listingId) => {
    try {
      setActionLoading(listingId);
      const res = await API.put(`/admin/listings/${listingId}/toggle`);
      const updated = res.data?.listing || res.data;
      setListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, ...updated } : l))
      );
    } catch {
      setError('Failed to toggle listing status.');
    } finally {
      setActionLoading('');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = !userRoleFilter || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage users, listings, and platform stats.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {activeTab === 'Stats' && (
          <div>
            {loadingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border h-24" />
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers} icon="👥" color="blue" />
                <StatCard label="Seekers" value={stats.seekers} icon="🔍" color="indigo" />
                <StatCard label="Hosts" value={stats.hosts} icon="🏠" color="purple" />
                <StatCard label="Active Listings" value={stats.activeListings} icon="✅" color="green" />
                <StatCard label="Pending Requests" value={stats.pendingRequests} icon="⏳" color="yellow" />
                <StatCard label="Accepted Requests" value={stats.acceptedRequests} icon="🤝" color="green" />
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No stats available.</p>
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'Users' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Roles</option>
                <option value="seeker">Seeker</option>
                <option value="host">Host</option>
                <option value="admin">Admin</option>
              </select>
              <span className="text-gray-500 text-sm self-center">
                {filteredUsers.length} users
              </span>
            </div>

            {loadingUsers ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border h-12" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                    {u.name?.[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-800">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {u.createdAt ? formatDate(u.createdAt) : '—'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isSuspended ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                {u.isSuspended ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleToggleUser(u._id)}
                                  disabled={actionLoading === u._id}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                    u.isSuspended
                                      ? 'bg-green-50 hover:bg-green-100 text-green-700'
                                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                                  }`}
                                >
                                  {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings tab */}
        {activeTab === 'Listings' && (
          <div>
            {loadingListings ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border h-12" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{listings.length} total listings</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Host</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {listings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                            No listings found.
                          </td>
                        </tr>
                      ) : (
                        listings.map((l) => (
                          <tr key={l._id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {l.photos?.[0] ? (
                                  <img src={l.photos[0]} alt="" className="w-8 h-8 rounded-md object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-sm">🏠</div>
                                )}
                                <span className="text-sm font-medium text-gray-800 line-clamp-1 max-w-xs">
                                  {l.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {l.host?.name || '—'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {l.address?.city || l.city || '—'}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-blue-700">
                              {formatRent(l.rent)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {l.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleListing(l._id)}
                                disabled={actionLoading === l._id}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                  l.isActive !== false
                                    ? 'bg-red-50 hover:bg-red-100 text-red-600'
                                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                                }`}
                              >
                                {l.isActive !== false ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
