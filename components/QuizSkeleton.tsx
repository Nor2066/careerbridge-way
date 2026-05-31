export default function QuizSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-2 bg-gray-200 rounded w-full mb-8"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
      <div className="space-y-3">
        <div className="h-16 bg-gray-100 rounded-xl"></div>
        <div className="h-16 bg-gray-100 rounded-xl"></div>
        <div className="h-16 bg-gray-100 rounded-xl"></div>
        <div className="h-16 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  );
}