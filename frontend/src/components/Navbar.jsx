// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const homeLink =
    user?.role === 'host'
      ? '/host/dashboard'
      : user?.role === 'admin'
      ? '/admin/dashboard'
      : '/browse';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const seekerLinks = [
    { to: '/browse', label: 'Browse' },
    { to: '/shortlist', label: 'Shortlist' },
    { to: '/chat', label: 'Chat' },
    { to: '/seeker/dashboard', label: 'Dashboard' },
  ];

  const hostLinks = [
    { to: '/host/dashboard', label: 'My Listings' },
    { to: '/create-listing', label: 'Create Listing' },
    { to: '/chat', label: 'Chat' },
  ];

  const adminLinks = [{ to: '/admin/dashboard', label: 'Admin Dashboard' }];

  const links =
    user?.role === 'host'
      ? hostLinks
      : user?.role === 'admin'
      ? adminLinks
      : seekerLinks;

  return (
    <nav className="sticky top-0 z-50 bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-white font-bold text-xl tracking-tight hover:text-blue-100 transition-colors"
          >
            RoommateRadar
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: avatar + logout */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="text-blue-100 text-sm font-medium">{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 px-4 pb-4 pt-2 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block text-blue-100 hover:text-white text-sm font-medium py-1"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 pt-2 border-t border-blue-600 hover:opacity-80">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <span className="text-blue-100 text-sm">{user?.name}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-white font-semibold bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
