import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        {/* 加载动画 */}
        <div className="mb-6 flex justify-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>

        {/* 加载文字 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          加载中...
        </h2>
        <p className="text-gray-600">
          正在为您准备精彩内容
        </p>

        {/* 加载进度点 */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
