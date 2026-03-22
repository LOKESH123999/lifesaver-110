import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (role) {
      case 'DONOR':
        return [
          { to: '/donor/dashboard', label: 'Dashboard' },
        ];
      case 'HOSPITAL':
        return [
          { to: '/hospital/dashboard', label: 'Dashboard' },
          { to: '/hospital/request/new', label: 'New Request' },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/hospitals', label: 'Hospitals' },
          { to: '/admin/donors', label: 'Donors' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              LifeSaver 110
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
