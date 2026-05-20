// src/components/NarrativeDisplay.tsx
'use client';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import { useEffect, useState } from 'react';

interface Props {
  narrative: string;
  imagePrompt: string;
  insights?: any;
  onRegenerate?: () => void;
  onReset?: () => void;
}

export default function NarrativeDisplay({
  narrative,
  imagePrompt,
  insights,
  onRegenerate,
  onReset,
}: Props) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

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
    alert('已复制到剪贴板');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl space-y-6">
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

          {insights && (
            <details className="text-xs text-gray-400">
              <summary>情绪画像 (调试用)</summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {JSON.stringify(insights, null, 2)}
              </pre>
            </details>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={copyText}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200"
            >
              复制叙事
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
        </>
      )}
    </div>
  );
}