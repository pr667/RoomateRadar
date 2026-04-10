// src/pages/Dashboard/HostDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { formatRent, formatDate, scoreBg } from '../../utils/formatters';

const TABS = ['Overview', 'My Listings', 'Incoming Requests'];

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

export default function HostDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetchListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      const res = await API.get('/listings/my');
      setListings(res.data?.listings || res.data || []);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoadingListings(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await API.get('/requests/incoming');
      setRequests(res.data?.requests || res.data || []);
    } catch {
      setError('Failed to load requests.');
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchRequests();
  }, [fetchListings, fetchRequests]);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      setActionLoading(listingId + '_delete');
      await API.delete(`/listings/${listingId}`);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch {
      setError('Failed to delete listing.');
    } finally {
      setActionLoading('');
    }
  };

  const handleToggleActive = async (listingId) => {
    try {
      setActionLoading(listingId + '_toggle');
      const res = await API.put(`/listings/${listingId}/toggle`);
      const updated = res.data?.listing || res.data;
      setListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, ...updated } : l))
      );
    } catch {
      setError('Failed to update listing status.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setActionLoading(requestId + '_' + action);
      await API.put(`/requests/${requestId}`, {
        status: action === 'accept' ? 'accepted' : 'rejected',
      });
      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r
        )
      );
    } catch {
      setError('Failed to update request.');
    } finally {
      setActionLoading('');
    }
  };

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.isActive !== false).length,
    totalRequests: requests.length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Host Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Host'}
            </p>
          </div>
          <Link
            to="/create-listing"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> Create Listing
          </Link>
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
              {tab === 'Incoming Requests' &&
                requests.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {requests.filter((r) => r.status === 'pending').length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Listings" value={stats.totalListings} icon="🏠" color="blue" />
              <StatCard label="Active Listings" value={stats.activeListings} icon="✅" color="green" />
              <StatCard label="Total Requests" value={stats.totalRequests} icon="📨" color="blue" />
              <StatCard label="Accepted" value={stats.accepted} icon="🤝" color="green" />
            </div>
          </div>
        )}

        {/* My Listings tab */}
        {activeTab === 'My Listings' && (
          <div>
            {loadingListings ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse border flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm">
                <span className="text-4xl">🏠</span>
                <h3 className="font-semibold text-gray-700 mt-3">No listings yet</h3>
                <p className="text-gray-400 text-sm mt-1">Create your first listing to get started.</p>
                <Link
                  to="/create-listing"
                  className="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      {listing.photos?.[0] ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <span className="text-white text-2xl">🏠</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{listing.title}</p>
                      <p className="text-blue-700 text-sm font-bold">{formatRent(listing.rent)}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            listing.isActive !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {listing.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        {listing.views != null && (
                          <span className="text-xs text-gray-400">👁 {listing.views} views</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(listing._id)}
                        disabled={actionLoading === listing._id + '_toggle'}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {listing.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link
                        to={`/edit-listing/${listing._id}`}
                        className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/listings/${listing._id}`}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        disabled={actionLoading === listing._id + '_delete'}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming Requests tab */}
        {activeTab === 'Incoming Requests' && (
          <div>
            {loadingRequests ? (
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
                  When seekers apply to your listings, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const seeker = req.seeker || req.user || {};
                  return (
                    <div
                      key={req._id}
                      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-start gap-4">
                        {/* Seeker avatar */}
                        <Link to={`/user/${seeker._id}`} className="shrink-0 hover:opacity-80">
                          {seeker.avatar ? (
                            <img
                              src={seeker.avatar}
                              alt={seeker.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {seeker.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link to={`/user/${seeker._id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                              {seeker.name || 'Seeker'}
                            </Link>
                            {req.compatibilityScore != null && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg(req.compatibilityScore)}`}>
                                {req.compatibilityScore}% match
                              </span>
                            )}
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          {seeker.bio && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{seeker.bio}</p>
                          )}
                          {req.message && (
                            <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-gray-600 text-sm italic">"{req.message}"</p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs text-gray-400">
                              For: {req.listing?.title || 'Listing'}
                            </p>
                            {req.createdAt && (
                              <p className="text-xs text-gray-400">{formatDate(req.createdAt)}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0 flex-wrap">
                          <Link
                            to={`/user/${seeker._id}`}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            View Profile
                          </Link>
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRequestAction(req._id, 'accept')}
                                disabled={actionLoading === req._id + '_accept'}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRequestAction(req._id, 'reject')}
                                disabled={actionLoading === req._id + '_reject'}
                                className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
