'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Moment {
  id: string;
  narrative: string;
  image_prompt: string;
  insights: any;
  choices: any;
  created_at: string;
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let userId = localStorage.getItem('anonymous_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('anonymous_id', userId);
    }

    fetch('/api/get-moments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMoments(data.data);
        else console.error(data.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">我的瞬间</h1>
        {moments.length === 0 ? (
          <p className="text-gray-500">还没有保存过任何瞬间，去照一次镜子吧。</p>
        ) : (
          <div className="space-y-4">
            {moments.map((moment) => (
              <div key={moment.id} className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      {new Date(moment.created_at).toLocaleString()}
                    </p>
                    <p className="mt-2 text-gray-800 dark:text-gray-200 line-clamp-2">
                      {moment.narrative.slice(0, 120)}...
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === moment.id ? null : moment.id)}
                    className="text-blue-500 text-sm ml-4"
                  >
                    {expandedId === moment.id ? '收起' : '展开'}
                  </button>
                </div>
                {expandedId === moment.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-wrap">{moment.narrative}</p>
                    <hr className="my-2" />
                    <p className="text-sm text-gray-500">图像灵感：{moment.image_prompt}</p>
                    {moment.insights && (
                      <details className="text-xs mt-2">
                        <summary>情绪画像</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(moment.insights, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-500 hover:underline">← 再照一次镜子</a>
        </div>
      </div>
    </main>
  );
}