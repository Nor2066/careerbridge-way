// app/admin/AdminDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const sortBy = 'created_at';
  const sortOrder = 'desc';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ rating: filter, sortBy, sortOrder });
      const res = await fetch(`/api/admin/assessments?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch assessments');
      setAssessments(await res.json());
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AdminHeader />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

        <div className="flex gap-3 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Ratings</option>
            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-300 text-sm uppercase tracking-wide">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={2}>No data found</td>
                </tr>
              ) : (
                assessments.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}>
                    <td className="p-3 text-gray-200">{a.email}</td>
                    <td className="p-3 text-indigo-400 font-semibold">{a.feedback_rating ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}