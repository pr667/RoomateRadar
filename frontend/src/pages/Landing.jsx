import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (!user.isProfileComplete) {
        navigate('/onboarding');
      } else if (user.role === 'host') {
        navigate('/host/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/browse');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">RoommateRadar</h1>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-blue-600 font-semibold hover:bg-gray-100 rounded-lg transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded-lg transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Find Your Perfect Roommate
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Smart compatibility matching based on your lifestyle preferences
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Already a Member
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              Our algorithm matches you based on lifestyle, budget, and location
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Connect with potential roommates after mutual interest
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Trusted Community</h3>
            <p className="text-gray-600">
              Ratings and trust scores help you make informed decisions
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-12">
          <h3 className="text-3xl font-bold text-center mb-12">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
              <p className="font-semibold">Sign Up</p>
              <p className="text-gray-600 text-sm">Create your account</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
              <p className="font-semibold">Set Preferences</p>
              <p className="text-gray-600 text-sm">Tell us about yourself</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
              <p className="font-semibold">Browse Matches</p>
              <p className="text-gray-600 text-sm">See compatible listings</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
              <p className="font-semibold">Connect</p>
              <p className="text-gray-600 text-sm">Start your new chapter</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2026 RoommateRadar. Find your perfect match.</p>
        </div>
      </footer>
    </div>
  );
}
