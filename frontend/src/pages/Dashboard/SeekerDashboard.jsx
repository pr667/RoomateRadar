// src/pages/Dashboard/SeekerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { formatDate, scoreBg } from '../../utils/formatters';

const TABS = ['Overview', 'My Requests', 'Shortlist', 'Profile'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

function StatCard({ label, value, icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
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

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [requests, setRequests] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingShort, setLoadingShort] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingReq(true);
      const res = await API.get('/requests/my');
      setRequests(res.data?.requests || res.data || []);
    } catch {
      // silent
    } finally {
      setLoadingReq(false);
    }
  }, []);

  const fetchShortlist = useCallback(async () => {
    try {
      setLoadingShort(true);
      const res = await API.get('/users/shortlist');
      setShortlist(res.data?.shortlist || res.data || []);
    } catch {
      // silent
    } finally {
      setLoadingShort(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchShortlist();
  }, [fetchRequests, fetchShortlist]);

  const handleWithdraw = async (requestId) => {
    try {
      await API.delete(`/requests/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch {
      // silent
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await API.put('/users/profile', profile);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch {
      setProfileMsg('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const stats = {
    total: requests.length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    pending: requests.filter((r) => r.status === 'pending').length,
    shortlisted: shortlist.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your room search.</p>
        </div>

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

        {/* Overview tab */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Requests" value={stats.total} icon="📨" color="blue" />
              <StatCard label="Accepted" value={stats.accepted} icon="✅" color="green" />
              <StatCard label="Pending" value={stats.pending} icon="⏳" color="yellow" />
              <StatCard label="Shortlisted" value={stats.shortlisted} icon="❤️" color="purple" />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/browse"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Browse Rooms
                </Link>
                <Link
                  to="/shortlist"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  View Shortlist
                </Link>
                <Link
                  to="/chat"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Messages
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* My Requests tab */}
        {activeTab === 'My Requests' && (
          <div>
            {loadingReq ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse border">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm">
                <span className="text-4xl">📭</span>
                <h3 className="font-semibold text-gray-700 mt-3">No requests yet</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Browse rooms and send requests to get started.
                </p>
                <Link
                  to="/browse"
                  className="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  Browse Rooms
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                  >
                    {/* Listing photo */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      {req.listing?.photos?.[0] ? (
                        <img
                          src={req.listing.photos[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <span className="text-white text-xl">🏠</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {req.listing?.title || 'Listing'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Host: {req.host?.name || 'Unknown'}
                      </p>
                      {req.createdAt && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          Sent {formatDate(req.createdAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {req.compatibilityScore != null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg(req.compatibilityScore)}`}>
                          {req.compatibilityScore}%
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                          STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(req._id)}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shortlist tab */}
        {activeTab === 'Shortlist' && (
          <div>
            {loadingShort ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse border">
                    <div className="h-32 bg-gray-200 rounded mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : shortlist.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm">
                <span className="text-4xl">💔</span>
                <h3 className="font-semibold text-gray-700 mt-3">No shortlisted rooms</h3>
                <Link
                  to="/browse"
                  className="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  Browse Rooms
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlist.map((listing) => {
                  const id = listing._id || listing;
                  const photo = listing.photos?.[0];
                  return (
                    <Link
                      key={id}
                      to={`/listings/${id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-32">
                        {photo ? (
                          <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                          {listing.title || 'Listing'}
                        </p>
                        <p className="text-blue-700 text-sm font-bold mt-1">
                          ₹{listing.rent?.toLocaleString('en-IN')}/mo
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === 'Profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Edit Profile</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                {profileMsg && (
                  <p className={`text-sm ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                    {profileMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Your Preferences</h3>
              {user?.preferences ? (
                <div className="space-y-2 text-sm text-gray-600">
                  {Object.entries(user.preferences).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium text-gray-700 capitalize">
                        {Array.isArray(val) ? val.join(', ') || '—' : String(val) || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No preferences set yet.</p>
                  <Link
                    to="/onboarding"
                    className="inline-block mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Complete Onboarding
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
