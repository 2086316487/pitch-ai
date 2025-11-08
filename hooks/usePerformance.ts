import { useEffect, useRef } from 'react';

/**
 * 性能监控Hook - 测量组件渲染时间
 * @param componentName 组件名称
 * @param enabled 是否启用监控（默认仅在开发环境启用）
 */
export function usePerformanceMonitor(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;

    if (renderCount.current === 1) {
      // 首次渲染
      mountTime.current = performance.now();
      console.log(`[Performance] ${componentName} mounted`);
    } else {
      // 重渲染
      const renderTime = performance.now() - mountTime.current;
      console.log(
        `[Performance] ${componentName} re-rendered (count: ${renderCount.current}, time since mount: ${renderTime.toFixed(2)}ms)`
      );
    }
  });

  useEffect(() => {
    if (!enabled) return;

    return () => {
      const totalTime = performance.now() - mountTime.current;
      console.log(
        `[Performance] ${componentName} unmounted (total renders: ${renderCount.current}, total time: ${totalTime.toFixed(2)}ms)`
      );
    };
  }, [componentName, enabled]);
}

/**
 * API性能监控 - 测量API调用时间
 * @param apiName API名称
 * @param promise Promise对象
 * @returns Promise结果
 */
export async function measureApiPerformance<T>(
  apiName: string,
  promise: Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return promise;
  }

  const startTime = performance.now();
  console.log(`[API Performance] ${apiName} started`);

  try {
    const result = await promise;
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`[API Performance] ${apiName} completed in ${duration.toFixed(2)}ms`);

    // 如果响应时间超过3秒，发出警告
    if (duration > 3000) {
      console.warn(`[API Performance] ${apiName} took ${duration.toFixed(2)}ms - consider optimization`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`[API Performance] ${apiName} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
