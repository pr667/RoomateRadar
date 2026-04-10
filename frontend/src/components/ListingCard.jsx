// src/components/ListingCard.jsx
import { Link } from 'react-router-dom';
import { formatRent, formatDate } from '../utils/formatters';
import MatchBadge from './MatchBadge';

const AMENITY_ICONS = {
  wifi: { label: 'WiFi', icon: '📶' },
  ac: { label: 'AC', icon: '❄️' },
  parking: { label: 'Parking', icon: '🅿️' },
  pets: { label: 'Pets', icon: '🐾' },
};

const ROOM_TYPE_COLORS = {
  private: 'bg-blue-100 text-blue-700',
  shared: 'bg-purple-100 text-purple-700',
  studio: 'bg-indigo-100 text-indigo-700',
  pg: 'bg-teal-100 text-teal-700',
};

export default function ListingCard({ listing, onShortlistToggle, isShortlisted }) {
  const photo = listing?.photos?.[0] || null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Photo */}
      <div className="relative h-48 w-full">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-4xl">🏠</span>
          </div>
        )}

        {/* Match badge overlay */}
        {listing?.compatibilityScore != null && (
          <div className="absolute top-2 right-2">
            <MatchBadge score={listing.compatibilityScore} />
          </div>
        )}

        {/* Shortlist heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onShortlistToggle && onShortlistToggle(listing._id);
          }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow hover:bg-opacity-100 transition"
          aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <span className={`text-lg ${isShortlisted ? 'text-red-500' : 'text-gray-400'}`}>
            {isShortlisted ? '♥' : '♡'}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
            {listing?.title || 'Untitled Listing'}
          </h3>
          {listing?.roomType && (
            <span
              className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                ROOM_TYPE_COLORS[listing.roomType] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {listing.roomType}
            </span>
          )}
        </div>

        <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
          <span>📍</span>
          <span>{listing?.address?.city || listing?.city || 'Location N/A'}</span>
        </p>

        {/* Rent */}
        <p className="text-blue-700 font-bold text-base mb-3">
          {formatRent(listing?.rent)}
        </p>

        {/* Amenity pills */}
        {listing?.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(AMENITY_ICONS).map(([key, { label, icon }]) =>
              listing.amenities.includes(key) ? (
                <span
                  key={key}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-0.5"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              ) : null
            )}
          </div>
        )}

        {/* Available from */}
        {listing?.availableFrom && (
          <p className="text-gray-400 text-xs mb-3">
            Available from:{' '}
            <span className="text-gray-600 font-medium">{formatDate(listing.availableFrom)}</span>
          </p>
        )}

        {/* View Details */}
        <div className="mt-auto">
          <Link
            to={`/listings/${listing?._id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
