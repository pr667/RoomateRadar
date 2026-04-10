// src/pages/Browse.jsx
import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import FilterPanel from '../components/FilterPanel';

const DEFAULT_FILTERS = {
  city: '',
  area: '',
  minRent: '',
  maxRent: '',
  roomType: '',
  amenities: [],
  sortBy: 'compatibility',
  page: 1,
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function Browse() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [listings, setListings] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchShortlist = useCallback(async () => {
    try {
      const res = await API.get('/users/shortlist');
      const ids = (res.data?.shortlist || res.data || []).map(
        (l) => l._id || l
      );
      setShortlist(ids);
    } catch {
      // non-critical
    }
  }, []);

  const fetchListings = useCallback(async (f) => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (f.city) params.city = f.city;
      if (f.area) params.area = f.area;
      if (f.minRent) params.minRent = f.minRent;
      if (f.maxRent) params.maxRent = f.maxRent;
      if (f.roomType) params.roomType = f.roomType;
      if (f.amenities?.length) params.amenities = f.amenities.join(',');
      if (f.sortBy) params.sortBy = f.sortBy;
      params.page = f.page || 1;
      params.limit = 9;

      const res = await API.get('/listings', { params });
      setListings(res.data?.listings || res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(appliedFilters);
    fetchShortlist();
  }, [appliedFilters, fetchListings, fetchShortlist]);

  const handleApply = () => {
    const newFilters = { ...filters, page: 1 };
    setAppliedFilters(newFilters);
    setSidebarOpen(false);
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSidebarOpen(false);
  };

  const handlePageChange = (newPage) => {
    const updated = { ...appliedFilters, page: newPage };
    setAppliedFilters(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShortlistToggle = async (listingId) => {
    try {
      await API.put(`/users/shortlist/${listingId}`);
      setShortlist((prev) =>
        prev.includes(listingId)
          ? prev.filter((id) => id !== listingId)
          : [...prev, listingId]
      );
    } catch {
      // silent fail
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Find Your Room</h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-0.5">
                {total} {total === 1 ? 'room' : 'rooms'} found
              </p>
            )}
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="lg:hidden flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 6a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop always visible, mobile toggleable */}
          <aside
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-72 shrink-0`}
          >
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onApply={handleApply}
              onClear={handleClear}
            />
          </aside>

          {/* Main grid */}
          <main className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-4">🏠</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No rooms found</h3>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or search in a different city.
                </p>
                <button
                  onClick={handleClear}
                  className="mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing._id}
                      listing={listing}
                      isShortlisted={shortlist.includes(listing._id)}
                      onShortlistToggle={handleShortlistToggle}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => handlePageChange(appliedFilters.page - 1)}
                      disabled={appliedFilters.page <= 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {appliedFilters.page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(appliedFilters.page + 1)}
                      disabled={appliedFilters.page >= totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
