'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchResults = async () => {
      const res = await fetch(`/api/user-results?userId=${user.id}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    };
    fetchResults();
  }, [user, router]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Past Results</h1>
      {results.length === 0 ? (
        <p>No past results yet. Take the assessment first!</p>
      ) : (
        <div className="space-y-4">
          {results.map((res, idx) => (
            <div key={res.id} className="border p-4 rounded">
              <p className="text-sm text-gray-500">{new Date(res.created_at).toLocaleString()}</p>
              <p className="font-semibold">Top Clusters:</p>
              <ul>
                {res.top_clusters.map((c: any, i: number) => (
                  <li key={i}>{c.cluster}: {c.percentage}%</li>
                ))}
              </ul>
              <details>
                <summary>Show raw scores</summary>
                <pre>{JSON.stringify(res.raw_scores, null, 2)}</pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}