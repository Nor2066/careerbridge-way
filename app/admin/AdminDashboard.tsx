// app/admin/AdminDashboard.tsx
'use client';

// Shows the feedback people leave after a report.
//
// It previously rendered two columns, email and rating, which left out the one
// column with anything in it. Of 12 rows, exactly one has a rating — the rest
// are submissions where somebody wrote a comment and never picked a number, so
// the table looked empty while holding every piece of written feedback the
// product has ever received.
//
// The counts along the top matter more than the table for day-to-day use: an
// average rating that moves is the first sign a change helped or hurt.

import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/AdminHeader';

type FeedbackRow = {
  id: string;
  created_at: string | null;
  email: string | null;
  feedback_rating: number | null;
  feedback_comment: string | null;
};

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const sortBy = 'created_at';
  const sortOrder = 'desc';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ rating: filter, sortBy, sortOrder });
      const res = await fetch(`/api/admin/assessments?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setAssessments(await res.json());
    } catch (err) {
      // Was logged to the console only, so a failed load looked identical to
      // "no feedback yet" — which is exactly the wrong conclusion to let
      // somebody draw from an empty admin table.
      console.error('Load data error:', err);
      setError('Could not load feedback. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const rated = assessments.filter((a) => a.feedback_rating != null);
  const withComment = assessments.filter((a) => a.feedback_comment?.trim());
  const average =
    rated.length > 0
      ? (rated.reduce((sum, a) => sum + (a.feedback_rating ?? 0), 0) / rated.length).toFixed(1)
      : '—';

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AdminHeader />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Feedback</h1>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Submissions', value: assessments.length },
            { label: 'With a comment', value: withComment.length },
            { label: 'Average rating', value: average },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All ratings</option>
            {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full min-w-[46rem]">
            <thead>
              <tr className="bg-gray-800 text-gray-300 text-sm uppercase tracking-wide">
                <th className="p-3 text-left">When</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">What they said</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={4}>
                    {filter === 'all'
                      ? 'No feedback yet.'
                      : `No feedback with a rating of ${filter}.`}
                  </td>
                </tr>
              ) : (
                assessments.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`align-top ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}
                  >
                    <td className="p-3 text-sm text-gray-400 whitespace-nowrap">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 text-gray-200 text-sm">{a.email ?? '—'}</td>
                    <td className="p-3 text-indigo-400 font-semibold tabular-nums">
                      {a.feedback_rating ?? '—'}
                    </td>
                    <td className="p-3 text-gray-300 text-sm leading-relaxed">
                      {a.feedback_comment?.trim() ? (
                        a.feedback_comment
                      ) : (
                        <span className="text-gray-600">no comment</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-600">
          This is feedback only. Assessment answers and reports are personal data and are
          deliberately not shown here.
        </p>
      </div>
    </div>
  );
}
