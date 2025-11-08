/**
 * 本地存储工具函数
 * 用于保存和管理用户生成的商业计划书和问卷
 */

import type { FinancialModel } from '@/types';

export interface SavedItem {
  id: string;
  title: string;
  type: 'business-plan' | 'questionnaire';
  elements: any;
  content?: string; // 商业计划书内容
  questions?: any[]; // 问卷问题
  financialModel?: FinancialModel; // 财务模型
  competitorData?: any; // 竞品分析数据
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'pitchAI_saved_items';

/**
 * 获取所有保存的项目
 */
export function getAllSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取本地存储失败:', error);
    return [];
  }
}

/**
 * 保存商业计划书
 */
export function saveBusinessPlan(planData: {
  title: string;
  elements: any;
  content: string;
  financialModel?: FinancialModel;
  competitorData?: any;
  createdAt?: string;
}): SavedItem {
  const items = getAllSavedItems();

  const newItem: SavedItem = {
    id: `plan_${Date.now()}`,
    title: planData.title,
    type: 'business-plan',
    elements: planData.elements,
    content: planData.content,
    financialModel: planData.financialModel,
    competitorData: planData.competitorData,
    createdAt: planData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.unshift(newItem); // 添加到开头

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    console.log('商业计划书保存成功:', newItem.id, {
      hasFinancialModel: !!planData.financialModel,
      hasCompetitorData: !!planData.competitorData
    });
    return newItem;
  } catch (error) {
    console.error('保存失败:', error);
    throw new Error('保存失败，可能是存储空间不足');
  }
}

/**
 * 保存问卷
 */
export function saveQuestionnaire(questionnaireData: {
  title: string;
  elements: any;
  questions: any[];
  createdAt?: string;
}): SavedItem {
  const items = getAllSavedItems();

  const newItem: SavedItem = {
    id: `questionnaire_${Date.now()}`,
    title: questionnaireData.title,
    type: 'questionnaire',
    elements: questionnaireData.elements,
    questions: questionnaireData.questions,
    createdAt: questionnaireData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.unshift(newItem);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    console.log('问卷保存成功:', newItem.id);
    return newItem;
  } catch (error) {
    console.error('保存失败:', error);
    throw new Error('保存失败，可能是存储空间不足');
  }
}

/**
 * 根据 ID 获取保存的项目
 */
export function getSavedItemById(id: string): SavedItem | null {
  const items = getAllSavedItems();
  return items.find(item => item.id === id) || null;
}

/**
 * 删除保存的项目
 */
export function deleteSavedItem(id: string): boolean {
  const items = getAllSavedItems();
  const filteredItems = items.filter(item => item.id !== id);

  if (filteredItems.length === items.length) {
    return false; // 没有找到要删除的项目
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
    console.log('删除成功:', id);
    return true;
  } catch (error) {
    console.error('删除失败:', error);
    return false;
  }
}

/**
 * 更新保存的项目
 */
export function updateSavedItem(id: string, updates: Partial<SavedItem>): boolean {
  const items = getAllSavedItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return false;
  }

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    console.log('更新成功:', id);
    return true;
  } catch (error) {
    console.error('更新失败:', error);
    return false;
  }
}

/**
 * 清空所有保存的项目
 */
export function clearAllSavedItems(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('已清空所有保存的项目');
    return true;
  } catch (error) {
    console.error('清空失败:', error);
    return false;
  }
}

/**
 * 获取存储使用情况
 */
export function getStorageInfo(): {
  itemCount: number;
  estimatedSize: string;
} {
  const items = getAllSavedItems();
  const dataString = localStorage.getItem(STORAGE_KEY) || '';
  const sizeInBytes = new Blob([dataString]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);

  return {
    itemCount: items.length,
    estimatedSize: `${sizeInKB} KB`,
  };
}
