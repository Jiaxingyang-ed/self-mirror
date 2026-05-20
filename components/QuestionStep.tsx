'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  questionKey: string;
  questionText: string;
  options: Record<string, string>;
  selected: string;
  onSelect: (value: string) => void;
  secondaryOptions?: Record<string, string>;
  secondarySelected?: string;
  onSecondarySelect?: (value: string) => void;
}

export default function QuestionStep({
  questionKey,
  questionText,
  options,
  selected,
  onSelect,
  secondaryOptions,
  secondarySelected,
  onSecondarySelect,
}: Props) {
  // 关键：过滤二级选项，只保留与当前一级选项相关的子项
  let filteredSecondaryEntries: [string, string][] = [];
  if (secondaryOptions) {
    const entries = Object.entries(secondaryOptions);
    if (questionKey === 'q_breath') {
      // q_breath 的二级选项键是数字 "1","2","3","4"，不过滤，全部显示
      filteredSecondaryEntries = entries;
    } else {
      // 其他问题：只保留键名以 selected 开头的
      filteredSecondaryEntries = entries.filter(([key]) => key.startsWith(selected));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">
        {questionText}
      </h2>

      {/* 一级选项 */}
      <div className="space-y-3">
        {Object.entries(options).map(([key, text]) => (
          <label
            key={key}
            className={`block p-4 rounded-xl border cursor-pointer transition ${
              selected === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <input
              type="radio"
              name="question"
              value={key}
              checked={selected === key}
              onChange={() => {
                onSelect(key);
                // 如果之前选的二级选项与新的一级选项不匹配，清空它
                if (secondarySelected && !secondarySelected.startsWith(key)) {
                  onSecondarySelect?.('');
                }
              }}
              className="hidden"
            />
            <span className="text-gray-800 dark:text-gray-200">{text}</span>
          </label>
        ))}
      </div>

      {/* 二级选项（条件显示） */}
      <AnimatePresence>
        {secondaryOptions && selected && onSecondarySelect && filteredSecondaryEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 mb-3">可以说得更细一点吗？</p>
            <div className="space-y-2">
              {filteredSecondaryEntries.map(([key, text]) => (
                <label
                  key={key}
                  className={`block p-3 rounded-lg border cursor-pointer text-sm ${
                    secondarySelected === key
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="secondary"
                    value={key}
                    checked={secondarySelected === key}
                    onChange={() => onSecondarySelect(key)}
                    className="hidden"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{text}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}