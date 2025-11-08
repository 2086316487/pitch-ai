'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台（可以扩展到错误追踪服务）
    console.error('应用错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* 错误图标 */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* 错误标题 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          哎呀，出错了！
        </h1>

        {/* 错误描述 */}
        <p className="text-gray-600 mb-2">
          应用遇到了一个意外错误，请尝试以下操作：
        </p>

        {/* 错误详情（开发环境显示） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="my-4 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-700 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3 mt-6">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            重试
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            返回首页
          </button>
        </div>

        {/* 帮助信息 */}
        <p className="mt-6 text-sm text-gray-500">
          如果问题持续存在，请刷新页面或稍后再试
        </p>
      </div>
    </div>
  );
}
