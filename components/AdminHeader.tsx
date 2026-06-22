'use client';

import { logout } from '@/lib/logout';

export default function AdminHeader() {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-800">
      <h1 className="text-white font-bold text-lg">Admin</h1>
      <button
        onClick={logout}
        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  );
}