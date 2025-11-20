'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './Icons';

const CAROUSEL_ITEMS = [
  {
    title: "想法结构化",
    desc: "将碎片化的灵感转化为系统性的商业架构。AI 自动梳理痛点、解决方案与核心价值。",
    icon: <Icons.Lightbulb size={32} className="text-amber-400" />,
    bg: "from-amber-900/30 to-orange-900/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20"
  },
  {
    title: "深度市场分析",
    desc: "基于大数据的市场规模估算与竞品分析，为您提供极具参考价值的商业洞察。",
    icon: <Icons.TrendingUp size={32} className="text-emerald-400" />,
    bg: "from-emerald-900/30 to-green-900/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20"
  },
  {
    title: "投资级文档",
    desc: "一键生成符合风投标准的商业计划书，支持 PDF 导出，让路演更自信。",
    icon: <Icons.FileText size={32} className="text-blue-400" />,
    bg: "from-blue-900/30 to-indigo-900/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/20"
  }
];

// Canvas-based Particle Background Component for performance and visual flair
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; t: number }[] = [];
    // Adjust particle count based on screen size for performance
    const particleCount = width < 768 ? 40 : 80;

    const colors = [
      { r: 124, g: 58, b: 237 }, // Purple
      { r: 59, g: 130, b: 246 }, // Blue
      { r: 255, g: 255, b: 255 } // White
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        color: `rgb(${colorBase.r}, ${colorBase.g}, ${colorBase.b})`,
        alpha: Math.random() * 0.5 + 0.1,
        t: Math.random() * Math.PI * 2 // random time offset for pulsing
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse opacity
        p.t += 0.05;
        const currentAlpha = p.alpha + Math.sin(p.t) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Use styled string for color with opacity
        ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${Math.max(0, currentAlpha)})`);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }} />;
};

export const IntroView: React.FC = () => {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);
    }
  };

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => router.push('/generate'), 800);
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`fixed inset-0 z-50 bg-[#020617] overflow-y-auto overflow-x-hidden transition-all duration-1000 ${isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex justify-between items-center ${scrollProgress > 0.05 ? 'bg-[#020617]/80 backdrop-blur-lg border-b border-white/5' : 'bg-transparent'}`}>
        <div
          className="flex items-center space-x-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={scrollToTop}
        >
           <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg">
             <Icons.Sparkles size={16} className="text-white" />
           </div>
           <span className="font-bold text-lg tracking-tight text-white">PitchAI</span>
        </div>
        <button
          onClick={handleEnter}
          className="px-5 py-2 text-sm font-medium bg-white text-slate-900 rounded-full hover:bg-indigo-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          开始创作
        </button>
      </nav>

      {/* Dynamic Background & Particles */}
      <div className="fixed inset-0 pointer-events-none">
         {/* Existing Gradients */}
         <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[120px] animate-blob"></div>
         <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] bg-indigo-900/10 rounded-full blur-[100px]"></div>

         {/* New Particle Layer */}
         <ParticleBackground />

         {/* Texture Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 text-center">
         <div className="max-w-4xl mx-auto space-y-8 animate-fade-up z-10">
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-indigo-300 text-xs font-medium tracking-wider uppercase mb-4 hover:bg-white/10 transition-colors">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
             <span>AI-Powered Strategy</span>
           </div>

           <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] text-white drop-shadow-2xl">
             将灵感 <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">转化为影响力</span>
           </h1>

           <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
             PitchAI 是您的智能创业合伙人。利用生成式 AI，在几秒钟内将简单的想法转化为专业的商业计划书、市场分析和执行策略。
           </p>

           <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
             <button
               onClick={handleEnter}
               className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
             >
               <span className="relative z-10 flex items-center">
                 立即开始
                 <Icons.ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
               </span>
             </button>

             <button
                onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
             >
               了解更多
             </button>
           </div>
         </div>

         {/* Scroll Indicator */}
         <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrollProgress > 0.1 ? 'opacity-0' : 'opacity-50'}`}>
           <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-float"></div>
           </div>
         </div>
      </section>

      {/* SECTION 2: INTERACTIVE CAROUSEL */}
      <section className="relative min-h-[80vh] flex flex-col justify-center py-20 px-6 bg-[#020617]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
             <div>
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">核心能力</h2>
               <p className="text-slate-400 max-w-md">专为创业者设计，覆盖从构思到执行的全流程。</p>
             </div>
             <div className="hidden md:flex space-x-2 mt-6 md:mt-0">
               {CAROUSEL_ITEMS.map((_, idx) => (
                 <button
                    key={idx}
                    onClick={() => setActiveCard(idx)}
                    className={`w-12 h-1 rounded-full transition-colors duration-700 ${idx === activeCard ? 'bg-white w-20' : 'bg-white/20 hover:bg-white/40'}`}
                 />
               ))}
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {CAROUSEL_ITEMS.map((item, idx) => {
              const isActive = idx === activeCard;
              return (
                <div
                  key={idx}
                  className={`group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden cursor-pointer
                    ${isActive
                      ? `border-white/20 bg-gradient-to-br ${item.bg} scale-105 opacity-100 z-10 shadow-2xl ${item.glow} -translate-y-2`
                      : 'border-white/5 bg-slate-900/40 scale-100 opacity-50 hover:opacity-100 hover:scale-[1.02] hover:border-white/10'
                    }
                  `}
                  onMouseEnter={() => setActiveCard(idx)}
                >
                  {/* Background Gradient Flash on Active */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon Slide/Scale */}
                    <div className={`w-14 h-14 rounded-2xl bg-[#0f0a1e]/80 border border-white/10 flex items-center justify-center mb-8 shadow-lg transition-all duration-500 ${isActive ? 'scale-110 -rotate-6 border-white/30' : 'scale-100'}`}>
                      {item.icon}
                    </div>

                    <h3 className={`text-2xl font-bold text-white mb-4 transition-transform duration-500 ${isActive ? 'translate-x-1' : 'translate-x-0'}`}>
                      {item.title}
                    </h3>

                    <p className={`text-slate-400 leading-relaxed transition-colors duration-500 ${isActive ? 'text-slate-200' : ''}`}>
                      {item.desc}
                    </p>

                    {/* Arrow Slide In */}
                    <div className={`mt-auto self-end transition-all duration-500 delay-100 pt-6 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                       <div className={`p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10`}>
                          <Icons.ArrowRight className="text-white" size={20} />
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: WORKFLOW / PREVIEW */}
      <section className="relative py-32 px-6 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f0a1e] to-[#020617]"></div>

         <div className="relative max-w-6xl mx-auto text-center z-10">
           <h2 className="text-3xl md:text-5xl font-bold mb-16 text-white">
             化繁为简的<span className="text-indigo-400">创作流程</span>
           </h2>

           <div className="relative bg-slate-900/80 border border-white/10 rounded-2xl p-2 md:p-4 shadow-2xl backdrop-blur-xl mx-auto max-w-4xl transform hover:scale-[1.01] transition-transform duration-700">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30"></div>
              <div className="relative rounded-xl overflow-hidden bg-[#020617] aspect-[16/9] flex flex-col">
                 {/* Mock UI Header */}
                 <div className="h-10 bg-slate-800/50 border-b border-white/5 flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                 </div>
                 {/* Mock UI Body */}
                 <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center space-y-8">
                    <div className="w-full max-w-lg bg-slate-800/50 rounded-full h-12 flex items-center px-6 text-slate-500 text-sm">
                       <Icons.Sparkles size={16} className="mr-3 text-purple-400" />
                       <span>输入您的创业想法...</span>
                    </div>
                    <div className="flex gap-4">
                       {[1,2,3].map((i) => (
                          <div key={i} className="w-24 h-32 bg-slate-800/30 rounded-lg animate-pulse" style={{ animationDelay: `${i * 200}ms`}}></div>
                       ))}
                    </div>
                 </div>
                 {/* Overlay Text */}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <div className="text-center space-y-4">
                       <div className="inline-block p-3 rounded-full bg-indigo-500/20 text-indigo-400 mb-2">
                          <Icons.Zap size={32} />
                       </div>
                       <h3 className="text-2xl font-bold text-white">一键生成</h3>
                       <p className="text-slate-300">仅需数秒，即可获得完整的商业计划</p>
                    </div>
                 </div>
              </div>
           </div>
         </div>
      </section>

      {/* SECTION 4: FINAL CTA */}
      <section className="relative py-32 px-6 text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            准备好开始了吗？
          </h2>
          <p className="text-xl text-slate-400">
            加入未来的创业者行列，用 AI 赋能您的商业愿景。
          </p>
          <button
            onClick={handleEnter}
            className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300"
          >
            立即免费试用
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
                <p className="text-slate-600 text-sm">© 2025 PitchAI. Empowering Entrepreneurs.</p>
            </div>

            <div className="flex items-center gap-8">
                <div className="hidden md:block text-sm text-slate-600 font-medium">关注我们</div>
                <a
                  href="https://github.com/2086316487/pitch-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group text-slate-500 hover:text-white transition-colors"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                       <Icons.Github size={18} />
                    </div>
                    <span className="text-sm font-medium">GitHub</span>
                </a>
                <a
                  href="mailto:2086316487@qq.com"
                  className="flex items-center gap-2 group text-slate-500 hover:text-white transition-colors"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                       <Icons.Mail size={18} />
                    </div>
                    <span className="text-sm font-medium">联系我们</span>
                </a>
            </div>
        </div>
      </footer>

    </div>
  );
};
