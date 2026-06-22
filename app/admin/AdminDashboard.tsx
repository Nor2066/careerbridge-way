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
      const res = await fetch(`/api/admin/assessments?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch assessments');
      setAssessments(await res.json());
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <AdminHeader />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <div className="flex gap-4 mb-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Ratings</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <button onClick={loadData} className="px-3 py-1 bg-gray-200 rounded">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Email</th>
                <th className="p-2 border text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td className="p-4 text-center" colSpan={2}>No data found</td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2 border">{a.email}</td>
                    <td className="p-2 border">{a.feedback_rating}</td>
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