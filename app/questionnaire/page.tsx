'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, Download, ArrowLeft, Loader2, CheckCircle2, Save, Sparkles, MessageSquare, Send } from 'lucide-react';
import { saveQuestionnaire } from '@/lib/utils/storage';

interface Question {
  id: number;
  category: string;
  type: 'choice' | 'multiple' | 'scale' | 'text';
  question: string;
  options?: string[];
  purpose: string;
}

interface QuestionnaireData {
  title: string;
  elements: any;
  questions: Question[];
  createdAt: string;
}

// 用户答案类型
interface Answer {
  questionId: number;
  type: 'choice' | 'multiple' | 'scale' | 'text';
  value: string | string[] | number; // choice: string, multiple: string[], scale: number, text: string
}

export default function QuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [error, setError] = useState('');
  const hasLoadedFromHistory = useRef(false); // 追踪是否已从历史记录加载

  // 新增：用户答案状态
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateQuestionnaire = async () => {
    // 如果已经从历史记录加载过，不要重复生成
    if (hasLoadedFromHistory.current && questionnaireData) {
      console.log('⏭️ 已从历史记录加载，跳过重复生成');
      return;
    }

    // 从 sessionStorage 读取数据
    let elements: any = null;
    let loadedContent: string | null = null;
    let loadedCreatedAt: string | null = null;
    let loadedTitle: string | null = null;

    if (typeof window !== 'undefined') {
      try {
        const storedElements = sessionStorage.getItem('businessElements');
        if (storedElements) {
          elements = JSON.parse(storedElements);
        }

        // 检查是否有已加载的完整内容（从历史记录查看）
        loadedContent = sessionStorage.getItem('loadedQuestionnaireContent');
        loadedCreatedAt = sessionStorage.getItem('businessCreatedAt');
        loadedTitle = sessionStorage.getItem('businessTitle');

        // 如果有完整内容，直接使用，不需要调用API
        if (loadedContent && elements) {
          console.log('📋 从历史记录加载已保存的问卷');
          try {
            // loadedContent 是问题数组的 JSON 字符串
            const questions = JSON.parse(loadedContent);

            setQuestionnaireData({
              title: loadedTitle || '市场验证问卷',
              elements,
              questions: Array.isArray(questions) ? questions : (questions.questions || []),
              createdAt: loadedCreatedAt || new Date().toISOString(),
            });

            // 标记已从历史记录加载
            hasLoadedFromHistory.current = true;

            // 延迟清除 sessionStorage，避免 React Strict Mode 重复渲染时丢失数据
            setTimeout(() => {
              sessionStorage.removeItem('loadedQuestionnaireContent');
              sessionStorage.removeItem('businessCreatedAt');
              sessionStorage.removeItem('businessTitle');
            }, 100);

            return; // 直接返回，不执行后续的API调用
          } catch (parseError) {
            console.error('解析已保存的问卷内容失败:', parseError);
            // 如果解析失败，继续执行API调用
          }
        }
      } catch (e) {
        console.error('从 sessionStorage 读取数据失败:', e);
      }
    }

    if (!elements) {
      setError('缺少商业要素数据，请返回首页重新生成');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败，请重试');
      }

      const data = await response.json();

      if (data.success) {
        setQuestionnaireData(data.data);
      } else {
        throw new Error(data.error || '生成失败，请重试');
      }
    } catch (err) {
      console.error('生成失败:', err);
      const errorMessage = err instanceof Error ? err.message : '生成失败，请重试';
      setError(errorMessage);

      // 显示更友好的错误提示
      if (errorMessage.includes('JSON')) {
        setError('数据格式解析失败，这可能是由于 AI 返回了不规范的数据。请点击下方的"重新生成"按钮重试。');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 页面加载时自动生成
  useEffect(() => {
    // 只在没有数据且没有正在生成时才调用
    if (!questionnaireData && !isGenerating && !error) {
      generateQuestionnaire();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在挂载时执行一次

  const handleExportText = () => {
    if (!questionnaireData) {
      alert('没有可导出的内容');
      return;
    }

    // 构建文本内容
    let content = `市场验证问卷\n\n`;
    content += `生成时间：${new Date(questionnaireData.createdAt).toISOString().split('T')[0]}\n\n`;
    content += `===================================\n\n`;

    // 按类别分组
    const categories = Array.from(new Set(questionnaireData.questions.map(q => q.category)));

    categories.forEach((category, idx) => {
      content += `【${category}】\n\n`;
      const categoryQuestions = questionnaireData.questions.filter(q => q.category === category);

      categoryQuestions.forEach((question) => {
        content += `${question.id}. ${question.question}\n`;

        if (question.type === 'choice' || question.type === 'multiple') {
          question.options?.forEach((option, optIdx) => {
            content += `   ${String.fromCharCode(65 + optIdx)}. ${option}\n`;
          });
        } else if (question.type === 'scale') {
          content += `   评分：1 分（非常不同意）- 5 分（非常同意）\n`;
        } else if (question.type === 'text') {
          content += `   （开放式问题，请详细描述）\n`;
        }

        content += `   调研目的：${question.purpose}\n\n`;
      });

      if (idx < categories.length - 1) {
        content += `-----------------------------------\n\n`;
      }
    });

    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `市场验证问卷_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // 显示成功提示
    const successToast = document.createElement('div');
    successToast.innerHTML = '✅ 问卷导出成功！';
    successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 backdrop-blur-xl border border-white/20';
    document.body.appendChild(successToast);
    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 3000);
  };

  const handleSave = () => {
    if (!questionnaireData) {
      alert('没有可保存的内容');
      return;
    }

    try {
      saveQuestionnaire({
        title: questionnaireData.title,
        elements: questionnaireData.elements,
        questions: questionnaireData.questions,
        createdAt: questionnaireData.createdAt,
      });

      // 显示成功提示
      const successToast = document.createElement('div');
      successToast.innerHTML = '💾 问卷保存成功！可在历史记录中查看';
      successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 backdrop-blur-xl border border-white/20';
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

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'choice':
        return '单选题';
      case 'multiple':
        return '多选题';
      case 'scale':
        return '量表题';
      case 'text':
        return '开放题';
      default:
        return '未知';
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'multiple':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'scale':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'text':
        return 'bg-gradient-to-r from-orange-500 to-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 新增：答案处理函数
  const handleChoiceAnswer = (questionId: number, option: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a =>
          a.questionId === questionId
            ? { ...a, value: option }
            : a
        );
      }
      return [...prev, { questionId, type: 'choice', value: option }];
    });
  };

  const handleMultipleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        const currentValues = existing.value as string[];
        const newValues = currentValues.includes(option)
          ? currentValues.filter(v => v !== option)
          : [...currentValues, option];
        return prev.map(a =>
          a.questionId === questionId
            ? { ...a, value: newValues }
            : a
        );
      }
      return [...prev, { questionId, type: 'multiple', value: [option] }];
    });
  };

  const handleScaleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a =>
          a.questionId === questionId
            ? { ...a, value: score }
            : a
        );
      }
      return [...prev, { questionId, type: 'scale', value: score }];
    });
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a =>
          a.questionId === questionId
            ? { ...a, value: text }
            : a
        );
      }
      return [...prev, { questionId, type: 'text', value: text }];
    });
  };

  // 检查选项是否被选中
  const isOptionSelected = (questionId: number, option: string): boolean => {
    const answer = answers.find(a => a.questionId === questionId);
    if (!answer) return false;
    if (Array.isArray(answer.value)) {
      return answer.value.includes(option);
    }
    return answer.value === option;
  };

  // 检查分数是否被选中
  const isScoreSelected = (questionId: number, score: number): boolean => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.value === score;
  };

  // 获取文本答案
  const getTextAnswer = (questionId: number): string => {
    const answer = answers.find(a => a.questionId === questionId);
    return (answer?.value as string) || '';
  };

  // 提交问卷
  const handleSubmit = () => {
    if (!questionnaireData) return;

    // 检查是否所有必答题都已回答
    const unanswered = questionnaireData.questions.filter(
      q => !answers.find(a => a.questionId === q.id)
    );

    if (unanswered.length > 0) {
      alert(`还有 ${unanswered.length} 道题目未回答，请完成后再提交`);
      return;
    }

    // 标记为已提交
    setIsSubmitted(true);

    // 显示成功提示
    const successToast = document.createElement('div');
    successToast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <div>
          <div class="font-bold">问卷提交成功！</div>
          <div class="text-sm opacity-90">共回答 ${answers.length} 道题目</div>
        </div>
      </div>
    `;
    successToast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 backdrop-blur-xl border border-white/20';
    document.body.appendChild(successToast);
    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 3000);
  };

  // 计算完成进度
  const getProgress = (): number => {
    if (!questionnaireData) return 0;
    return Math.round((answers.length / questionnaireData.questions.length) * 100);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-base font-medium">返回首页</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-75"></div>
              <ClipboardList className="relative w-6 h-6 text-white p-1" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              市场验证问卷
            </h1>
          </div>

          {questionnaireData && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-4 py-2 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                title="保存到本地"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">保存</span>
                </div>
              </button>
              <button
                onClick={handleExportText}
                className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium px-4 py-2 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">导出</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Loading State */}
        {isGenerating && !questionnaireData && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-12 sm:p-16 border border-white/10 text-center">
              <div className="relative inline-block mb-6">
                <Loader2 className="w-16 h-16 text-green-400 animate-spin" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                AI 正在生成市场验证问卷...
              </h2>
              <p className="text-base sm:text-lg text-white/60">
                根据您的商业要素，智能生成针对性的调研问题
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 text-center">
              <p className="text-red-300 font-semibold mb-6 text-lg">{error}</p>
              <button
                onClick={generateQuestionnaire}
                className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold px-8 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative">重新生成</span>
              </button>
            </div>
          </div>
        )}

        {/* Questionnaire Content */}
        {questionnaireData && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="relative p-8 sm:p-10 border-b border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur"></div>
                    <CheckCircle2 className="relative w-12 h-12 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                      {questionnaireData.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                        📅 {new Date(questionnaireData.createdAt).toISOString().split('T')[0]}
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                        📝 共 {questionnaireData.questions.length} 道题目
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/30 rounded-lg backdrop-blur-sm border border-green-500/50">
                        ✅ 已完成 {getProgress()}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-white/70">填写进度</span>
                    <span className="text-green-400 font-bold">{answers.length} / {questionnaireData.questions.length}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${getProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Introduction */}
              <div className="p-8 border-b border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">问卷说明</h2>
                </div>
                <div className="space-y-3 text-base text-white/80">
                  <p>
                    本问卷旨在验证「<span className="text-green-400 font-semibold">{questionnaireData.elements.solution}</span>」这一商业概念的市场需求和可行性。
                  </p>
                  <p>
                    您的真实反馈将帮助我们更好地了解目标用户的需求，优化产品和服务。
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-sm">
                    <span className="px-3 py-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30 text-blue-300">
                      ⏱️ 预计填写时间：5-8 分钟
                    </span>
                    <span className="px-3 py-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30 text-purple-300">
                      🔒 信息严格保密
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="p-8">
                <div className="space-y-8">
                  {(() => {
                    const categories = Array.from(new Set(questionnaireData.questions.map(q => q.category)));
                    return categories.map((category, categoryIdx) => {
                      const categoryQuestions = questionnaireData.questions.filter(q => q.category === category);
                      return (
                        <div key={categoryIdx} className="space-y-6">
                          <div className="flex items-center gap-3 pb-3 border-b border-green-500/30">
                            <Sparkles className="w-5 h-5 text-green-400" />
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                              {category}
                            </h3>
                          </div>

                          {categoryQuestions.map((question) => (
                            <div
                              key={question.id}
                              className="group relative"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                                    {question.id}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className={`${getQuestionTypeColor(question.type)} px-3 py-1 rounded-lg text-white text-xs font-semibold shadow-md`}>
                                        {getQuestionTypeLabel(question.type)}
                                      </span>
                                    </div>
                                    <p className="text-lg font-semibold text-white">
                                      {question.question}
                                    </p>
                                  </div>
                                </div>

                                {/* Options */}
                                {(question.type === 'choice' || question.type === 'multiple') && question.options && (
                                  <div className="ml-14 space-y-2.5">
                                    {question.options.map((option, optIdx) => {
                                      const isSelected = isOptionSelected(question.id, option);
                                      return (
                                        <div
                                          key={optIdx}
                                          onClick={() => {
                                            if (question.type === 'choice') {
                                              handleChoiceAnswer(question.id, option);
                                            } else {
                                              handleMultipleAnswer(question.id, option);
                                            }
                                          }}
                                          className={`group/opt flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                            isSelected
                                              ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20'
                                              : 'bg-white/5 border-white/10 hover:border-green-400/50 hover:bg-green-500/10'
                                          }`}
                                        >
                                          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                                            isSelected
                                              ? 'bg-green-500 text-white scale-110'
                                              : 'bg-white/10 text-white/70 group-hover/opt:bg-green-500 group-hover/opt:text-white'
                                          }`}>
                                            {isSelected ? '✓' : String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className={`transition-colors ${
                                            isSelected ? 'text-white font-medium' : 'text-white/80 group-hover/opt:text-white'
                                          }`}>{option}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Scale */}
                                {question.type === 'scale' && (
                                  <div className="ml-14 flex gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => {
                                      const isSelected = isScoreSelected(question.id, num);
                                      return (
                                        <div
                                          key={num}
                                          onClick={() => handleScaleAnswer(question.id, num)}
                                          className={`flex-1 p-4 rounded-xl border text-center transition-all cursor-pointer group/scale ${
                                            isSelected
                                              ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20'
                                              : 'bg-white/5 border-white/10 hover:border-green-400/50 hover:bg-green-500/10'
                                          }`}
                                        >
                                          <div className={`text-2xl font-bold mb-1 transition-transform ${
                                            isSelected
                                              ? 'text-green-400 scale-125'
                                              : 'text-white group-hover/scale:scale-110'
                                          }`}>{num}</div>
                                          <div className={`text-xs transition-colors ${
                                            isSelected ? 'text-green-300' : 'text-white/60 group-hover/scale:text-white/80'
                                          }`}>
                                            {num === 1 && '非常不同意'}
                                            {num === 3 && '中立'}
                                            {num === 5 && '非常同意'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Text Input */}
                                {question.type === 'text' && (
                                  <div className="ml-14">
                                    <textarea
                                      placeholder="请在此输入您的回答..."
                                      value={getTextAnswer(question.id)}
                                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                                      className="w-full p-4 border border-white/10 bg-white/5 rounded-xl resize-none focus:outline-none focus:border-green-500/50 focus:bg-white/10 text-white placeholder-white/40 backdrop-blur-sm transition-all"
                                      rows={3}
                                    />
                                  </div>
                                )}

                                {/* Purpose */}
                                <div className="ml-14 mt-4 p-4 bg-blue-500/10 rounded-xl border-l-4 border-blue-500">
                                  <p className="text-sm text-blue-200">
                                    <span className="font-semibold text-blue-300">调研目的：</span>
                                    {question.purpose}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-8 bg-black/20">
                {!isSubmitted ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center mb-2">
                      <p className="text-white/70 text-sm mb-1">
                        已完成 {answers.length} / {questionnaireData.questions.length} 题
                      </p>
                      {answers.length < questionnaireData.questions.length && (
                        <p className="text-orange-400 text-xs">
                          还有 {questionnaireData.questions.length - answers.length} 道题未回答
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={answers.length === 0}
                      className={`group relative overflow-hidden font-bold px-10 py-4 rounded-2xl transition-all duration-300 ${
                        answers.length === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center gap-3">
                        <Send className="w-5 h-5" />
                        <span className="text-lg">提交问卷</span>
                      </div>
                    </button>
                    <p className="text-white/40 text-xs">
                      提交后可以查看填写结果
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">问卷提交成功！</h3>
                    <p className="text-white/70 mb-6">感谢您的参与，您的反馈对我们非常重要</p>
                    <div className="inline-flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>共回答 {answers.length} 道题目</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400">
                        <span>⏱</span>
                        <span>完成率 {getProgress()}%</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/10">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    PitchAI
                  </span>
                </div>
                <p className="text-white/50 text-sm text-center mt-2">本问卷由 AI 自动生成，仅供市场调研参考</p>
                <p className="text-white/40 text-xs mt-1 text-center">请根据实际情况调整问题内容</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-green-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              PitchAI
            </span>
          </div>
          <p className="text-white/40 text-sm">
            让创业更简单 · AI驱动的商业计划书生成器
          </p>
        </div>
      </footer>
    </div>
  );
}
