'use client';

import { logout } from '@/lib/logout';

export default function AdminHeader() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="font-bold">Admin</h1>

      <button
        onClick={logout}
        className="px-3 py-1 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}