// src/pages/CreateListing.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

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
  { value: 'pets', label: 'Pets OK' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  rent: '',
  deposit: '',
  roomType: '',
  availableFrom: '',
  preferredGender: 'any',
  smokingAllowed: false,
  petsAllowed: false,
  maxRoommates: 1,
  amenities: [],
};

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (val) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(val)
        ? prev.amenities.filter((a) => a !== val)
        : [...prev.amenities, val],
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.city.trim()) errors.city = 'City is required.';
    if (!form.rent) errors.rent = 'Rent is required.';
    if (!form.roomType) errors.roomType = 'Room type is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: form.title,
        description: form.description,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        rent: parseFloat(form.rent),
        deposit: parseFloat(form.deposit) || 0,
        roomType: form.roomType,
        availableFrom: form.availableFrom || undefined,
        preferredGender: form.preferredGender,
        smokingAllowed: form.smokingAllowed,
        petsAllowed: form.petsAllowed,
        maxRoommates: parseInt(form.maxRoommates) || 1,
        amenities: form.amenities,
      };

      const res = await API.post('/listings', payload);
      const listingId = res.data?.listing?._id || res.data?._id;

      // Upload photos if any
      if (photos.length > 0 && listingId) {
        const formData = new FormData();
        photos.forEach((p) => formData.append('photos', p));
        await API.post(`/listings/${listingId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/host/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create listing. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Listing</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Spacious private room in Koramangala"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {fieldErrors.title && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the room, house rules, neighbourhood..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </section>

          {/* Address */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Street address"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {fieldErrors.city && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </section>

          {/* Pricing & Type */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Pricing & Room Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent (₹/mo) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="rent"
                  value={form.rent}
                  onChange={handleChange}
                  placeholder="15000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {fieldErrors.rent && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.rent}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="30000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select type...</option>
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                  <option value="studio">Studio</option>
                  <option value="pg">PG</option>
                </select>
                {fieldErrors.roomType && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.roomType}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Roommates</label>
                <input
                  type="number"
                  name="maxRoommates"
                  value={form.maxRoommates}
                  onChange={handleChange}
                  min={1}
                  max={10}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
              <input
                type="date"
                name="availableFrom"
                value={form.availableFrom}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Preferences & Rules</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Gender</label>
              <select
                name="preferredGender"
                value={form.preferredGender}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm((p) => ({ ...p, smokingAllowed: !p.smokingAllowed }))}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    form.smokingAllowed ? 'bg-blue-600' : 'bg-gray-200'
                  } relative`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      form.smokingAllowed ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700">Smoking Allowed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm((p) => ({ ...p, petsAllowed: !p.petsAllowed }))}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    form.petsAllowed ? 'bg-blue-600' : 'bg-gray-200'
                  } relative`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      form.petsAllowed ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700">Pets Allowed</span>
              </label>
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <label key={a.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(a.value)}
                    onChange={() => handleAmenityToggle(a.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700">{a.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3">Photos</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photoPreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/host/dashboard')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
