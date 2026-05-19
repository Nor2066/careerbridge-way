'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, 1-5
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleLogin = () => {
    // Simple password check (in production, use env var on server side)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      fetchAssessments();
    } else {
      alert('Wrong password');
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    let query = supabase
      .from('assessments')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (filter !== 'all') {
      query = query.eq('feedback_rating', parseInt(filter));
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      alert('Error fetching data');
    } else {
      setAssessments(data || []);
    }
    setLoading(false);
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
        <button
          onClick={handleLogin}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-4 mb-4">
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
            {assessments.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="border p-2">{new Date(item.created_at).toLocaleString()}</td>
                <td className="border p-2">{item.email}</td>
                <td className="border p-2 text-center">{item.feedback_rating}</td>
                <td className="border p-2 max-w-xs truncate">{item.feedback_comment || '-'}</td>
                <td className="border p-2">
                  {item.top_clusters?.map((c: any) => `${c.cluster} (${c.percentage}%)`).join(', ') || '-'}
                </td>
                <td className="border p-2">
                  {item.raw_scores ? Object.entries(item.raw_scores).slice(0,3).map(([k,v]) => `${k}:${v}`).join(', ') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}