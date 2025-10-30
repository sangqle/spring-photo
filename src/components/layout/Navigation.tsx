import React from 'react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <div className="text-white text-lg font-bold">
          Photo Platform
        </div>
        <div className="space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link href="/upload" className="text-gray-300 hover:text-white">Upload</Link>
          <Link href="/feed" className="text-gray-300 hover:text-white">Feed</Link>
          <Link href="/portfolio" className="text-gray-300 hover:text-white">Portfolio</Link>
          <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
          <Link href="/register" className="text-gray-300 hover:text-white">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;