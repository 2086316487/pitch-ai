'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Download, ArrowLeft, Loader2, FileSpreadsheet, FileDown, Save, Target, TrendingUp, AlertCircle, DollarSign, Sparkles, Edit3, X, ClipboardList } from 'lucide-react';
import { exportBusinessPlanToPDF, exportBusinessPlanToText } from '@/lib/utils/pdfExport';
import { saveBusinessPlan } from '@/lib/utils/storage';
import type { FinancialModel } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function BusinessPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);

  // 图表颜色配置 - 使用渐变色主题
  const COLORS = {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#22d3ee',
    gradient: ['#60a5fa', '#a78bfa', '#ec4899', '#fbbf24', '#34d399']
  };
  const [planData, setPlanData] = useState<any>(null);
  const [error, setError] = useState('');
  const [competitorData, setCompetitorData] = useState<any>(null);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<'business' | 'creative' | 'minimal' | 'vibrant'>('business');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [financialModel, setFinancialModel] = useState<FinancialModel | null>(null);
  const [isGeneratingFinancial, setIsGeneratingFinancial] = useState(false);
  const [showFinancialModel, setShowFinancialModel] = useState(false);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedFromHistory = useRef(false);

  // 内容编辑器状态
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  // 智能建议系统状态
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const elementsParam = searchParams.get('elements');

  // 自动滚动到最新内容
  useEffect(() => {
    if (isGenerating && contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [planData?.content, isGenerating]);

  const generateFullPlan = async () => {
    console.log('📍 [DEBUG] generateFullPlan 函数被调用');
    console.log('📊 [DEBUG] 当前状态:', {
      hasLoadedFromHistory: hasLoadedFromHistory.current,
      planData: !!planData,
      isGenerating
    });

    if (hasLoadedFromHistory.current && planData) {
      console.log('⏭️ [DEBUG] 已从历史记录加载，跳过重复生成');
      return;
    }

    let elements: any = null;
    let loadedContent: string | null = null;
    let loadedCreatedAt: string | null = null;
    let loadedTitle: string | null = null;
    let loadedFinancialModel: FinancialModel | null = null;
    let loadedCompetitorData: any = null;

    if (typeof window !== 'undefined') {
      try {
        const storedElements = sessionStorage.getItem('businessElements');
        console.log('📦 sessionStorage.businessElements:', storedElements ? '存在' : '不存在');
        if (storedElements) {
          elements = JSON.parse(storedElements);
          console.log('✅ 解析 elements 成功');
        }

        loadedContent = sessionStorage.getItem('loadedPlanContent');
        loadedCreatedAt = sessionStorage.getItem('businessCreatedAt');
        loadedTitle = sessionStorage.getItem('businessTitle');

        const storedFinancialModel = sessionStorage.getItem('loadedFinancialModel');
        const storedCompetitorData = sessionStorage.getItem('loadedCompetitorData');

        if (storedFinancialModel) {
          try {
            loadedFinancialModel = JSON.parse(storedFinancialModel);
            console.log('✅ 加载财务模型成功');
          } catch (e) {
            console.error('❌ 解析财务模型失败:', e);
          }
        }

        if (storedCompetitorData) {
          try {
            loadedCompetitorData = JSON.parse(storedCompetitorData);
            console.log('✅ 加载竞品分析数据成功');
          } catch (e) {
            console.error('❌ 解析竞品分析数据失败:', e);
          }
        }

        console.log('📦 sessionStorage 内容检查:', {
          hasElements: !!elements,
          hasLoadedContent: !!loadedContent,
          hasCreatedAt: !!loadedCreatedAt,
          hasTitle: !!loadedTitle,
          hasFinancialModel: !!loadedFinancialModel,
          hasCompetitorData: !!loadedCompetitorData
        });

        if (loadedContent && elements) {
          console.log('📄 从历史记录加载已保存的内容');

          setPlanData({
            title: loadedTitle || '商业计划书',
            elements,
            content: loadedContent,
            createdAt: loadedCreatedAt || new Date().toISOString(),
          });

          if (loadedFinancialModel) {
            setFinancialModel(loadedFinancialModel);
            setShowFinancialModel(true);
            console.log('✅ 财务模型已恢复');
          }

          if (loadedCompetitorData) {
            setCompetitorData(loadedCompetitorData);
            console.log('✅ 竞品分析数据已恢复');
          }

          hasLoadedFromHistory.current = true;

          setTimeout(() => {
            sessionStorage.removeItem('loadedPlanContent');
            sessionStorage.removeItem('businessCreatedAt');
            sessionStorage.removeItem('businessTitle');
            sessionStorage.removeItem('loadedFinancialModel');
            sessionStorage.removeItem('loadedCompetitorData');
          }, 100);

          console.log('✅ 历史记录加载完成，退出函数');
          return;
        }
      } catch (e) {
        console.error('❌ 从 sessionStorage 读取数据失败:', e);
      }
    }

    if (!elements && elementsParam) {
      try {
        elements = JSON.parse(decodeURIComponent(elementsParam));
      } catch (e) {
        console.error('从 URL 参数解码数据失败:', e);
        setError('数据格式错误，请返回首页重新生成');
        return;
      }
    }

    if (!elements) {
      setError('缺少商业要素数据，请返回首页重新生成');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const response = await fetch('/api/generate-full-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements,
          title: '商业计划书',
          stream: true,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `生成失败: ${response.status} ${response.statusText}`;

        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('解析错误响应失败:', e);
          }
        } else {
          const errorText = await response.text();
          console.error('API返回HTML错误:', errorText.substring(0, 500));
        }

        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let accumulatedContent = '';
      let metadata: any = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);

              if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
                console.warn('跳过非JSON数据:', jsonStr.substring(0, 50));
                continue;
              }

              const jsonData = JSON.parse(jsonStr);

              if (jsonData.type === 'metadata') {
                metadata = jsonData.data;
              } else if (jsonData.type === 'content') {
                accumulatedContent += jsonData.data;
                if (metadata) {
                  setPlanData({
                    ...metadata,
                    content: accumulatedContent,
                  });
                }
              } else if (jsonData.type === 'done') {
                if (metadata) {
                  setPlanData({
                    ...metadata,
                    content: jsonData.data.fullContent || accumulatedContent,
                  });

                  // 自动触发财务模型生成
                  setTimeout(() => {
                    console.log('🚀 自动生成财务模型...');
                    handleGenerateFinancialModel();
                  }, 1000); // 1秒后生成,让用户先看到计划书
                }

                if (jsonData.data.wasTruncated) {
                  console.warn('⚠️ 内容可能因长度限制被截断');
                  const warningToast = document.createElement('div');
                  warningToast.innerHTML = '⚠️ 内容可能不完整，已达到生成长度限制';
                  warningToast.className = 'fixed top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg z-50';
                  document.body.appendChild(warningToast);
                  setTimeout(() => {
                    if (document.body.contains(warningToast)) {
                      document.body.removeChild(warningToast);
                    }
                  }, 5000);
                }
              } else if (jsonData.type === 'error') {
                throw new Error(jsonData.data.message);
              }
            } catch (e) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('解析 SSE 数据失败:', trimmedLine, e);
              }
            }
          }
        }
      }

    } catch (err) {
      console.error('生成失败:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!planData && !isGenerating && !error) {
      console.log('🚀 自动触发生成...', new Date().toISOString());
      console.log('当前状态:', { planData: !!planData, isGenerating, error, hasLoadedFromHistory: hasLoadedFromHistory.current });
      generateFullPlan();
    } else {
      console.log('⏭️ 跳过自动生成:', { planData: !!planData, isGenerating, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualRefresh = () => {
    console.log('🔄 手动刷新...', new Date().toISOString());
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('businessElements');
      sessionStorage.removeItem('loadedPlanContent');
      sessionStorage.removeItem('businessCreatedAt');
      sessionStorage.removeItem('businessTitle');
      sessionStorage.removeItem('loadedFinancialModel');
      sessionStorage.removeItem('loadedCompetitorData');
    }
    setPlanData(null);
    setError('');
    setFinancialModel(null);
    setCompetitorData(null);
    setShowFinancialModel(false);
    hasLoadedFromHistory.current = false;
    setTimeout(() => generateFullPlan(), 100);
  };

  const handleExportPDF = async () => {
    if (!planData) {
      alert('没有可导出的内容');
      return;
    }

    setIsExportingPDF(true);
    setExportProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('开始导出PDF...');
      const result = await exportBusinessPlanToPDF(planData);

      clearInterval(progressInterval);
      setExportProgress(100);

      await new Promise(resolve => setTimeout(resolve, 300));

      if (result.success) {
        console.log('PDF 导出成功:', result.fileName);

        const successToast = document.createElement('div');
        successToast.innerHTML = '✅ PDF 导出成功！';
        successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
        document.body.appendChild(successToast);
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast);
          }
        }, 3000);
      } else {
        alert('PDF 导出失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('PDF 导出错误:', error);
      alert('PDF 导出失败，请重试');
    } finally {
      setIsExportingPDF(false);
      setExportProgress(0);
    }
  };

  const handleExportPPT = async () => {
    if (!planData) {
      alert('没有可导出的内容');
      return;
    }

    setIsExportingPPT(true);
    setExportProgress(0);
    setShowTemplateSelector(false);

    try {
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: planData.title,
          elements: planData.elements,
          content: planData.content,
          createdAt: planData.createdAt,
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('PPT 生成失败');
      }

      const blob = await response.blob();

      clearInterval(progressInterval);
      setExportProgress(100);

      await new Promise(resolve => setTimeout(resolve, 300));

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${planData.title}_${new Date().getTime()}.pptx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const successToast = document.createElement('div');
      successToast.innerHTML = '✅ PPT 生成成功！';
      successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

    } catch (error) {
      console.error('PPT 生成错误:', error);
      alert('PPT 生成失败，请重试');
    } finally {
      setIsExportingPPT(false);
      setExportProgress(0);
    }
  };

  const handleExportText = () => {
    if (!planData) {
      alert('没有可导出的内容');
      return;
    }

    const result = exportBusinessPlanToText(planData);
    if (result.success) {
      const successToast = document.createElement('div');
      successToast.innerHTML = '✅ 文本导出成功！';
      successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
      document.body.appendChild(successToast);
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
    }
  };

  const handleSave = () => {
    if (!planData) {
      alert('没有可保存的内容');
      return;
    }

    try {
      saveBusinessPlan({
        title: planData.title || '商业计划书',
        elements: planData.elements,
        content: planData.content,
        financialModel: financialModel || undefined,
        competitorData: competitorData || undefined,
        createdAt: planData.createdAt,
      });

      const successToast = document.createElement('div');
      successToast.innerHTML = '💾 保存成功！可在历史记录中查看';
      successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleGenerateQuestionnaire = () => {
    if (!planData?.elements) {
      alert('缺少商业要素数据');
      return;
    }

    // 保存完整数据到sessionStorage，以便返回时可以即时加载
    sessionStorage.setItem('businessElements', JSON.stringify(planData.elements));
    sessionStorage.setItem('businessCreatedAt', planData.createdAt || new Date().toISOString());
    sessionStorage.setItem('businessTitle', planData.title || '商业计划书');

    // 保存完整计划书内容，避免返回时重新生成
    if (planData.content) {
      sessionStorage.setItem('loadedPlanContent', planData.content);
    }

    // 保存财务模型和竞品数据
    if (financialModel) {
      sessionStorage.setItem('loadedFinancialModel', JSON.stringify(financialModel));
    }
    if (competitorData) {
      sessionStorage.setItem('loadedCompetitorData', JSON.stringify(competitorData));
    }

    // 跳转到问卷页面
    router.push('/questionnaire');
  };

  const loadCompetitorAnalysis = async () => {
    if (!planData?.elements) {
      return;
    }

    setIsLoadingCompetitors(true);

    try {
      const response = await fetch('/api/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: planData.elements }),
      });

      if (!response.ok) {
        throw new Error('竞品分析加载失败');
      }

      const result = await response.json();
      if (result.success) {
        setCompetitorData(result.data);
      }
    } catch (error) {
      console.error('竞品分析错误:', error);
    } finally {
      setIsLoadingCompetitors(false);
    }
  };

  const handleGenerateFinancialModel = async () => {
    if (!planData?.elements || isGeneratingFinancial) {
      return;
    }

    setIsGeneratingFinancial(true);

    try {
      console.log('💰 开始生成财务模型...');

      const response = await fetch('/api/generate-financial-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: planData.elements }),
      });

      if (!response.ok) {
        throw new Error('财务模型生成失败');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setFinancialModel(result.data);
        setShowFinancialModel(true);

        const successToast = document.createElement('div');
        successToast.innerHTML = '✅ 财务模型生成成功！';
        successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
        document.body.appendChild(successToast);
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast);
          }
        }, 3000);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('财务模型生成错误:', error);
      console.log('🔄 API调用失败，使用模拟数据...');
      const mockFinancialModel: FinancialModel = {
        revenueStreams: [
          {
            name: '基础订阅服务',
            description: '月度/年度会员订阅',
            model: 'subscription',
            pricing: 99,
            unit: '用户/月'
          },
          {
            name: '高级功能',
            description: '专业版功能包',
            model: 'freemium',
            pricing: 199,
            unit: '用户/月'
          },
          {
            name: '企业服务',
            description: '定制化企业解决方案',
            model: 'enterprise',
            pricing: 999,
            unit: '企业/月'
          }
        ],
        costStructure: [
          {
            category: 'fixed',
            name: '研发人员薪酬',
            description: '技术团队工资',
            amount: 120000,
            frequency: 'monthly'
          },
          {
            category: 'variable',
            name: '服务器成本',
            description: '云服务器和带宽',
            amount: 25000,
            frequency: 'monthly'
          },
          {
            category: 'fixed',
            name: '市场营销',
            description: '广告投放和推广',
            amount: 80000,
            frequency: 'monthly'
          },
          {
            category: 'fixed',
            name: '行政管理',
            description: '办公场地和管理费用',
            amount: 40000,
            frequency: 'monthly'
          }
        ],
        projections: [
          {
            year: 1,
            revenue: 180,
            costs: 300,
            profit: -120,
            users: 5000,
            breakeven: false
          },
          {
            year: 2,
            revenue: 520,
            costs: 450,
            profit: 70,
            users: 25000,
            breakeven: true
          },
          {
            year: 3,
            revenue: 1200,
            costs: 780,
            profit: 420,
            users: 80000,
            breakeven: true
          }
        ],
        assumptions: [
          '目标市场年增长率保持15%以上',
          '用户获取成本逐年降低10%',
          '产品留存率达到85%以上',
          '付费转化率保持在5-8%',
          '市场竞争格局保持相对稳定'
        ],
        fundingNeeds: {
          amount: 500,
          usage: ['产品研发与迭代', '市场推广与获客', '团队扩充与建设', '运营资金储备'],
          milestone: ['完成MVP开发并上线', '获得10000+种子用户', '实现月收入50万', '完成A轮融资']
        },
        metrics: {
          ltv: 5000,
          cac: 200,
          ltvCacRatio: 25,
          burnRate: 50,
          runway: 18
        }
      };

      setFinancialModel(mockFinancialModel);
      setShowFinancialModel(true);

      const mockToast = document.createElement('div');
      mockToast.innerHTML = '⚠️ 使用模拟数据展示（API暂不可用）';
      mockToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
      document.body.appendChild(mockToast);
      setTimeout(() => {
        if (document.body.contains(mockToast)) {
          document.body.removeChild(mockToast);
        }
      }, 5000);

      setTimeout(() => {
        const successToast = document.createElement('div');
        successToast.innerHTML = '✅ 财务模型展示成功！';
        successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
        document.body.appendChild(successToast);
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast);
          }
        }, 3000);
      }, 1000);

    } finally {
      setIsGeneratingFinancial(false);
    }
  };

  const handleStartEdit = () => {
    if (!planData?.content) return;
    setOriginalContent(planData.content);
    setEditedContent(planData.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(originalContent);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    // 更新planData的内容
    if (planData) {
      setPlanData(prev => prev ? { ...prev, content: editedContent } : null);

      // 自动保存到localStorage
      try {
        saveBusinessPlan({
          title: planData.title || '商业计划书',
          elements: planData.elements,
          content: editedContent, // 使用编辑后的内容
          financialModel: financialModel || undefined,
          competitorData: competitorData || undefined,
          createdAt: planData.createdAt,
        });
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }

    setIsEditing(false);
    const successToast = document.createElement('div');
    successToast.innerHTML = '✅ 内容保存成功！';
    successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20';
    document.body.appendChild(successToast);
    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 3000);
  };

  const generateSuggestions = (content: string) => {
    const newSuggestions: string[] = [];

    if (content.length < 1000) {
      newSuggestions.push('💡 您的商业计划书内容较少，建议至少包含5000字以上的详细描述');
    }

    const keywords = ['竞争', '对手', '市场', '用户', '收入', '成本', '团队'];
    const missingKeywords = keywords.filter(keyword => !content.includes(keyword));
    if (missingKeywords.length > 0) {
      newSuggestions.push(`🔍 建议补充以下关键内容：${missingKeywords.join('、')}`);
    }

    if (!content.includes('万') && !content.includes('亿') && !content.includes('市场规模')) {
      newSuggestions.push('📊 建议添加具体的市场规模数据，包括TAM（总体可获得市场）和SAM（可服务市场）');
    }

    if (!content.includes('收入') && !content.includes('盈利')) {
      newSuggestions.push('💰 建议添加详细的收入模式和盈利预测');
    }

    if (!content.includes('竞争') || content.split('竞争').length < 3) {
      newSuggestions.push('⚔️ 建议深入分析至少3个主要竞争对手的优劣势');
    }

    if (!content.includes('团队') && !content.includes('创始人')) {
      newSuggestions.push('👥 建议补充核心团队成员的背景和经验');
    }

    if (!content.includes('风险') && !content.includes('挑战')) {
      newSuggestions.push('⚠️ 建议添加潜在风险和应对策略的分析');
    }

    if (!content.includes('融资') && !content.includes('资金')) {
      newSuggestions.push('💼 建议说明资金需求和用途，以及预期的融资时间表');
    }

    if (!content.includes('计划') || !content.includes('目标')) {
      newSuggestions.push('🎯 建议添加清晰的发展路线图和里程碑计划');
    }

    if (!content.includes('营销') && !content.includes('推广') && !content.includes('获客')) {
      newSuggestions.push('📢 建议添加具体的获客策略和营销计划');
    }

    if (!content.includes('技术') && !content.includes('壁垒') && !content.includes('创新')) {
      newSuggestions.push('🚀 建议说明技术优势和差异化竞争壁垒');
    }

    if (newSuggestions.length === 0) {
      newSuggestions.push('✨ 您的商业计划书内容非常完整！建议定期更新数据和调整策略');
    }

    return newSuggestions;
  };

  const handleAnalyzeSuggestions = async () => {
    if (!planData?.content) return;
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const contentToAnalyze = isEditing ? editedContent : planData.content;
      const newSuggestions = generateSuggestions(contentToAnalyze);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('智能分析错误:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (planData && !competitorData && !isLoadingCompetitors) {
      loadCompetitorAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planData]);

  // 自动保存功能:内容变化30秒后自动保存
  useEffect(() => {
    if (!planData || isGenerating) return;

    const timer = setTimeout(() => {
      try {
        saveBusinessPlan({
          title: planData.title || '商业计划书',
          elements: planData.elements,
          content: planData.content,
          financialModel: financialModel || undefined,
          competitorData: competitorData || undefined,
          createdAt: planData.createdAt,
        });
        console.log('💾 自动保存成功');
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }, 30000); // 30秒后保存

    return () => clearTimeout(timer);
  }, [planData, financialModel, competitorData, isGenerating]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
              <FileText className="relative w-5 h-5 sm:w-6 sm:h-6 text-white p-1" />
            </div>
            <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">商业计划书</h1>
          </div>
          {planData && (
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isGenerating}
                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all text-xs sm:text-sm disabled:opacity-50 backdrop-blur-sm border border-white/20 hover:scale-105"
                title="清除缓存并重新生成"
              >
                <Loader2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="hidden sm:inline font-medium">刷新</span>
              </button>

              <button
                onClick={handleAnalyzeSuggestions}
                disabled={isAnalyzing}
                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all text-xs sm:text-sm disabled:opacity-50 backdrop-blur-sm border border-white/20 hover:scale-105"
                title="智能分析建议"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                )}
                <span className="hidden sm:inline font-medium">{isAnalyzing ? '分析中' : 'AI建议'}</span>
              </button>

              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
                  title="编辑内容"
                >
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-medium">编辑</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
                    title="保存修改"
                  >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline font-medium">保存</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
                    title="取消编辑"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline font-medium">取消</span>
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
                title="保存到本地"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">保存</span>
              </button>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-medium">PPT</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-medium">PDF</span>
              </button>
              <button
                onClick={handleExportText}
                className="group flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
                title="如果PDF有乱码，可以使用文本格式"
              >
                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline font-medium">TXT</span>
              </button>
              <button
                onClick={handleGenerateQuestionnaire}
                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-105"
                title="生成市场验证问卷"
              >
                <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-medium">问卷</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 步骤指示器 */}
      <div className="relative border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-white/40">
              <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400">✓</span>
              <span className="hidden sm:inline">输入想法</span>
            </div>
            <div className="w-6 sm:w-12 h-px bg-white/20"></div>
            <div className="flex items-center gap-2 text-white/40">
              <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400">✓</span>
              <span className="hidden sm:inline">商业要素</span>
            </div>
            <div className="w-6 sm:w-12 h-px bg-white/20"></div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <span className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400 flex items-center justify-center text-white shadow-lg">3</span>
              <span className="hidden sm:inline">完整计划书</span>
            </div>
            <div className="w-6 sm:w-12 h-px bg-white/20"></div>
            <div className="flex items-center gap-2 text-white/40">
              <span className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">4</span>
              <span className="hidden sm:inline">问卷/导出</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Loading State */}
        {isGenerating && !planData && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75"></div>
                <Loader2 className="relative w-12 h-12 text-white animate-spin mx-auto mb-4" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                AI 正在生成完整商业计划书...
              </h2>
              <p className="text-white/60">
                使用流式输出技术，您将实时看到内容生成过程
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl blur opacity-25"></div>
            <div className="relative bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 text-center">
              <p className="text-red-200 font-semibold mb-4">{error}</p>
              <button
                onClick={generateFullPlan}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all hover:scale-105 font-medium"
              >
                重新生成
              </button>
            </div>
          </div>
        )}

        {/* Plan Content */}
        {planData && (
          <div id="business-plan-content" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              {/* Cover Page */}
              <div className="border-b border-white/10 p-6 sm:p-12 text-center bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white/90">AI Generated</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  {planData.title}
                </h1>
                <p className="text-base sm:text-lg text-white/60">
                  生成时间：{planData.createdAt ? new Date(planData.createdAt).toISOString().split('T')[0] : ''}
                </p>
              </div>

              {/* Business Elements Summary */}
              <div className="p-6 sm:p-8 border-b border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    执行摘要
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: '🎯', title: '核心问题', content: planData.elements.problem, color: 'from-blue-500/20 to-cyan-500/20' },
                    { icon: '💡', title: '解决方案', content: planData.elements.solution, color: 'from-green-500/20 to-emerald-500/20' },
                    { icon: '👥', title: '目标用户', content: planData.elements.targetUsers, color: 'from-purple-500/20 to-pink-500/20' },
                    { icon: '⭐', title: '价值主张', content: planData.elements.valueProposition, color: 'from-orange-500/20 to-red-500/20' },
                    { icon: '💰', title: '商业模式', content: planData.elements.businessModel, color: 'from-indigo-500/20 to-purple-500/20' },
                    { icon: '📊', title: '市场规模', content: planData.elements.marketSize, color: 'from-cyan-500/20 to-blue-500/20' }
                  ].map((item, index) => (
                    <div key={index} className="group relative">
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-2xl blur opacity-0 group-hover:opacity-100 transition`}></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          {item.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {planData.elements.competitors && planData.elements.competitors.length > 0 && (
                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="text-2xl">🔍</span>
                          主要竞争对手
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {planData.elements.competitors.map((competitor: string, index: number) => (
                            <li key={index} className="flex items-center gap-2 text-white/70">
                              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                              {competitor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Competitor Analysis */}
              <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    竞品分析
                  </h2>
                </div>

                {isLoadingCompetitors && (
                  <div className="flex items-center gap-3 text-white/60">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>正在分析市场竞争情况...</span>
                  </div>
                )}

                {!isLoadingCompetitors && !competitorData && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-white/20" />
                    <p className="text-white/40">暂无竞品数据</p>
                  </div>
                )}

                {competitorData && (
                  <div className="space-y-6">
                    {/* Market Overview */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                          市场概况
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {competitorData.analysis.marketOverview}
                        </p>
                      </div>
                    </div>

                    {/* Competitors Table */}
                    {competitorData.competitors && competitorData.competitors.length > 0 && (
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all overflow-x-auto">
                          <h3 className="text-lg font-semibold text-white mb-4">
                            主要竞争对手对比
                          </h3>
                          <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-xs sm:text-sm min-w-[600px]">
                              <thead>
                                <tr className="border-b-2 border-white/10">
                                  <th className="text-left py-3 px-2 font-semibold text-white/80">竞品名称</th>
                                  <th className="text-left py-3 px-2 font-semibold text-white/80">市场份额</th>
                                  <th className="text-left py-3 px-2 font-semibold text-white/80">目标用户</th>
                                  <th className="text-left py-3 px-2 font-semibold text-white/80">优势</th>
                                  <th className="text-left py-3 px-2 font-semibold text-white/80">劣势</th>
                                </tr>
                              </thead>
                              <tbody>
                                {competitorData.competitors.map((comp: any, index: number) => (
                                  <tr key={comp.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-2 font-medium text-white">{comp.name}</td>
                                    <td className="py-3 px-2 text-white/70">{comp.marketShare || '未知'}</td>
                                    <td className="py-3 px-2 text-white/60 text-xs">{comp.targetUsers || '通用用户'}</td>
                                    <td className="py-3 px-2 text-white/60 text-xs">
                                      <ul className="list-disc list-inside space-y-1">
                                        {comp.strengths.slice(0, 2).map((strength: string, i: number) => (
                                          <li key={i}>{strength}</li>
                                        ))}
                                      </ul>
                                    </td>
                                    <td className="py-3 px-2 text-white/60 text-xs">
                                      <ul className="list-disc list-inside space-y-1">
                                        {comp.weaknesses.slice(0, 2).map((weakness: string, i: number) => (
                                          <li key={i}>{weakness}</li>
                                        ))}
                                      </ul>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Competitive Advantages */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-green-400 mb-3">
                          ✨ 我们的竞争优势
                        </h3>
                        <ul className="space-y-2">
                          {competitorData.analysis.competitiveAdvantages.map((advantage: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">✓</span>
                              <span className="text-white/70">{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Differentiation Strategy */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-purple-400 mb-3">
                          🎯 差异化策略
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {competitorData.analysis.differentiationStrategy}
                        </p>
                      </div>
                    </div>

                    {/* Market Gap */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-orange-400 mb-3">
                          💡 市场空白点
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {competitorData.analysis.marketGap}
                        </p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-blue-400 mb-3">
                          📌 战略建议
                        </h3>
                        <ul className="space-y-2">
                          {competitorData.analysis.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-400 mt-1">→</span>
                              <span className="text-white/70">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Model */}
              <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      财务模型
                    </h2>
                  </div>

                  {!showFinancialModel && (
                    <button
                      onClick={handleGenerateFinancialModel}
                      disabled={isGeneratingFinancial}
                      className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:scale-105 backdrop-blur-sm border border-white/20"
                    >
                      {isGeneratingFinancial ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>生成中...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>生成财务模型</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isGeneratingFinancial && !financialModel && (
                  <div className="flex items-center gap-3 text-white/60 py-8">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>正在生成财务预测模型...</span>
                  </div>
                )}

                {!showFinancialModel && !isGeneratingFinancial && (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">点击上方按钮生成 3 年财务预测模型</p>
                    <p className="text-sm text-white/40">包含收入预测、成本结构、关键指标等</p>
                  </div>
                )}

                {showFinancialModel && financialModel && (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-4">📊 关键指标</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: 'LTV', value: `¥${financialModel.metrics.ltv ? financialModel.metrics.ltv.toLocaleString() : '0'}`, color: 'from-blue-500/20 to-cyan-500/20', textColor: 'text-blue-400' },
                            { label: 'CAC', value: `¥${financialModel.metrics.cac ? financialModel.metrics.cac.toLocaleString() : '0'}`, color: 'from-orange-500/20 to-red-500/20', textColor: 'text-orange-400' },
                            { label: 'LTV/CAC', value: `${financialModel.metrics.ltvCacRatio ? financialModel.metrics.ltvCacRatio.toFixed(1) : '-'}x`, color: 'from-green-500/20 to-emerald-500/20', textColor: 'text-green-400' },
                            { label: '烧钱率', value: `¥${financialModel.metrics.burnRate ? financialModel.metrics.burnRate.toLocaleString() : '0'}万/月`, color: 'from-red-500/20 to-pink-500/20', textColor: 'text-red-400' },
                            { label: '跑道期', value: `${financialModel.metrics.runway || '-'}个月`, color: 'from-purple-500/20 to-pink-500/20', textColor: 'text-purple-400' }
                          ].map((metric, index) => (
                            <div key={index} className={`bg-gradient-to-br ${metric.color} backdrop-blur-sm rounded-xl p-4 border border-white/10`}>
                              <div className="text-xs text-white/60 mb-1">{metric.label}</div>
                              <div className={`text-xl font-bold ${metric.textColor}`}>{metric.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3-Year Projections with Charts */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">📈 3年财务预测</h3>
                      </div>

                      {/* Financial Trends Chart */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                          <h4 className="text-base font-semibold text-white mb-4">收入成本趋势</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={financialModel.projections}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="year" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                                  formatter={(value: any, name: string) => [
                                    `¥${Number(value).toLocaleString()}`,
                                    name === 'revenue' ? '收入' : name === 'costs' ? '成本' : '利润'
                                  ]}
                                  labelFormatter={(year) => `第 ${year} 年`}
                                  labelStyle={{ color: '#ffffff' }}
                                />
                                <Legend wrapperStyle={{ color: '#ffffff80' }} />
                                <Line
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke={COLORS.primary}
                                  strokeWidth={3}
                                  name="revenue"
                                  dot={{ fill: COLORS.primary, r: 6 }}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="costs"
                                  stroke={COLORS.secondary}
                                  strokeWidth={3}
                                  name="costs"
                                  dot={{ fill: COLORS.secondary, r: 6 }}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="profit"
                                  stroke={COLORS.success}
                                  strokeWidth={3}
                                  name="profit"
                                  dot={{ fill: COLORS.success, r: 6 }}
                                  activeDot={{ r: 8 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* User Growth Chart */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                          <h4 className="text-base font-semibold text-white mb-4">用户增长趋势</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={financialModel.projections}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="year" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                                  formatter={(value: any) => [`${Number(value).toLocaleString()}`, '用户数']}
                                  labelFormatter={(year) => `第 ${year} 年`}
                                  labelStyle={{ color: '#ffffff' }}
                                />
                                <Bar dataKey="users" fill={COLORS.info} radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Streams Pie Chart */}
                      {financialModel.revenueStreams.length > 0 && (
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                            <h4 className="text-base font-semibold text-white mb-4">收入来源占比</h4>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={financialModel.revenueStreams.map((stream, index) => ({
                                      name: stream.name,
                                      value: stream.pricing,
                                      percentage: stream.pricing
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    labelLine={false}
                                  >
                                    {financialModel.revenueStreams.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                                    formatter={(value: any) => [`${value}%`, '占比']}
                                    labelStyle={{ color: '#ffffff' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Data Table */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all overflow-x-auto">
                          <h4 className="text-base font-semibold text-white mb-4">详细数据</h4>
                          <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-xs sm:text-sm min-w-[500px]">
                              <thead>
                                <tr className="border-b-2 border-white/10">
                                  <th className="text-left py-3 px-2 font-semibold text-white/80">年份</th>
                                  <th className="text-right py-3 px-2 font-semibold text-white/80">收入（万元）</th>
                                  <th className="text-right py-3 px-2 font-semibold text-white/80">成本（万元）</th>
                                  <th className="text-right py-3 px-2 font-semibold text-white/80">利润（万元）</th>
                                  <th className="text-right py-3 px-2 font-semibold text-white/80">用户数</th>
                                  <th className="text-center py-3 px-2 font-semibold text-white/80">盈亏平衡</th>
                                </tr>
                              </thead>
                              <tbody>
                                {financialModel.projections.map((proj, index) => (
                                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-2 font-medium text-white">第 {proj.year} 年</td>
                                    <td className="py-3 px-2 text-right text-white">¥{proj.revenue.toLocaleString()}</td>
                                    <td className="py-3 px-2 text-right text-white/70">¥{proj.costs.toLocaleString()}</td>
                                    <td className={`py-3 px-2 text-right font-semibold ${proj.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      ¥{proj.profit.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 text-right text-white/70">{proj.users.toLocaleString()}</td>
                                    <td className="py-3 px-2 text-center">
                                      {proj.breakeven ? (
                                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">是</span>
                                      ) : (
                                        <span className="inline-block px-2 py-1 bg-gray-500/20 text-white/40 rounded text-xs font-medium border border-white/10">否</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Streams */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-4">💵 收入来源</h3>
                        <div className="space-y-3">
                          {financialModel.revenueStreams.map((stream, index) => (
                            <div key={index} className="border-l-4 border-blue-400 pl-4 py-2 bg-white/5 rounded-r-xl">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white text-sm sm:text-base">{stream.name}</h4>
                                  <p className="text-xs sm:text-sm text-white/60 mt-1">{stream.description}</p>
                                </div>
                                <div className="ml-4 text-right">
                                  <div className="text-base sm:text-lg font-bold text-blue-400">¥{stream.pricing.toLocaleString()}</div>
                                  <div className="text-xs text-white/40">{stream.unit}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Funding Needs */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-4">🎯 融资需求</h3>
                        <div className="mb-4">
                          <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                            ¥{financialModel.fundingNeeds.amount.toLocaleString()} 万元
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">资金用途</h4>
                            <ul className="space-y-1 text-xs sm:text-sm">
                              {financialModel.fundingNeeds.usage.map((use, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-0.5">•</span>
                                  <span className="text-white/70">{use}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">关键里程碑</h4>
                            <ul className="space-y-1 text-xs sm:text-sm">
                              {financialModel.fundingNeeds.milestone.map((milestone, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">✓</span>
                                  <span className="text-white/70">{milestone}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                        <h3 className="text-lg font-semibold text-white mb-4">📝 关键假设</h3>
                        <ul className="grid md:grid-cols-2 gap-2 text-xs sm:text-sm">
                          {financialModel.assumptions.map((assumption, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-purple-400 mt-0.5">→</span>
                              <span className="text-white/70">{assumption}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Generated Full Plan */}
              <div className="p-6 sm:p-8 border-b border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    详细计划书内容
                  </h2>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                    <div className="prose prose-lg max-w-none text-white/80 leading-relaxed markdown-content">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-200 backdrop-blur-sm">
                            💡 提示：支持 Markdown 语法，可以使用粗体、斜体、列表等格式
                          </div>
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full min-h-[400px] p-4 bg-black/40 border-2 border-white/20 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all text-white placeholder-white/30 backdrop-blur-sm"
                            placeholder="编辑您的商业计划书内容..."
                          />
                          <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="text-sm text-white/60">
                              字数：{editedContent.length} 字符
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                              >
                                取消
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all"
                              >
                                保存修改
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1 className="text-3xl sm:text-4xl font-bold mt-8 mb-4 text-yellow-300" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-2xl sm:text-3xl font-bold mt-6 mb-3 text-yellow-300" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-xl sm:text-2xl font-semibold mt-4 mb-2 text-yellow-300" {...props} />
                            ),
                            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-white/80" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-white/80" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-white/80" {...props} />,
                            li: ({ node, ...props }) => <li className="ml-4 text-white/80" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                            code: ({ node, inline, ...props }: any) =>
                              inline ? (
                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400" {...props} />
                              ) : (
                                <code className="block bg-white/10 p-4 rounded-lg my-4 text-sm font-mono overflow-x-auto text-white/90" {...props} />
                              ),
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-400 pl-4 italic my-4 text-white/70" {...props} />,
                          }}
                        >
                          {planData.content}
                        </ReactMarkdown>
                      )}

                      {isGenerating && (
                        <span className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse"></span>
                      )}

                      <div ref={contentEndRef}></div>
                    </div>

                    {isGenerating && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-blue-400">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>AI 正在实时生成内容...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-8 text-center text-white/40 text-sm">
                <p>本商业计划书由 PitchAI 自动生成</p>
                <p className="mt-2">仅供参考，请根据实际情况调整</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative group max-w-4xl w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition"></div>
            <div className="relative bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">选择 PPT 模板</h2>
                  <p className="text-sm sm:text-base text-white/60">选择一个适合您商业计划的视觉风格</p>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {[
                    { id: 'business', name: '商务专业', desc: '适合投资路演、企业汇报等正式场合', colors: ['#1E40AF', '#7C3AED', '#3B82F6', '#8B5CF6'], gradient: 'from-blue-500/20 to-purple-500/20' },
                    { id: 'creative', name: '创意活力', desc: '适合创意行业、文化传媒等领域', colors: ['#EA580C', '#F59E0B', '#F97316', '#FB923C'], gradient: 'from-orange-500/20 to-red-500/20' },
                    { id: 'minimal', name: '极简现代', desc: '适合科技公司、设计工作室等', colors: ['#374151', '#6B7280', '#4B5563', '#9CA3AF'], gradient: 'from-gray-500/20 to-gray-600/20' },
                    { id: 'vibrant', name: '活力清新', desc: '适合环保、健康、教育等领域', colors: ['#10B981', '#06B6D4', '#14B8A6', '#22D3EE'], gradient: 'from-green-500/20 to-cyan-500/20' }
                  ].map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id as any)}
                      className={`cursor-pointer group/card relative rounded-2xl p-6 transition-all ${
                        selectedTemplate === template.id
                          ? 'ring-2 ring-white/50 bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${template.gradient} rounded-2xl blur opacity-0 group-hover/card:opacity-100 transition`}></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{template.name}</h3>
                          {selectedTemplate === template.id && (
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-white/60 mb-4 text-sm">{template.desc}</p>
                        <div className="flex gap-2">
                          {template.colors.map((color, i) => (
                            <div key={i} className="w-12 h-12 rounded-lg" style={{ backgroundColor: color }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleExportPPT}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all shadow-lg font-medium"
                  >
                    确认并生成 PPT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Loading Modal */}
      {(isExportingPDF || isExportingPPT) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition"></div>
            <div className="relative bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20">
              <div className="text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75"></div>
                    <Loader2 className="relative w-16 h-16 text-white animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{exportProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isExportingPDF ? '正在生成 PDF' : '正在生成 PPT'}
                </h3>
                <p className="text-white/60 mb-6">
                  {isExportingPDF ? '正在将商业计划书转换为 PDF 格式...' : '正在创建专业演示文稿...'}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden backdrop-blur-sm">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>

                {/* Progress Text */}
                <p className="text-sm text-white/60">
                  {exportProgress < 30 && '正在准备数据...'}
                  {exportProgress >= 30 && exportProgress < 60 && '正在渲染内容...'}
                  {exportProgress >= 60 && exportProgress < 90 && '正在优化格式...'}
                  {exportProgress >= 90 && exportProgress < 100 && '即将完成...'}
                  {exportProgress === 100 && '✅ 生成完成！'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 智能建议面板 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100%-2rem)] z-50">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-black/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 max-h-96 overflow-hidden flex flex-col">
              {/* 头部 */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-bold">AI 智能建议</h3>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 建议列表 */}
              <div className="p-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/10">
                      <span className="text-lg mt-0.5">{suggestion.split(' ')[0]}</span>
                      <span className="text-sm text-white/80 leading-relaxed flex-1">
                        {suggestion.substring(suggestion.indexOf(' ') + 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部操作 */}
              <div className="border-t border-white/10 p-3 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    共 {suggestions.length} 条建议
                  </span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    知道了
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
