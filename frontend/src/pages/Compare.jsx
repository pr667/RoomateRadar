// src/pages/Compare.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import MatchBadge from '../components/MatchBadge';
import RequestButton from '../components/RequestButton';
import { formatRent, formatDate, scoreColor } from '../utils/formatters';

const AMENITY_LABELS = {
  wifi: 'WiFi',
  ac: 'AC',
  parking: 'Parking',
  gym: 'Gym',
  laundry: 'Laundry',
  kitchen: 'Kitchen',
  balcony: 'Balcony',
  furnished: 'Furnished',
  security: 'Security',
  pets: 'Pets',
};

const ALL_AMENITIES = Object.keys(AMENITY_LABELS);

export default function Compare() {
  const location = useLocation();
  const navigate = useNavigate();
  const ids = location.state?.ids || [];
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ids.length) {
      navigate('/shortlist');
      return;
    }
    const fetchAll = async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          ids.map((id) => API.get(`/listings/${id}`))
        );
        setListings(results.map((r) => r.data?.listing || r.data));
      } catch {
        setError('Failed to load listings for comparison.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);  // eslint-disable-line

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4 animate-pulse space-y-3">
                <div className="h-40 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/shortlist')}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Back to Shortlist
          </button>
        </div>
      </div>
    );
  }

  const rows = [
    {
      label: 'Photo',
      render: (l) => (
        l.photos?.[0] ? (
          <img src={l.photos[0]} alt={l.title} className="w-full h-32 object-cover rounded-lg" />
        ) : (
          <div className="w-full h-32 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-3xl">🏠</span>
          </div>
        )
      ),
    },
    {
      label: 'Rent',
      render: (l) => <span className="font-bold text-blue-700">{formatRent(l.rent)}</span>,
    },
    {
      label: 'Deposit',
      render: (l) => formatRent(l.deposit),
    },
    {
      label: 'Room Type',
      render: (l) => (
        <span className="capitalize bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
          {l.roomType || '—'}
        </span>
      ),
    },
    {
      label: 'City',
      render: (l) => l.address?.city || l.city || '—',
    },
    {
      label: 'Available From',
      render: (l) => (l.availableFrom ? formatDate(l.availableFrom) : '—'),
    },
    {
      label: 'Compatibility',
      render: (l) =>
        l.compatibilityScore != null ? (
          <div className="flex flex-col items-center gap-1">
            <span className={`text-2xl font-bold ${scoreColor(l.compatibilityScore)}`}>
              {l.compatibilityScore}%
            </span>
            <MatchBadge score={l.compatibilityScore} />
          </div>
        ) : (
          '—'
        ),
    },
    {
      label: 'Smoking',
      render: (l) => (l.smokingAllowed ? '✅ Allowed' : '❌ Not allowed'),
    },
    {
      label: 'Pets',
      render: (l) => (l.petsAllowed ? '✅ Allowed' : '❌ Not allowed'),
    },
    {
      label: 'Preferred Gender',
      render: (l) => <span className="capitalize">{l.preferredGender || 'Any'}</span>,
    },
    ...ALL_AMENITIES.map((a) => ({
      label: AMENITY_LABELS[a],
      render: (l) =>
        l.amenities?.includes(a) ? (
          <span className="text-green-600 font-semibold">✓</span>
        ) : (
          <span className="text-gray-300">✗</span>
        ),
    })),
    {
      label: 'Request',
      render: (l) => (
        <RequestButton
          listingId={l._id}
          hostId={l.host?._id || l.host || l.owner?._id || l.owner}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/shortlist')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shortlist
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Compare Listings</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-32 sm:w-40 text-left py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-100 rounded-tl-xl">
                  Feature
                </th>
                {listings.map((l) => (
                  <th
                    key={l._id}
                    className="py-3 px-4 text-sm font-semibold text-gray-800 bg-white border-b border-gray-100"
                  >
                    <span className="line-clamp-2">{l.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.label}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-600 border-r border-gray-100">
                    {row.label}
                  </td>
                  {listings.map((l) => (
                    <td key={l._id} className="py-3 px-4 text-sm text-gray-700 text-center">
                      {row.render(l)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
