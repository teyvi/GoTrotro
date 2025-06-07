import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, BookmarkCheck, Settings } from 'lucide-react';
import { cn } from '../lib/utils'

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Routes', path: '/routes', icon: MapPin },
    { name: 'Saved', path: '/saved', icon: BookmarkCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs",
              location.pathname === item.path
                ? "text-burgundy-500 font-medium"
                : "text-gray-600"
            )}
          >
            <item.icon size={24} className="mb-1" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;