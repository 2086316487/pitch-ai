'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import { FeatureCard } from '@/components/FeatureCard';

export default function GeneratePage() {
  const router = useRouter();
  const [inputIdea, setInputIdea] = useState('');
  const [viewState, setViewState] = useState<'landing' | 'loading' | 'result'>('landing');
  const [result, setResult] = useState<any>(null);
  const [loadingText, setLoadingText] = useState('AI正在分析您的想法...');
  const [error, setError] = useState('');

  // Loading text rotation effect
  useEffect(() => {
    if (viewState !== 'loading') return;
    
    const texts = [
      '正在构建商业架构...',
      '正在分析市场规模...',
      '正在生成竞品对比...',
      '正在优化执行摘要...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i % texts.length]);
      i++;
    }, 1500);
    return () => clearInterval(interval);
  }, [viewState]);

  const handleGenerate = async () => {
    if (!inputIdea.trim()) {
      setError('请输入您的创业想法');
      return;
    }
    
    setViewState('loading');
    setError('');

    const timeoutId = setTimeout(() => {
      setViewState('landing');
      setError('请求超时，请检查网络连接或稍后重试');
    }, 60000);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: inputIdea }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setViewState('result');
      } else {
        setError(data.error || '生成失败，请重试');
        setViewState('landing');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('API调用错误:', err);
      setError('网络错误，请检查连接后重试');
      setViewState('landing');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerateFullPlan = () => {
    if (!result) return;
    sessionStorage.setItem('businessElements', JSON.stringify(result.elements));
    sessionStorage.setItem('businessCreatedAt', result.createdAt);
    router.push('/plan');
  };

  const handleGeneratePPT = async () => {
    if (!result) return;

    try {
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = '正在生成PPT，请稍候...';
      loadingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);

      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '商业计划书',
          elements: result.elements,
          createdAt: result.createdAt,
        }),
      });

      if (!response.ok) throw new Error('PPT 生成失败');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `商业计划书_${new Date().getTime()}.pptx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      document.body.removeChild(loadingToast);

      const successToast = document.createElement('div');
      successToast.innerHTML = '✅ PPT 生成成功！';
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      setTimeout(() => document.body.removeChild(successToast), 3000);
    } catch (error) {
      console.error('PPT 生成错误:', error);
      alert('PPT 生成失败，请重试');
    }
  };

  const handleGenerateQuestionnaire = () => {
    if (!result) return;
    sessionStorage.setItem('businessElements', JSON.stringify(result.elements));
    sessionStorage.setItem('businessCreatedAt', result.createdAt);
    router.push('/questionnaire');
  };

  const handleBack = () => {
    setViewState('landing');
    setResult(null);
    setError('');
  };

  // Result View
  if (viewState === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm text-slate-300"
          >
            <Icons.ChevronLeft size={16} />
            <span>返回</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Icons.FileText size={16} className="text-white"/>
            </div>
            <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              商业计划书
            </span>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={handleGeneratePPT}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Icons.Download size={16} />
              <span className="hidden sm:inline">导出 PPT</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20"></div>
          
          <div className="relative bg-[#131126] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium mb-6">
                <Icons.Sparkles size={12} />
                <span>AI Generated</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
                商业计划书
              </h1>
              <p className="text-slate-400 flex items-center justify-center space-x-2 text-sm">
                <Icons.Clock size={14} />
                <span>生成时间: {result.createdAt}</span>
              </p>
            </div>

            <div className="p-6 md:p-12 space-y-8 bg-[#131126]">
              <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 hover:border-red-500/30 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-full text-white">
                    <Icons.Target size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">核心问题</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {result.elements.problem}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 hover:border-yellow-500/30 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white">
                    <Icons.Lightbulb size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">解决方案</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {result.elements.solution}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg text-white">
                    <Icons.Users size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">目标用户</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {result.elements.targetUsers}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 hover:border-orange-500/30 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg text-white">
                    <Icons.Zap size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">价值主张</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {result.elements.valueProposition}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg text-white">
                      <Icons.TrendingUp size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">商业模式</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {result.elements.businessModel}
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg text-white">
                      <Icons.FileText size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">市场规模</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {result.elements.marketSize}
                  </p>
                </div>
              </div>

              {result.elements.competitors && result.elements.competitors.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg text-white">
                      <Icons.Zap size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">潜在竞争对手</h3>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.elements.competitors.map((competitor: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-slate-300">
                        <span className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></span>
                        {competitor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={handleGenerateFullPlan}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 text-base rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📄</span>
                    生成完整计划书
                  </div>
                </button>
                <button
                  onClick={handleGeneratePPT}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 text-base rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📊</span>
                    生成 Pitch PPT
                  </div>
                </button>
                <button
                  onClick={handleGenerateQuestionnaire}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 text-base rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📋</span>
                    生成验证问卷
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing/Input View
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-purple-500/30 animate-in fade-in zoom-in duration-700">
      
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity group"
          onClick={() => router.push('/')}
          title="回到首页"
        >
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
            <Icons.Sparkles size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            PitchAI
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => router.push('/history')}
            className="hidden md:flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <Icons.Clock size={16} />
            <span>历史记录</span>
          </button>
          <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            关于我们
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="mb-8 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md animate-fade-up">
          <Icons.Zap size={14} className="text-indigo-400" />
          <span className="text-sm text-indigo-200 font-medium">AI驱动的智能商业生成器</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight animate-fade-up [animation-delay:200ms]">
          将<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">创业想法</span>
          <br />
          变成<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">专业商业计划书</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-12 leading-relaxed animate-fade-up [animation-delay:400ms]">
          只需一句话，<strong className="text-white">AI</strong> 帮你生成完整的商业计划、市场分析、财务模型和验证问卷。
        </p>

        {/* Input Area */}
        <div className={`w-full max-w-3xl relative group transition-all duration-500 animate-fade-up [animation-delay:600ms] ${viewState === 'loading' ? 'scale-95 opacity-80 pointer-events-none' : ''}`}>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative flex items-center bg-[#0f0a1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
            <div className="pl-4 text-slate-500">
              <Icons.Sparkles size={24} />
            </div>
            <input
              type="text"
              value={inputIdea}
              onChange={(e) => setInputIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：做一个针对独居年轻人的宠物共享平台..."
              className="w-full bg-transparent border-none px-4 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-0"
              disabled={viewState === 'loading'}
            />
            <button
              onClick={handleGenerate}
              disabled={!inputIdea.trim() || viewState === 'loading'}
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[120px]"
            >
              {viewState === 'loading' ? (
                <Icons.Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>生成计划</span>
                  <Icons.ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm max-w-3xl">
            ⚠️ {error}
          </div>
        )}

        {/* Loading Indicator Overlay */}
        {viewState === 'loading' && (
          <div className="mt-8 flex flex-col items-center space-y-3 animate-in fade-in duration-500">
            <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-[loading_1s_ease-in-out_infinite] w-1/2 rounded-full"></div>
            </div>
            <p className="text-slate-300 font-light">{loadingText}</p>
          </div>
        )}

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 w-full max-w-6xl animate-fade-up [animation-delay:800ms]">
          <FeatureCard
            icon={<Icons.Lightbulb size={32} className="text-amber-400" />}
            title="想法结构化"
            description="AI 自动提取痛点、解决方案、目标用户等核心要素，将碎片化想法整理成系统逻辑。"
            color="from-amber-500/50 to-orange-600/50"
          />
          <FeatureCard
            icon={<Icons.TrendingUp size={32} className="text-emerald-400" />}
            title="智能分析"
            description="自动生成竞品分析、市场规模和财务模型，基于实时大数据的商业洞察。"
            color="from-emerald-500/50 to-green-600/50"
          />
          <FeatureCard
            icon={<Icons.FileText size={32} className="text-blue-400" />}
            title="一键导出"
            description="生成 PPT、PDF 等多种格式的专业文档，直接用于路演展示或投资人沟通。"
            color="from-blue-500/50 to-cyan-600/50"
          />
        </div>

      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>
    </div>
  );
}
