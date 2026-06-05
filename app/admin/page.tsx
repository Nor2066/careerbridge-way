'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';   // ✅ new import

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // ✅ replaced fetch with fetchWithAuth
      const res = await fetchWithAuth('/api/admin/check', { credentials: 'include' });
      if (res.ok) {
        setAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    // ✅ replaced fetch with fetchWithAuth
    const res = await fetchWithAuth('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      router.refresh();
    } else {
      alert('Wrong password');
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ rating: filter, sortBy, sortOrder });
      // ✅ replaced fetch with fetchWithAuth
      const res = await fetchWithAuth(`/api/admin/assessments?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAssessments();
    }
  }, [authenticated, filter, sortBy, sortOrder]);

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto p-6 mt-20">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 w-full p-2 border rounded"
        />
        <button onClick={handleLogin} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-sm">Filter by rating:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All</option>
            <option value="1">1 star</option>
            <option value="2">2 stars</option>
            <option value="3">3 stars</option>
            <option value="4">4 stars</option>
            <option value="5">5 stars</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded p-1"
          >
            <option value="created_at">Date</option>
            <option value="feedback_rating">Rating</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded p-1"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <button onClick={fetchAssessments} className="self-end px-3 py-1 bg-gray-200 rounded">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Rating</th>
              <th className="border p-2">Comment</th>
              <th className="border p-2">Top Clusters</th>
              <th className="border p-2">Raw Scores (top 3)</th>
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">No assessments found</td>
              </tr>
            ) : (
              assessments.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="border p-2">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="border p-2">{item.email}</td>
                  <td className="border p-2 text-center">{item.feedback_rating ?? '-'}</td>
                  <td className="border p-2 max-w-xs truncate">{item.feedback_comment || '-'}</td>
                  <td className="border p-2">
                    {item.top_clusters?.map((c: any) => `${c.cluster} (${c.percentage}%)`).join(', ') || '-'}
                  </td>
                  <td className="border p-2">
                    {item.raw_scores
                      ? Object.entries(item.raw_scores as Record<string, number>)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([k, v]) => `${k}:${v}`)
                          .join(', ')
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}