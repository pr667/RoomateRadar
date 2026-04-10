import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  // Profile fields
  const [form, setForm] = useState({
    name: '',
    bio: '',
    phone: '',
  });

  // Preferences fields
  const [prefs, setPrefs] = useState({
    food: 'any',
    sleep: 'flexible',
    smoking: false,
    drinking: false,
    pets: false,
    gender: 'any',
    cleanliness: 3,
    noise: 'moderate',
    workSchedule: 'office',
    budgetMin: 0,
    budgetMax: 50000,
    preferredLocations: [],
  });

  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
      });
      if (user.preferences) {
        setPrefs({
          food: user.preferences.food || 'any',
          sleep: user.preferences.sleep || 'flexible',
          smoking: user.preferences.smoking || false,
          drinking: user.preferences.drinking || false,
          pets: user.preferences.pets || false,
          gender: user.preferences.gender || 'any',
          cleanliness: user.preferences.cleanliness || 3,
          noise: user.preferences.noise || 'moderate',
          workSchedule: user.preferences.workSchedule || 'office',
          budgetMin: user.preferences.budgetMin || 0,
          budgetMax: user.preferences.budgetMax || 50000,
          preferredLocations: user.preferences.preferredLocations || [],
        });
      }
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await API.post('/users/upload-avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.user);
      setMsg('Avatar updated!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      // Update profile
      const profileRes = await API.put('/users/profile', form);
      // Update preferences
      const prefsRes = await API.put('/users/preferences', prefs);
      setUser(prefsRes.data.user);
      setEditing(false);
      setMsg('Profile saved successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const addLocation = () => {
    const loc = locationInput.trim();
    if (loc && !prefs.preferredLocations.includes(loc)) {
      setPrefs({ ...prefs, preferredLocations: [...prefs.preferredLocations, loc] });
    }
    setLocationInput('');
  };

  const removeLocation = (loc) => {
    setPrefs({ ...prefs, preferredLocations: prefs.preferredLocations.filter((l) => l !== loc) });
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const pillBtn = (label, value, current, onChange) => (
    <button
      type="button"
      disabled={!editing}
      onClick={() => onChange(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        current === value
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
      } ${!editing ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
    >
      {label}
    </button>
  );

  const toggleBtn = (label, field) => (
    <button
      type="button"
      disabled={!editing}
      onClick={() => setPrefs({ ...prefs, [field]: !prefs[field] })}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        prefs[field]
          ? 'bg-green-600 text-white border-green-600'
          : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
      } ${!editing ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
    >
      {label}: {prefs[field] ? 'Yes' : 'No'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200">
                  {initials}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-medium">
                  {uploading ? '...' : 'Edit'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
                {user?.role}
              </span>
            </div>

            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                editing
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? 'Saving...' : editing ? 'Save' : 'Edit Profile'}
            </button>
          </div>

          {msg && (
            <p className={`mt-3 text-sm font-medium ${msg.includes('fail') ? 'text-red-600' : 'text-green-600'}`}>
              {msg}
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle Preferences</h2>

          {/* Food */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Food</label>
            <div className="flex flex-wrap gap-2">
              {pillBtn('Veg', 'veg', prefs.food, (v) => setPrefs({ ...prefs, food: v }))}
              {pillBtn('Non-Veg', 'nonveg', prefs.food, (v) => setPrefs({ ...prefs, food: v }))}
              {pillBtn('Vegan', 'vegan', prefs.food, (v) => setPrefs({ ...prefs, food: v }))}
              {pillBtn('Any', 'any', prefs.food, (v) => setPrefs({ ...prefs, food: v }))}
            </div>
          </div>

          {/* Sleep */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Schedule</label>
            <div className="flex flex-wrap gap-2">
              {pillBtn('Early Bird', 'early', prefs.sleep, (v) => setPrefs({ ...prefs, sleep: v }))}
              {pillBtn('Night Owl', 'late', prefs.sleep, (v) => setPrefs({ ...prefs, sleep: v }))}
              {pillBtn('Flexible', 'flexible', prefs.sleep, (v) => setPrefs({ ...prefs, sleep: v }))}
            </div>
          </div>

          {/* Work Schedule */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Schedule</label>
            <div className="flex flex-wrap gap-2">
              {pillBtn('WFH', 'wfh', prefs.workSchedule, (v) => setPrefs({ ...prefs, workSchedule: v }))}
              {pillBtn('Office', 'office', prefs.workSchedule, (v) => setPrefs({ ...prefs, workSchedule: v }))}
              {pillBtn('Hybrid', 'hybrid', prefs.workSchedule, (v) => setPrefs({ ...prefs, workSchedule: v }))}
            </div>
          </div>

          {/* Noise */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Noise Tolerance</label>
            <div className="flex flex-wrap gap-2">
              {pillBtn('Quiet', 'quiet', prefs.noise, (v) => setPrefs({ ...prefs, noise: v }))}
              {pillBtn('Moderate', 'moderate', prefs.noise, (v) => setPrefs({ ...prefs, noise: v }))}
              {pillBtn('Loud', 'loud', prefs.noise, (v) => setPrefs({ ...prefs, noise: v }))}
            </div>
          </div>

          {/* Gender Preference */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Roommate Gender</label>
            <div className="flex flex-wrap gap-2">
              {pillBtn('Male', 'male', prefs.gender, (v) => setPrefs({ ...prefs, gender: v }))}
              {pillBtn('Female', 'female', prefs.gender, (v) => setPrefs({ ...prefs, gender: v }))}
              {pillBtn('Any', 'any', prefs.gender, (v) => setPrefs({ ...prefs, gender: v }))}
            </div>
          </div>

          {/* Toggles */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Habits</label>
            <div className="flex flex-wrap gap-2">
              {toggleBtn('Smoking', 'smoking')}
              {toggleBtn('Drinking', 'drinking')}
              {toggleBtn('Pets', 'pets')}
            </div>
          </div>

          {/* Cleanliness */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cleanliness (1-5): <span className="text-blue-600 font-bold">{prefs.cleanliness}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={prefs.cleanliness}
              disabled={!editing}
              onChange={(e) => setPrefs({ ...prefs, cleanliness: Number(e.target.value) })}
              className="w-full max-w-xs"
            />
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (INR)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={prefs.budgetMin}
                disabled={!editing}
                onChange={(e) => setPrefs({ ...prefs, budgetMin: Number(e.target.value) })}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
                placeholder="Min"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                value={prefs.budgetMax}
                disabled={!editing}
                onChange={(e) => setPrefs({ ...prefs, budgetMax: Number(e.target.value) })}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Preferred Locations */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {prefs.preferredLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {loc}
                  {editing && (
                    <button onClick={() => removeLocation(loc)} className="text-blue-500 hover:text-red-500 font-bold">
                      x
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Type a location and press Enter"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cancel button when editing */}
        {editing && (
          <div className="flex justify-end gap-3 mb-8">
            <button
              onClick={() => {
                setEditing(false);
                // Reset form to current user data
                setForm({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' });
                if (user?.preferences) {
                  setPrefs({
                    food: user.preferences.food || 'any',
                    sleep: user.preferences.sleep || 'flexible',
                    smoking: user.preferences.smoking || false,
                    drinking: user.preferences.drinking || false,
                    pets: user.preferences.pets || false,
                    gender: user.preferences.gender || 'any',
                    cleanliness: user.preferences.cleanliness || 3,
                    noise: user.preferences.noise || 'moderate',
                    workSchedule: user.preferences.workSchedule || 'office',
                    budgetMin: user.preferences.budgetMin || 0,
                    budgetMax: user.preferences.budgetMax || 50000,
                    preferredLocations: user.preferences.preferredLocations || [],
                  });
                }
              }}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
