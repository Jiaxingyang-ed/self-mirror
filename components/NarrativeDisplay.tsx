'use client';

import { useEffect, useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  narrative: string;
  imagePrompt: string;
  insights?: any;
  choices?: any;
  onRegenerate?: () => void;
  onReset?: () => void;
}

export default function NarrativeDisplay({
  narrative,
  imagePrompt,
  insights,
  choices,
  onRegenerate,
  onReset,
}: Props) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showTranslatePrompt, setShowTranslatePrompt] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < narrative.length) {
        setDisplayText(narrative.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [narrative]);

  const copyText = () => {
    navigator.clipboard.writeText(narrative);
    alert('✅ 已复制到剪贴板');
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = 'mirror-moment.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('生成图片失败', err);
      alert('生成失败，可以试试手动截图 🖼️');
    }
  };

  const handleSaveToCloud = async () => {
    let userId = localStorage.getItem('anonymous_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('anonymous_id', userId);
    }

    if (!choices) {
      alert('缺少用户选择数据，无法保存');
      return;
    }

    try {
      const res = await fetch('/api/save-moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          narrative,
          choices,
          imagePrompt,
          insights,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✨ 已保存到云端，可在“我的瞬间”查看');
        // 保存成功后显示过渡入口
        setShowTranslatePrompt(true);
      } else {
        alert('保存失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error('保存请求失败', err);
      alert('网络错误，保存失败');
    }
  };

  const handleTranslate = () => {
    const params = new URLSearchParams({
      narrative,
      choices: JSON.stringify(choices || {}),
      insights: JSON.stringify(insights || {}),
    });
    window.location.href = `/translate?${params.toString()}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl space-y-6">
      <div ref={cardRef} className="bg-white dark:bg-gray-900 p-6 rounded-xl">
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-2xl leading-relaxed font-serif whitespace-pre-wrap">
            {displayText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
        {!isTyping && (
          <>
            <hr className="my-4" />
            <div>
              <h3 className="text-sm font-semibold text-gray-500">图像灵感</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{imagePrompt}</p>
            </div>
          </>
        )}
      </div>

      {!isTyping && (
        <>
          {insights && (
            <details className="text-xs text-gray-400">
              <summary>情绪画像 (调试用)</summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {JSON.stringify(insights, null, 2)}
              </pre>
            </details>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={handleSaveToCloud}
              className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm hover:bg-indigo-600"
            >
              保存到云端
            </button>
            <button
              onClick={copyText}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200"
            >
              复制叙事
            </button>
            <button
              onClick={handleSaveImage}
              className="px-4 py-2 rounded-full bg-green-500 text-white text-sm hover:bg-green-600"
            >
              保存为图片
            </button>
            <button
              onClick={onRegenerate}
              className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600"
            >
              重新生成
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-50"
            >
              重新选择
            </button>
          </div>

          {/* 过渡入口 */}
          {showTranslatePrompt && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                想把这种感觉，变成今天能做的一件小事吗？
              </p>
              <button
                onClick={handleTranslate}
                className="mt-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm hover:bg-amber-200 transition"
              >
                看看可以做什么
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}