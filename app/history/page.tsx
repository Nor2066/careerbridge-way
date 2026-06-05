'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';   // ✅ added

type HistoryItem = {
  id: string;
  createdAt: string;
  topClusters: { cluster: string; percentage: number }[];
  firstAIReport: string | null;
  detailedRoadmap: string | null;
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, { first: boolean; second: boolean }>>({});

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        // ✅ replaced fetch with fetchWithAuth (adds Authorization header)
        const res = await fetchWithAuth('/api/user-history', { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const toggleFirst = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: { ...prev[id], first: !prev[id]?.first } }));
  };
  const toggleSecond = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: { ...prev[id], second: !prev[id]?.second } }));
  };

  if (authLoading || loading) return <div className="p-6 text-center">Loading...</div>;
  if (!history.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your History</h1>
        <p className="text-gray-600">No assessments found. Take the full assessment first!</p>
        <button onClick={() => router.push('/assess')} className="mt-4 btn-primary">Start Assessment</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Assessment History</h1>
      <div className="space-y-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-2">
              {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
            </p>
            <h2 className="text-xl font-semibold mb-4">Your Top 3 Career Clusters</h2>
            <div className="space-y-3 mb-6">
              {item.topClusters.map((cluster) => (
                <div key={cluster.cluster}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{cluster.cluster}</span>
                    <span>{cluster.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${cluster.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-4">
              <button onClick={() => toggleFirst(item.id)} className="flex justify-between w-full text-left font-medium text-gray-700 hover:text-indigo-600">
                <span>📄 First AI Report</span>
                <span>{expanded[item.id]?.first ? '▲' : '▼'}</span>
              </button>
              {expanded[item.id]?.first && (
                <div className="mt-2 p-4 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
                  {item.firstAIReport || <em className="text-gray-500">No AI report was generated for this assessment.</em>}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <button onClick={() => toggleSecond(item.id)} className="flex justify-between w-full text-left font-medium text-gray-700 hover:text-indigo-600">
                <span>🚀 Detailed Career Roadmap</span>
                <span>{expanded[item.id]?.second ? '▲' : '▼'}</span>
              </button>
              {expanded[item.id]?.second && (
                <div className="mt-2 p-4 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
                  {item.detailedRoadmap || <em className="text-gray-500">No detailed roadmap was generated. Complete the follow‑up questionnaire first.</em>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}