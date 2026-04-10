// src/pages/ListingDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import MatchBadge from '../components/MatchBadge';
import RequestButton from '../components/RequestButton';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import { formatRent, formatDate, scoreColor } from '../utils/formatters';

const AMENITY_LABELS = {
  wifi: '📶 WiFi',
  ac: '❄️ AC',
  parking: '🅿️ Parking',
  gym: '🏋️ Gym',
  laundry: '🧺 Laundry',
  kitchen: '🍳 Kitchen',
  balcony: '🌿 Balcony',
  furnished: '🛋️ Furnished',
  security: '🔒 Security',
  pets: '🐾 Pets',
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);
  const [shortlisted, setShortlisted] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/listings/${id}`);
      setListing(res.data?.listing || res.data);
    } catch {
      setError('Failed to load listing details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchShortlistStatus = useCallback(async () => {
    try {
      const res = await API.get('/users/shortlist');
      const ids = (res.data?.shortlist || res.data || []).map((l) => l._id || l);
      setShortlisted(ids.includes(id));
    } catch {
      // non-critical
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
    fetchShortlistStatus();
  }, [fetchListing, fetchShortlistStatus]);

  const handleShortlistToggle = async () => {
    try {
      await API.put(`/users/shortlist/${id}`);
      setShortlisted((prev) => !prev);
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-72 bg-gray-200 rounded-xl" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <span className="text-5xl">😕</span>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Listing Not Found</h2>
          <p className="text-gray-500 mt-2">{error || 'This listing may have been removed.'}</p>
          <button
            onClick={() => navigate('/browse')}
            className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const photos = listing.photos?.length ? listing.photos : [];
  const host = listing.host || listing.owner || {};
  const score = listing.compatibilityScore;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium mb-5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: photos + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            <div>
              {photos.length > 0 ? (
                <>
                  <div className="h-72 sm:h-96 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={photos[activePhoto]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {photos.length > 1 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {photos.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhoto(idx)}
                          className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            activePhoto === idx ? 'border-blue-500' : 'border-transparent'
                          }`}
                        >
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-72 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-6xl">🏠</span>
                </div>
              )}
            </div>

            {/* Title & location */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-800">{listing.title}</h1>
                <button
                  onClick={handleShortlistToggle}
                  className="shrink-0 text-2xl leading-none"
                  aria-label="Shortlist"
                >
                  <span className={shortlisted ? 'text-red-500' : 'text-gray-300'}>
                    {shortlisted ? '♥' : '♡'}
                  </span>
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                <span>📍</span>
                {[
                  listing.address?.street,
                  listing.address?.city || listing.city,
                  listing.address?.state,
                  listing.address?.pincode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                  <p className="text-xs text-gray-500">Rent</p>
                  <p className="text-blue-700 font-bold text-lg">{formatRent(listing.rent)}</p>
                </div>
                {listing.deposit && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-gray-500">Deposit</p>
                    <p className="text-gray-700 font-bold text-lg">{formatRent(listing.deposit)}</p>
                  </div>
                )}
                {listing.roomType && (
                  <div className="bg-purple-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-purple-700 font-bold text-sm capitalize">{listing.roomType}</p>
                  </div>
                )}
                {listing.availableFrom && (
                  <div className="bg-green-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-green-700 font-bold text-sm">{formatDate(listing.availableFrom)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-2">About this place</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                    >
                      {AMENITY_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {listing.location?.coordinates && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Location</h2>
                <MapView
                  lat={listing.location.coordinates[1]}
                  lng={listing.location.coordinates[0]}
                  title={listing.title}
                  address={[
                    listing.address?.street,
                    listing.address?.city || listing.city,
                    listing.address?.state,
                  ].filter(Boolean).join(', ')}
                />
              </div>
            )}

            {/* Rules */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-3">House Rules & Preferences</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>{listing.smokingAllowed ? '✅' : '❌'}</span>
                  <span className="text-gray-700">Smoking</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{listing.petsAllowed ? '✅' : '❌'}</span>
                  <span className="text-gray-700">Pets</span>
                </div>
                {listing.preferredGender && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>👤</span>
                    <span className="text-gray-700 capitalize">
                      Preferred: {listing.preferredGender}
                    </span>
                  </div>
                )}
                {listing.maxRoommates && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>👥</span>
                    <span className="text-gray-700">Max {listing.maxRoommates} roommates</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: host card + compatibility + request */}
          <div className="space-y-5">
            {/* Compatibility score */}
            {score != null && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Compatibility
                </p>
                <p className={`text-4xl font-bold ${scoreColor(score)}`}>{score}%</p>
                <MatchBadge score={score} />
              </div>
            )}

            {/* Host card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-3">Listed by</h2>
              <div className="flex items-center gap-3 mb-3">
                {host.avatar ? (
                  <img
                    src={host.avatar}
                    alt={host.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {host.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{host.name || 'Host'}</p>
                  {host.trustScore != null && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.round(host.trustScore / 20)
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{host.trustScore}</span>
                    </div>
                  )}
                </div>
              </div>
              {host.bio && (
                <p className="text-gray-500 text-sm line-clamp-3 mb-3">{host.bio}</p>
              )}
            </div>

            {/* Request section */}
            {user && (host._id || host).toString() === user._id ? (
              <div className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-200 text-center">
                <p className="text-yellow-700 font-medium text-sm">This is your listing</p>
              </div>
            ) : user ? (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Interested?</h2>
                <RequestButton
                  listingId={listing._id}
                  hostId={host._id || host}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
