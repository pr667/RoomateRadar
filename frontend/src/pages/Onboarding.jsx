import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');

  // Step 1: Basic profile
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: '',
    avatar: null,
  });

  // Step 2: Preferences
  const [preferences, setPreferences] = useState({
    food: 'any',
    sleep: 'flexible',
    smoking: false,
    drinking: false,
    pets: false,
    gender: 'any',
    cleanliness: 3,
    noise: 'moderate',
    workSchedule: 'office',
    budgetMin: 10000,
    budgetMax: 50000,
    preferredLocations: [],
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (event) => setAvatarPreview(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'cleanliness' || name === 'budgetMin' || name === 'budgetMax'
          ? Number(value)
          : value,
    }));
  };

  const handleLocationChange = (e) => {
    const locations = e.target.value
      .split(',')
      .map((loc) => loc.trim())
      .filter((loc) => loc);
    setPreferences((prev) => ({ ...prev, preferredLocations: locations }));
  };

  const submitStep1 = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      // Upload avatar if provided
      let avatarUrl = user?.avatar || '';
      if (profile.avatar) {
        const formData = new FormData();
        formData.append('avatar', profile.avatar);

        const res = await API.post('/users/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = res.data.avatarUrl;
      }

      // Update profile
      await API.put('/users/profile', {
        name: profile.name,
        bio: profile.bio,
        avatar: avatarUrl,
      });

      setStep(2);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const submitStep2 = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      // Update preferences
      await API.put('/users/preferences', preferences);

      // Redirect based on role
      if (user?.role === 'host') {
        navigate('/host/dashboard');
      } else if (user?.role === 'seeker') {
        navigate('/browse');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to RoommateRadar</h1>
          <p className="text-gray-600">
            Complete your profile to find your perfect roommate (Step {step} of 2)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          <div
            className={`h-2 flex-1 rounded-full transition ${
              step >= 1 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
          <div
            className={`h-2 flex-1 rounded-full transition ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <form onSubmit={submitStep1} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 1: Your Profile</h2>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                About You (Bio)
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself... (hobbies, interests, etc.)"
              />
            </div>

            {/* Avatar Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt="Current avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Saving...' : 'Continue to Preferences →'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <form onSubmit={submitStep2} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 2: Your Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Food */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Food Habits</label>
                <select
                  name="food"
                  value={preferences.food}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="veg">Vegetarian</option>
                  <option value="nonveg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              {/* Sleep Schedule */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Sleep Schedule</label>
                <select
                  name="sleep"
                  value={preferences.sleep}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="early">Early Bird</option>
                  <option value="late">Night Owl</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                <select
                  name="gender"
                  value={preferences.gender}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Noise Level */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Noise Level</label>
                <select
                  name="noise"
                  value={preferences.noise}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="quiet">Quiet</option>
                  <option value="moderate">Moderate</option>
                  <option value="loud">Loud</option>
                </select>
              </div>

              {/* Cleanliness */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Cleanliness (1-5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    name="cleanliness"
                    min="1"
                    max="5"
                    value={preferences.cleanliness}
                    onChange={handlePreferenceChange}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-8 text-right">
                    {preferences.cleanliness}
                  </span>
                </div>
              </div>

              {/* Work Schedule */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Work Schedule</label>
                <select
                  name="workSchedule"
                  value={preferences.workSchedule}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="wfh">Work from Home</option>
                  <option value="office">Office</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Budget Min */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Min Budget (per month)
                </label>
                <input
                  type="number"
                  name="budgetMin"
                  value={preferences.budgetMin}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Budget Max */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Max Budget (per month)
                </label>
                <input
                  type="number"
                  name="budgetMax"
                  value={preferences.budgetMax}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="smoking"
                  checked={preferences.smoking}
                  onChange={handlePreferenceChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">I smoke</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="drinking"
                  checked={preferences.drinking}
                  onChange={handlePreferenceChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">I drink</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="pets"
                  checked={preferences.pets}
                  onChange={handlePreferenceChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">I have pets</span>
              </label>
            </div>

            {/* Preferred Locations */}
            <div className="mt-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Preferred Locations (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.preferredLocations.join(', ')}
                onChange={handleLocationChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Downtown, Midtown, Brooklyn"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Saving...' : 'Complete Onboarding ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
