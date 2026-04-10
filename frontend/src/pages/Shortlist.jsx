// src/pages/Shortlist.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';

export default function Shortlist() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        setLoading(true);
        const res = await API.get('/users/shortlist');
        setListings(res.data?.shortlist || res.data || []);
      } catch {
        setError('Failed to load your shortlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchShortlist();
  }, []);

  const handleRemove = async (listingId) => {
    try {
      await API.put(`/users/shortlist/${listingId}`);
      setListings((prev) => prev.filter((l) => (l._id || l) !== listingId));
      setSelected((prev) => prev.filter((id) => id !== listingId));
    } catch {
      // silent fail
    }
  };

  const handleSelectToggle = (listingId) => {
    setSelected((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleCompare = () => {
    navigate('/compare', { state: { ids: selected } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-9 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Shortlist</h1>
            <p className="text-gray-500 text-sm mt-0.5">{listings.length} saved listings</p>
          </div>
          {selected.length >= 2 && (
            <button
              onClick={handleCompare}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Compare ({selected.length})
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        {listings.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">💔</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Your shortlist is empty</h3>
            <p className="text-gray-400 text-sm">
              Browse listings and heart the ones you like.
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Rooms
            </button>
          </div>
        ) : (
          <>
            {selected.length > 0 && selected.length < 2 && (
              <p className="text-blue-600 text-sm mb-4 bg-blue-50 px-4 py-2 rounded-lg">
                Select one more listing to compare.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => {
                const id = listing._id || listing;
                const isSelected = selected.includes(id);
                return (
                  <div key={id} className="relative">
                    {/* Compare checkbox overlay */}
                    <button
                      onClick={() => handleSelectToggle(id)}
                      className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300 hover:border-blue-400'
                      }`}
                      title={isSelected ? 'Deselect' : 'Select for comparison'}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <ListingCard
                      listing={listing}
                      isShortlisted={true}
                      onShortlistToggle={handleRemove}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
