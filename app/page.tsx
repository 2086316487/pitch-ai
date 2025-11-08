'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lightbulb, TrendingUp, FileText, History } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError('请输入您的创业想法');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    // 添加超时控制
    const timeoutId = setTimeout(() => {
      setIsGenerating(false);
      setError('请求超时，请检查网络连接或稍后重试');
    }, 60000); // 60秒超时

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      clearTimeout(timeoutId); // 清除超时计时器

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '生成失败，请重试');
      }
    } catch (err) {
      clearTimeout(timeoutId); // 清除超时计时器
      console.error('API调用错误:', err);
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFullPlan = () => {
    if (!result) return;

    // 使用 sessionStorage 传递数据，避免 URL 长度限制
    sessionStorage.setItem('businessElements', JSON.stringify(result.elements));
    sessionStorage.setItem('businessCreatedAt', result.createdAt);

    // 跳转到计划书页面
    router.push('/plan');
  };

  const handleGeneratePPT = async () => {
    if (!result) return;

    try {
      // 显示加载状态
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = '正在生成PPT，请稍候...';
      loadingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);

      // 调用 API 生成 PPT
      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '商业计划书',
          elements: result.elements,
          createdAt: result.createdAt,
        }),
      });

      if (!response.ok) {
        throw new Error('PPT 生成失败');
      }

      // 获取文件数据
      const blob = await response.blob();

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `商业计划书_${new Date().getTime()}.pptx`;
      document.body.appendChild(a);
      a.click();

      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      document.body.removeChild(loadingToast);

      // 显示成功提示
      const successToast = document.createElement('div');
      successToast.innerHTML = '✅ PPT 生成成功！';
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);

    } catch (error) {
      console.error('PPT 生成错误:', error);
      alert('PPT 生成失败，请重试');
    }
  };

  const handleGenerateQuestionnaire = () => {
    if (!result) return;

    // 使用 sessionStorage 传递数据
    sessionStorage.setItem('businessElements', JSON.stringify(result.elements));
    sessionStorage.setItem('businessCreatedAt', result.createdAt);

    // 跳转到问卷页面
    router.push('/questionnaire');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-white/5 rounded-full animate-spin [animation-duration:20s]"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 border border-blue-500/10 rotate-45 animate-spin [animation-duration:15s]"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-sm"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
              <Sparkles className="relative w-6 h-6 sm:w-7 sm:h-7 text-white p-1.5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PitchAI
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => router.push('/history')}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
            >
              <History className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">历史记录</span>
            </button>
            <p className="text-xs sm:text-sm text-white/60 hidden lg:block font-medium">
              AI驱动的商业计划生成器
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-white/10 backdrop-blur-sm mb-6 sm:mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">AI驱动的智能生成器</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 px-4 leading-tight">
            <span className="block text-white/90">将创业想法</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
              变成专业商业计划书
            </span>
          </h2>

          <p className="text-lg sm:text-xl lg:text-2xl text-white/70 mb-10 sm:mb-12 px-4 max-w-3xl mx-auto leading-relaxed">
            只需一句话，<span className="text-white font-semibold">AI</span> 帮你生成完整的商业计划、市场分析、财务模型和验证问卷
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">想法结构化</h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  AI 自动提取痛点、解决方案、目标用户等核心要素
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">智能分析</h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  自动生成竞品分析、市场规模和财务模型
                </p>
              </div>
            </div>

            <div className="group relative sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">一键导出</h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  生成 PPT、PDF 等多种格式的专业文档
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="relative group mb-8 sm:mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <label className="block text-xl sm:text-2xl font-bold text-white">
                输入您的创业想法
              </label>
            </div>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="例如：开发一款 AI 驱动的老年人健康管理 App，帮助老年人记录健康数据、提供用药提醒和远程问诊服务..."
              className="w-full h-36 sm:h-40 px-4 py-3 text-base sm:text-lg bg-white/5 border-2 border-white/10 rounded-2xl resize-none focus:outline-none focus:border-blue-500 transition-all text-white placeholder-white/30 backdrop-blur-sm"
              disabled={isGenerating}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-base sm:text-lg">AI 正在智能分析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                    <span className="text-base sm:text-lg">开始生成商业计划书</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="relative group mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  商业要素分析结果
                </h3>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-blue-500/30 transition-all">
                  <h4 className="font-bold text-lg sm:text-xl mb-3 text-blue-400 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">🎯</span>
                    痛点问题
                  </h4>
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {result.elements.problem}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-green-500/30 transition-all">
                  <h4 className="font-bold text-lg sm:text-xl mb-3 text-green-400 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">💡</span>
                    解决方案
                  </h4>
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {result.elements.solution}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                  <h4 className="font-bold text-lg sm:text-xl mb-3 text-purple-400 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">👥</span>
                    目标用户
                  </h4>
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {result.elements.targetUsers}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-orange-500/30 transition-all">
                  <h4 className="font-bold text-lg sm:text-xl mb-3 text-orange-400 flex items-center gap-2">
                    <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">⭐</span>
                    价值主张
                  </h4>
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {result.elements.valueProposition}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-indigo-500/30 transition-all">
                  <h4 className="font-bold text-lg sm:text-xl mb-3 text-indigo-400 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">💰</span>
                    商业模式
                  </h4>
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {result.elements.businessModel}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
                  <h4 className="font-bold text-lg sm:text-xl mb-3 text-cyan-400 flex items-center gap-2">
                    <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">📊</span>
                    市场规模
                  </h4>
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {result.elements.marketSize}
                  </p>
                </div>

                {result.elements.competitors && result.elements.competitors.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-pink-500/30 transition-all">
                    <h4 className="font-bold text-lg sm:text-xl mb-3 text-pink-400 flex items-center gap-2">
                      <span className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">🔍</span>
                      潜在竞争对手
                    </h4>
                    <ul className="list-none grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.elements.competitors.map((competitor: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-base sm:text-lg text-white/80">
                          <span className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></span>
                          {competitor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <button
                  onClick={handleGenerateFullPlan}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📄</span>
                    生成完整计划书
                  </div>
                </button>
                <button
                  onClick={handleGeneratePPT}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📊</span>
                    生成 Pitch PPT
                  </div>
                </button>
                <button
                  onClick={handleGenerateQuestionnaire}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:col-span-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📋</span>
                    生成验证问卷
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PitchAI
            </h3>
          </div>
          <p className="text-white/60 mb-2">
            AI驱动的商业计划书生成器
          </p>
          <p className="text-white/40 text-sm">
            © 2025 AI+Web 创新挑战赛作品 • 让创业更简单
          </p>

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                AI 驱动
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></span>
                智能分析
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-400"></span>
                一键导出
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
