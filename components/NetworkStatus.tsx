'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      // 网络恢复时显示提示
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // 离线状态 - 固定在顶部
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" />
          <p className="font-medium">
            网络连接已断开，部分功能可能无法使用
          </p>
        </div>
      </div>
    );
  }

  // 网络恢复提示 - 3秒后自动消失
  if (showReconnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          <p className="font-medium">网络已恢复</p>
        </div>
      </div>
    );
  }

  return null;
}
