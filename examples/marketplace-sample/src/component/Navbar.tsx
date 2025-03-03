'use client';

import Link from 'next/link';
export default function Navbar() {
    return (
        <nav className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl shadow-sm w-screen">
        <div className="text-xl font-bold">Immutable</div>
        <div className="flex gap-4">
          <Link href="/home" className="px-4 py-2 hover:text-gray-600">Home</Link>
          <Link href="/marketplace" className="px-4 py-2 hover:text-gray-600">Marketplace</Link>
          <Link href="/profile" className="px-4 py-2 hover:text-gray-600">Profile</Link>
        </div>
      </nav>
    );
}