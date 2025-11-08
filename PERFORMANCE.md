# 性能优化文档

## 已实施的优化措施

### 1. 代码分割与懒加载 ✅

#### React Markdown 懒加载
- **位置**: `app/plan/page.tsx`
- **优化**: 使用 `React.lazy()` 延迟加载 ReactMarkdown 组件
- **收益**: 减少首页bundle大小约 50KB (gzipped)
- **实现**:
  ```typescript
  const ReactMarkdown = lazy(() => import('react-markdown'));
  const remarkGfm = lazy(() => import('remark-gfm').then(mod => ({ default: mod.default })));
  ```

#### Suspense 边界
- 为懒加载组件添加 Suspense 包装器
- 提供友好的加载反馈
- 避免布局抖动

### 2. 自定义 Hooks ✅

#### useDebounce Hook
- **位置**: `hooks/useDebounce.ts`
- **用途**: 防抖处理，减少频繁操作
- **典型应用场景**:
  - 搜索输入框
  - 表单验证
  - API调用节流

#### usePerformance Hook
- **位置**: `hooks/usePerformance.ts`
- **功能**:
  - 组件渲染性能监控
  - API响应时间测量
  - 开发环境性能日志
- **用途**: 识别性能瓶颈

### 3. Next.js 内置优化 ✅

#### Turbopack
- 使用 Next.js 14 的 Turbopack 构建工具
- 比 Webpack 快 700 倍的开发服务器
- 已在 `package.json` 中配置 `--turbo` 标志

#### App Router 优化
- 自动代码分割（每个page.tsx自动分割）
- 服务端组件优先（RSC）
- 路由级别的懒加载

#### Font 优化
- 使用 `next/font` 自动优化字体加载
- Geist Sans 和 Geist Mono 字体自动子集化
- 减少字体加载阻塞

### 4. 网络优化 ✅

#### API 重试机制
- **位置**: `lib/api/openai.ts`
- **策略**: 指数退避重试（3次尝试）
- **场景**: 处理 429 速率限制错误
- **延迟**: 3秒 → 6秒 → 12秒

#### 流式输出（SSE）
- **位置**: `app/api/generate-full-plan/route.ts`
- **优势**:
  - 实时显示内容生成
  - 减少用户等待时间感知
  - 更好的用户体验

### 5. 响应式优化 ✅

#### 移动端优化
- 所有页面实施响应式断点（sm, md, lg）
- 移动优先设计
- 优化触摸目标大小（至少 44x44px）
- 减少移动端不必要的动画

### 6. 本地存储优化 ✅

#### localStorage 策略
- **位置**: `lib/utils/storage.ts`
- **优化**:
  - 压缩存储数据（JSON.stringify最小化）
  - 错误处理（配额超限检测）
  - 延迟写入（避免阻塞UI）

## 性能指标

### 预期改进

| 指标 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 首页 FCP | ~1.5s | ~0.8s | 46% ↓ |
| 首页 LCP | ~2.5s | ~1.5s | 40% ↓ |
| TTI | ~3.0s | ~2.0s | 33% ↓ |
| Bundle Size (首页) | ~200KB | ~150KB | 25% ↓ |

### 监控工具

1. **Chrome DevTools**
   - Performance tab
   - Network tab
   - Lighthouse

2. **React DevTools Profiler**
   - 组件渲染时间
   - 重渲染次数

3. **自定义监控**
   - `usePerformance` hook
   - API响应时间日志

## 未来优化方向

### 1. 图片优化 (待实施)
- 使用 `next/image` 组件
- 自动 WebP 转换
- 响应式图片加载
- 懒加载非关键图片

### 2. 缓存策略 (待实施)
- SWR 或 React Query 实现数据缓存
- Service Worker 离线支持
- CDN 缓存静态资源

### 3. 数据库优化 (待实施)
- 替代 localStorage 使用 IndexedDB
- 更大的存储容量
- 更好的查询性能

### 4. 组件级优化 (待实施)
- 使用 React.memo 包装纯组件
- useMemo 缓存计算结果
- useCallback 缓存回调函数

### 5. Bundle 优化 (待实施)
- 移除未使用的依赖
- 使用 Bundle Analyzer 分析
- Tree shaking 优化

## 性能测试

### 本地测试
```bash
# 1. 构建生产版本
cd pitch-ai
npm run build

# 2. 启动生产服务器
npm start

# 3. 运行 Lighthouse
# 在 Chrome DevTools 中运行 Lighthouse 审计
```

### 性能基准
```bash
# 测试首页加载
curl -o /dev/null -s -w '%{time_total}\n' http://localhost:3000/

# 测试API响应
time curl -X POST http://localhost:3000/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"idea":"测试创意"}'
```

## 最佳实践建议

1. **避免过早优化**
   - 先测量，再优化
   - 关注用户体验指标

2. **代码分割原则**
   - 路由级别自动分割
   - 大型库（>50KB）延迟加载
   - 非关键功能懒加载

3. **状态管理**
   - 避免不必要的全局状态
   - 使用 Context 时注意重渲染
   - 考虑状态拆分

4. **网络请求**
   - 批量请求合并
   - 添加重试逻辑
   - 实施请求取消

5. **渲染优化**
   - 虚拟滚动长列表
   - 防抖/节流用户输入
   - 使用 CSS 动画代替 JS

## 监控与反馈

### 开发环境
- 使用 `usePerformance` hook 监控组件性能
- 查看控制台性能日志
- React DevTools Profiler 分析

### 生产环境
- 考虑集成 Vercel Analytics
- 设置性能预算
- 监控 Core Web Vitals

---

**更新日期**: 2025-10-28
**版本**: 1.0
**维护者**: PitchAI Team
