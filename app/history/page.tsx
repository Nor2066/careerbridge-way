'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type HistoryItem = {
  id: string;
  created_at: string;
  top_clusters: { cluster: string; percentage: number }[];
  raw_scores: Record<string, number>;
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_results')
        .select('id, created_at, top_clusters, raw_scores')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (authLoading || loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!history.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your History</h1>
        <p className="text-gray-600">No assessments found. Take the full assessment first!</p>
        <button onClick={() => router.push('/assess')} className="mt-4 btn-primary">
          Start Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Assessment History</h1>
      <div className="space-y-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()} at{' '}
                  {new Date(item.created_at).toLocaleTimeString()}
                </p>
                <h2 className="text-xl font-semibold mt-1">Your Top 3 Career Clusters</h2>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {item.top_clusters.map((cluster) => (
                <div key={cluster.cluster}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{cluster.cluster}</span>
                    <span>{cluster.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${cluster.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => toggleExpand(item.id)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {expanded[item.id] ? 'Hide raw scores' : 'Show raw scores'}
            </button>
            {expanded[item.id] && (
              <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-auto">
                {JSON.stringify(item.raw_scores, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}