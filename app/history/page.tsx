'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, FileText, ClipboardList, Trash2, Eye, Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import { getAllSavedItems, deleteSavedItem, getStorageInfo, type SavedItem } from '@/lib/utils/storage';

export default function HistoryPage() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [storageInfo, setStorageInfo] = useState({ itemCount: 0, estimatedSize: '0 KB' });

  // 加载保存的项目
  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = () => {
    const items = getAllSavedItems();
    setSavedItems(items);
    setStorageInfo(getStorageInfo());
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) {
      const success = deleteSavedItem(id);
      if (success) {
        loadSavedItems();
        // 显示成功提示
        const toast = document.createElement('div');
        toast.innerHTML = '✅ 删除成功';
        toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 backdrop-blur-xl border border-white/20 animate-slide-in';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 2000);
      }
    }
  };

  const handleView = (item: SavedItem) => {
    // 将数据存入 sessionStorage，然后跳转
    sessionStorage.setItem('businessElements', JSON.stringify(item.elements));
    sessionStorage.setItem('businessCreatedAt', item.createdAt);
    sessionStorage.setItem('businessTitle', item.title); // 保存标题

    if (item.type === 'business-plan') {
      // 商业计划书：保存完整内容，从历史记录查看时直接使用，不重新生成
      if (item.content) {
        sessionStorage.setItem('loadedPlanContent', item.content);
      }
      // 保存财务模型和竞品分析数据
      if (item.financialModel) {
        sessionStorage.setItem('loadedFinancialModel', JSON.stringify(item.financialModel));
      }
      if (item.competitorData) {
        sessionStorage.setItem('loadedCompetitorData', JSON.stringify(item.competitorData));
      }
      router.push('/plan');
    } else {
      // 问卷：保存问题数组，从历史记录查看时直接使用，不重新生成
      if (item.questions) {
        sessionStorage.setItem('loadedQuestionnaireContent', JSON.stringify(item.questions));
      }
      router.push('/questionnaire');
    }
  };

  const getTypeInfo = (type: string) => {
    if (type === 'business-plan') {
      return {
        icon: <FileText className="w-5 h-5" />,
        label: '商业计划书',
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
      };
    } else {
      return {
        icon: <ClipboardList className="w-5 h-5" />,
        label: '市场问卷',
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
      };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} 小时前`;
    } else if (diffInHours < 48) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-75"></div>
              <History className="relative w-6 h-6 text-white p-1" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              历史记录
            </h1>
          </div>

          <div className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-sm text-white/80 font-medium">
              {storageInfo.itemCount} 项 <span className="hidden sm:inline text-white/50">· {storageInfo.estimatedSize}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {savedItems.length === 0 ? (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-12 sm:p-16 border border-white/10 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
                <History className="relative w-16 h-16 sm:w-20 sm:h-20 text-white/30" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                暂无历史记录
              </h2>
              <p className="text-base sm:text-lg text-white/60 mb-8 max-w-md mx-auto">
                您还没有保存任何商业计划书或问卷，开始创建您的第一个项目吧
              </p>

              <button
                onClick={() => router.push('/')}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold px-8 py-4 text-base rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  开始创建
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {savedItems.map((item) => {
              const typeInfo = getTypeInfo(item.type);
              return (
                <div
                  key={item.id}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                  <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                      {/* Icon & Type */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`relative flex-shrink-0 p-3 rounded-xl ${typeInfo.color}`}>
                          <div className="absolute inset-0 bg-white/20 rounded-xl blur"></div>
                          <div className="relative">
                            {typeInfo.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">
                            {item.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-lg ${typeInfo.color} text-white font-medium`}>
                              {typeInfo.label}
                            </span>
                            <span className="flex items-center gap-1.5 text-white/60">
                              <Calendar className="w-4 h-4" />
                              {formatDate(item.createdAt)}
                            </span>
                            {item.financialModel && (
                              <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/30">
                                含财务模型
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0 lg:max-w-md">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-sm text-white/70 line-clamp-2 mb-2">
                            <span className="font-semibold text-blue-400">问题：</span>
                            {item.elements.problem}
                          </p>
                          <p className="text-sm text-white/70 line-clamp-1">
                            <span className="font-semibold text-green-400">方案：</span>
                            {item.elements.solution}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button
                          onClick={() => handleView(item)}
                          className="flex-1 lg:flex-initial group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>查看</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="group/del p-3 bg-white/5 hover:bg-red-500/20 rounded-xl transition-all border border-white/10 hover:border-red-500/50"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-white/60 group-hover/del:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
