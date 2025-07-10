import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;