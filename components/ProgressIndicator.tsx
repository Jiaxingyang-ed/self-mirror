export default function ProgressIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>第 {current} / {total} 题</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}