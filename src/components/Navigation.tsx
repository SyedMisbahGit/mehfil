import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { label: 'Home', path: '/home', icon: '🏠' },
    { label: 'Qissa', path: '/qissa', icon: '📖' },
    { label: 'Tehqeeqat', path: '/tehqeeqat', icon: '🔍' },
    { label: 'Gupshup', path: '/gupshup', icon: '💬' },
    { label: 'Games', path: '/games', icon: '🎲' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: '🛡️' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-center p-2 bg-white/90 border-t border-amber-100">
      <ul className="flex gap-2 sm:gap-4">
        {navItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex flex-col items-center px-3 py-1 rounded-md text-xs font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-amber-200 text-amber-900' : 'text-gray-500 hover:bg-amber-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
