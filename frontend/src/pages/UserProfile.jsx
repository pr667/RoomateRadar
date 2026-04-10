import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${id}`);
        setProfile(res.data?.user || res.data);
      } catch {
        setError('User not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const prefLabel = (key, val) => {
    const labels = {
      food: { veg: 'Vegetarian', nonveg: 'Non-Veg', vegan: 'Vegan', any: 'Any' },
      sleep: { early: 'Early Bird', late: 'Night Owl', flexible: 'Flexible' },
      noise: { quiet: 'Quiet', moderate: 'Moderate', loud: 'Loud' },
      workSchedule: { wfh: 'Work from Home', office: 'Office', hybrid: 'Hybrid' },
      gender: { male: 'Male', female: 'Female', any: 'Any' },
    };
    return labels[key]?.[val] || String(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-red-500">{error || 'User not found'}</p>
          <Link to="/" className="text-blue-600 text-sm mt-2 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  const prefs = profile.preferences || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-blue-700">{profile.name}</h1>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
                {profile.role}
              </span>
              {profile.trustScore > 0 && (
                <span className="ml-2 text-sm text-yellow-600 font-medium">
                  {'★'.repeat(Math.round(profile.trustScore))} ({profile.totalRatings} ratings)
                </span>
              )}
            </div>
          </div>
          {profile.bio && (
            <p className="mt-4 text-gray-800 text-sm leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Preferences */}
        {profile.isProfileComplete && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-blue-700 mb-4">Lifestyle Preferences</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Food</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefLabel('food', prefs.food)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Sleep</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefLabel('sleep', prefs.sleep)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Work</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefLabel('workSchedule', prefs.workSchedule)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Noise</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefLabel('noise', prefs.noise)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Gender Pref</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefLabel('gender', prefs.gender)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Cleanliness</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefs.cleanliness || 3}/5</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Smoking</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefs.smoking ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Drinking</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefs.drinking ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Pets</p>
                <p className="text-sm font-medium gray-900 font-semibold mt-0.5">{prefs.pets ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {prefs.budgetMin != null && prefs.budgetMax != null && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Budget Range</p>
                <p className="text-sm font-bold text-green-600 mt-0.5">
                  ₹{prefs.budgetMin?.toLocaleString('en-IN')} – ₹{prefs.budgetMax?.toLocaleString('en-IN')}/mo
                </p>
              </div>
            )}

            {prefs.preferredLocations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold mb-2">Preferred Locations</p>
                <div className="flex flex-wrap gap-2">
                  {prefs.preferredLocations.map((loc) => (
                    <span key={loc} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
