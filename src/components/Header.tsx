import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookmarkCheck, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="hidden md:flex justify-between items-center p-4 bg-white border-b">
      <Link to="/" className="text-2xl font-bold text-burgundy-500">GoTrotro</Link>
      <nav className="flex gap-6">
        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-burgundy-500">
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link to="/saved" className="flex items-center gap-2 text-gray-700 hover:text-burgundy-500">
          <BookmarkCheck size={18} />
          <span>Saved Routes</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-2 text-gray-700 hover:text-burgundy-500">
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
