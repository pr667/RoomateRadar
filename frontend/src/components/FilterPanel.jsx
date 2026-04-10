// src/components/FilterPanel.jsx

const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'ac', label: 'AC' },
  { value: 'parking', label: 'Parking' },
  { value: 'gym', label: 'Gym' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'security', label: 'Security' },
];

const ROOM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'private', label: 'Private' },
  { value: 'shared', label: 'Shared' },
  { value: 'studio', label: 'Studio' },
  { value: 'pg', label: 'PG' },
];

const SORT_OPTIONS = [
  { value: 'compatibility', label: 'Best Match' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function FilterPanel({ filters, onChange, onApply, onClear }) {
  const handleAmenityChange = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5 sticky top-20">
      <h2 className="text-gray-800 font-semibold text-base">Filters</h2>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
        <input
          type="text"
          value={filters.city || ''}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          placeholder="e.g. Bangalore"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Area / Locality */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Area / Locality</label>
        <input
          type="text"
          value={filters.area || ''}
          onChange={(e) => onChange({ ...filters, area: e.target.value })}
          placeholder="e.g. Koramangala"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Rent range */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Rent Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minRent || ''}
            onChange={(e) => onChange({ ...filters, minRent: e.target.value })}
            placeholder="Min"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            value={filters.maxRent || ''}
            onChange={(e) => onChange({ ...filters, maxRent: e.target.value })}
            placeholder="Max"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Room type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Room Type</label>
        <select
          value={filters.roomType || ''}
          onChange={(e) => onChange({ ...filters, roomType: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {ROOM_TYPES.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort by */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
        <select
          value={filters.sortBy || 'compatibility'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Amenities</label>
        <div className="grid grid-cols-2 gap-1.5">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.amenities || []).includes(a.value)}
                onChange={() => handleAmenityChange(a.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
              />
              <span className="text-xs text-gray-700">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
