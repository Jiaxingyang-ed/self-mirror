'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import QuestionStep from '@/components/QuestionStep';
import ProgressIndicator from '@/components/ProgressIndicator';
import NarrativeDisplay from '@/components/NarrativeDisplay';
import questionMap from '@/data/question-map.json';

const questionOrder = ['q1', 'q2', 'q_breath', 'q3', 'q4', 'q5', 'q6'];

function getQuestionData(key: string) {
  const map = questionMap as any;
  if (key === 'q_breath') {
    return {
      text: '哪个声音让你想多听一会儿？',
      options: map.q_breath,
      secondary: map.q_breath_secondary,
    };
  }
  const questionTexts: Record<string, string> = {
    q1: '哪种小习惯让你觉得“这就是我”？',
    q2: '哪一瞬间让你觉得被轻轻接住了？',
    q3: '你最想卸下的是什么？',
    q4: '哪种微小的快乐让你想偷偷收藏？',
    q5: '如果有一个完全属于你的角落，那里会有什么？',
    q6: '最近哪件事让你觉得“我挺厉害的”？',
  };
  return {
    text: questionTexts[key],
    options: map[key],
    secondary: map[`${key}_secondary`],
  };
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondaryAnswers, setSecondaryAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    narrative: string;
    imagePrompt: string;
    insights: any;
    choices: any;  // 新增：保存用户选择的完整答案
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---------- 自动保存/恢复进度 ----------
  useEffect(() => {
    const savedAnswers = localStorage.getItem('mirror_answers');
    const savedSecondary = localStorage.getItem('mirror_secondary');
    const savedIndex = localStorage.getItem('mirror_index');
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedSecondary) setSecondaryAnswers(JSON.parse(savedSecondary));
    if (savedIndex) setCurrentIndex(parseInt(savedIndex));
  }, []);

  useEffect(() => {
    localStorage.setItem('mirror_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('mirror_secondary', JSON.stringify(secondaryAnswers));
  }, [secondaryAnswers]);

  useEffect(() => {
    localStorage.setItem('mirror_index', currentIndex.toString());
  }, [currentIndex]);

  const currentQuestionKey = questionOrder[currentIndex];
  const { text, options, secondary } = getQuestionData(currentQuestionKey);
  const total = questionOrder.length;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionKey]: value }));
    setSecondaryAnswers((prev) => {
      const newSec = { ...prev };
      delete newSec[currentQuestionKey];
      return newSec;
    });
  };

  const handleSecondarySelect = (value: string) => {
    setSecondaryAnswers((prev) => ({ ...prev, [currentQuestionKey]: value }));
  };

  const nextQuestion = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      generateNarrative();
    }
  };

  const generateNarrative = async () => {
    setLoading(true);
    setError(null);
    const fullAnswers: Record<string, string> = { ...answers };
    for (const [key, sec] of Object.entries(secondaryAnswers)) {
      fullAnswers[`${key}_secondary`] = sec;
    }
    try {
      const res = await fetch('/api/generate/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: fullAnswers }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || '生成失败');

      let insights = null;
      try {
        const insightRes = await fetch('/api/generate/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: fullAnswers,
            narrative: data.data.narrative,
          }),
        });
        const insightData = await insightRes.json();
        if (insightData.success) insights = insightData.data;
      } catch (e) {
        console.warn('Insights 提取失败', e);
      }

      // 将 fullAnswers 直接存入 result 中
      setResult({
        narrative: data.data.narrative,
        imagePrompt: data.data.image_prompt,
        insights,
        choices: fullAnswers,
      });
    } catch (err: any) {
      setError(err.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setSecondaryAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setError(null);
    // 清除本地存储
    localStorage.removeItem('mirror_answers');
    localStorage.removeItem('mirror_secondary');
    localStorage.removeItem('mirror_index');
  };

  const regenerate = () => {
    console.log('重新生成被点击');
    generateNarrative();
  };

  if (result) {
    return (
      <>
        <div className="fixed top-0 right-0 p-4 z-10">
          <a href="/moments" className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
            我的瞬间
          </a>
        </div>
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
          <NarrativeDisplay
            narrative={result.narrative}
            imagePrompt={result.imagePrompt}
            insights={result.insights}
            choices={result.choices}   // 从 result 中取
            onRegenerate={regenerate}
            onReset={reset}
          />
        </main>
      </>
    );
  }

  return (
    <>
      {/* 固定导航链接 */}
      <div className="fixed top-0 right-0 p-4 z-10">
        <a href="/moments" className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
          我的瞬间
        </a>
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <div className="w-full max-w-2xl mx-auto">
          <ProgressIndicator current={currentIndex + 1} total={total} />
          <AnimatePresence mode="wait">
            <QuestionStep
              key={currentQuestionKey}
              questionKey={currentQuestionKey}
              questionText={text}
              options={options}
              selected={answers[currentQuestionKey] || ''}
              onSelect={handleSelect}
              secondaryOptions={secondary}
              secondarySelected={secondaryAnswers[currentQuestionKey] || ''}
              onSecondarySelect={handleSecondarySelect}
            />
          </AnimatePresence>
          <div className="mt-8 flex justify-between">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                上一步
              </button>
            )}
            <button
              onClick={nextQuestion}
              disabled={!answers[currentQuestionKey]}
              className={`ml-auto px-6 py-2 rounded-full text-white ${
                answers[currentQuestionKey]
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {currentIndex === total - 1 ? '生成我的片刻' : '下一题'}
            </button>
          </div>
          {loading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300">正在读你…</p>
                <p className="text-sm text-gray-500 mt-1">把碎片拼在一起</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
              <button onClick={generateNarrative} className="ml-2 underline">重试</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}