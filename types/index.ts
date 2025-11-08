/**
 * 商业计划书相关类型定义
 */

// 商业要素
export interface BusinessElements {
  problem: string;           // 痛点问题
  solution: string;          // 解决方案
  targetUsers: string;       // 目标用户
  valueProposition: string;  // 价值主张
  businessModel: string;     // 商业模式
  marketSize: string;        // 市场规模
  competitors: string[];     // 竞争对手
}

// 商业计划书
export interface BusinessPlan {
  id: string;
  title: string;
  idea: string;              // 原始创业想法
  elements: BusinessElements;
  createdAt: Date;
  updatedAt: Date;
}

// AI 生成状态
export interface GenerationStatus {
  isGenerating: boolean;
  progress: number;          // 0-100
  currentStep: string;
  error?: string;
}

// 问卷相关
export interface Question {
  id: string;
  type: 'text' | 'radio' | 'checkbox' | 'scale';
  question: string;
  options?: string[];
}

export interface Questionnaire {
  id: string;
  planId: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
}

// 财务模型
export interface RevenueStream {
  name: string;              // 收入来源名称
  description: string;       // 描述
  model: 'subscription' | 'one-time' | 'usage-based' | 'freemium' | 'advertising' | 'other';
  pricing: number;           // 单价
  unit: string;              // 单位 (用户/月, 次, 等)
}

export interface CostStructure {
  category: 'fixed' | 'variable' | 'semi-variable';
  name: string;              // 成本项名称
  description: string;       // 描述
  amount: number;            // 金额
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
}

export interface FinancialProjection {
  year: number;              // 第几年
  revenue: number;           // 预计收入
  costs: number;             // 预计成本
  profit: number;            // 预计利润
  users: number;             // 预计用户数
  breakeven: boolean;        // 是否盈亏平衡
}

export interface FinancialModel {
  revenueStreams: RevenueStream[];
  costStructure: CostStructure[];
  projections: FinancialProjection[];  // 3-5年预测
  assumptions: string[];                // 关键假设
  fundingNeeds: {
    amount: number;                     // 融资需求
    usage: string[];                    // 资金用途
    milestone: string[];                // 关键里程碑
  };
  metrics: {
    ltv: number;                        // 客户生命周期价值 (Lifetime Value)
    cac: number;                        // 客户获取成本 (Customer Acquisition Cost)
    ltvCacRatio: number;                // LTV/CAC 比率
    burnRate: number;                   // 烧钱率
    runway: number;                     // 跑道期（月）
  };
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
