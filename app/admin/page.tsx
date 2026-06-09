'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import AdminHeader from '@/components/AdminHeader';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);

  const [filter, setFilter] = useState('all');
  const [sortBy] = useState('created_at');
  const [sortOrder] = useState('desc');

  // =========================
  // AUTH + ROLE CHECK
  // =========================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/check-role', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        setAuthenticated(true);
        setRole(data?.role ?? null);
      } catch (err) {
        console.error('Admin auth check failed:', err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        rating: filter,
        sortBy,
        sortOrder,
      });

      const res = await fetchWithAuth(
        `/api/admin/assessments?${params}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch assessments');
      }

      const data = await res.json();
      setAssessments(data);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, filter]);

  // =========================
  // UI STATES
  // =========================
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!authenticated) {
    return <div className="p-6">Access denied</div>;
  }

  // =========================
  // UI
  // =========================
  return (
    <div>
      <AdminHeader />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>

        <p className="text-sm text-gray-500 mb-4">
          Role: {role ?? 'unknown'}
        </p>

        {/* CONTROLS */}
        <div className="flex gap-4 mb-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <button
            onClick={loadData}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Refresh
          </button>
        </div>

        {/* TABLE */}
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
                  <td className="p-4 text-center" colSpan={2}>
                    No data found
                  </td>
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