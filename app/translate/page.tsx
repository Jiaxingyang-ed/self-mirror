'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const directions = [
  { icon: '🚶', title: '换条路回家', tag: 'walk_new_route' },
  { icon: '📖', title: '找一本此刻能读的书', tag: 'find_book' },
  { icon: '☕️', title: '给自己做杯喝的', tag: 'make_drink' },
  { icon: '✍️', title: '写几句不寄出的话', tag: 'write_letter' },
];

// 将主要内容抽离为一个组件，使用 useSearchParams
function TranslateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [narrative, setNarrative] = useState('');
  const [choices, setChoices] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<any[] | null>(null);

  useEffect(() => {
    const narrativeParam = searchParams.get('narrative');
    const choicesParam = searchParams.get('choices');
    const insightsParam = searchParams.get('insights');
    if (narrativeParam) setNarrative(narrativeParam);
    if (choicesParam) setChoices(JSON.parse(choicesParam || '{}'));
    if (insightsParam) setInsights(JSON.parse(insightsParam || '{}'));
  }, [searchParams]);

  const handleSelectDirection = async (direction: { tag: string; title: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative,
          choices,
          insights,
          direction: direction.tag,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActions(data.data);
      } else {
        alert('生成失败，请重试');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (actions) {
    return (
      <main className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">可以试试这些小事</h1>
          <div className="space-y-4">
            {actions.map((action, idx) => (
              <ActionCard key={idx} action={action} />
            ))}
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-8 text-blue-500 hover:underline"
          >
            ← 回到首页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">选一个方向</h1>
        <p className="text-gray-500 mb-6">把刚才的感觉，变成今天的小事</p>
        <div className="space-y-3">
          {directions.map((dir) => (
            <button
              key={dir.tag}
              onClick={() => handleSelectDirection(dir)}
              disabled={loading}
              className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-3"
            >
              <span className="text-2xl">{dir.icon}</span>
              <span className="font-medium">{dir.title}</span>
            </button>
          ))}
        </div>
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>正在找一件小事…</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// 导出页面，包裹 Suspense
export default function TranslatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">加载中…</div>}>
      <TranslateContent />
    </Suspense>
  );
}

// 微小行动卡片组件（保持不变）
function ActionCard({ action }: { action: any }) {
  const [done, setDone] = useState(false);

  const handleCheck = async () => {
    setDone(true);
    // 可选：记录统计
    try {
      await fetch('/api/action-done', {
        method: 'POST',
        body: JSON.stringify({ actionId: action.id }),
      });
    } catch (e) {}
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow p-4 transition ${done ? 'border border-amber-300' : ''}`}>
      <h3 className="text-lg font-semibold">{action.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
      <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        {action.action_suggestion}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleCheck}
          className={`w-5 h-5 rounded-full border flex items-center justify-center ${done ? 'bg-amber-500 border-amber-500' : 'border-gray-400'}`}
        >
          {done && <span className="text-white text-xs">✓</span>}
        </button>
        <span className="text-sm text-gray-500">我做了</span>
      </div>
      {done && (
        <p className="text-xs text-gray-400 mt-2 animate-fadeIn">
          谢谢你把这一刻带进生活。
        </p>
      )}
    </div>
  );
}