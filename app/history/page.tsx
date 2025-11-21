'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
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
    sessionStorage.setItem('businessTitle', item.title);

    if (item.type === 'business-plan') {
      if (item.content) {
        sessionStorage.setItem('loadedPlanContent', item.content);
      }
      if (item.financialModel) {
        sessionStorage.setItem('loadedFinancialModel', JSON.stringify(item.financialModel));
      }
      if (item.competitorData) {
        sessionStorage.setItem('loadedCompetitorData', JSON.stringify(item.competitorData));
      }
      router.push('/plan');
    } else {
      if (item.questions) {
        sessionStorage.setItem('loadedQuestionnaireContent', JSON.stringify(item.questions));
      }
      router.push('/questionnaire');
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

  const getTypeTag = (item: SavedItem) => {
    if (item.type === 'business-plan') {
      if (item.financialModel) {
        return { label: '财务模型', color: 'bg-amber-600' };
      }
      return { label: '商业计划书', color: 'bg-blue-600' };
    }
    return { label: '市场问卷', color: 'bg-emerald-500' };
  };

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-slate-400 hover:text-white transition-colors group"
        >
          <Icons.ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          <span>返回首页</span>
        </button>
        <div className="flex items-center space-x-2">
          <Icons.Clock size={24} className="text-purple-500" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            历史记录
          </h1>
        </div>
        <div className="text-sm text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          {storageInfo.itemCount} 项 · {storageInfo.estimatedSize}
        </div>
      </div>

      {/* List Container */}
      <div className="max-w-5xl mx-auto space-y-4">
        {savedItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Icons.Sparkles size={48} className="mx-auto mb-4 opacity-20" />
            <p>暂无历史记录</p>
          </div>
        ) : (
          savedItems.map((item) => {
            const typeTag = getTypeTag(item);
            return (
              <div
                key={item.id}
                className="group relative bg-[#1e1b4b]/50 hover:bg-[#1e1b4b] border border-white/5 hover:border-purple-500/30 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Icon Box */}
                  <div
                    className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.type === 'questionnaire'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    <Icons.FileText size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded text-white ${typeTag.color}`}>
                        {typeTag.label}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Icons.Clock size={12} className="mr-1" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Problem/Solution Grid */}
                    <div className="bg-[#0f0a1e]/50 rounded-lg p-3 border border-white/5 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                      <p className="text-blue-400/80">
                        <span className="font-semibold opacity-70">问题: </span>
                        <span className="text-slate-400">{item.elements.problem}</span>
                      </p>
                      <p className="mt-1 text-emerald-400/80">
                        <span className="font-semibold opacity-70">方案: </span>
                        <span className="text-slate-400">{item.elements.solution}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleView(item)}
                      className="flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-900/20 w-24"
                    >
                      <Icons.Eye size={16} className="mr-2" />
                      查看
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors border border-white/5 w-24 md:w-auto md:h-auto aspect-square md:aspect-auto"
                      title="删除"
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
