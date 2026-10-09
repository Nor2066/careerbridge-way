'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/logout';

const LINKS = [
  { href: '/admin', label: 'Feedback' },
  { href: '/admin/universities', label: 'Universities' },
];

export default function AdminHeader() {
  const pathname = usePathname();
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-6">
        <h1 className="text-white font-bold text-lg">Admin</h1>
        <nav className="flex gap-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${pathname === l.href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        onClick={logout}
        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  );
}
