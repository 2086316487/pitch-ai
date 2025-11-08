/**
 * 竞品分析工具函数
 * 结合预设数据库和AI分析生成竞品对比报告
 */

import {
  searchCompetitors,
  extractKeywordsFromElements,
  type Competitor
} from '../data/competitors';

export interface CompetitorAnalysis {
  competitors: Competitor[];
  analysis: {
    marketOverview: string;
    competitiveAdvantages: string[];
    differentiationStrategy: string;
    marketGap: string;
    recommendations: string[];
  };
}

/**
 * 生成竞品分析报告
 * @param elements 业务元素
 * @returns 竞品分析结果
 */
export function generateCompetitorAnalysis(elements: any): CompetitorAnalysis {
  // 1. 从业务元素中提取关键词
  const keywords = extractKeywordsFromElements(elements);
  console.log('🔑 提取的关键词:', keywords);

  // 2. 搜索相关竞品
  const competitors = searchCompetitors(keywords);
  console.log('🏢 找到的竞品:', competitors.map(c => c.name));

  // 3. 生成分析报告
  const analysis = analyzeCompetitors(elements, competitors);

  return {
    competitors: competitors.slice(0, 3), // 返回前3个最相关的竞品
    analysis
  };
}

/**
 * 分析竞品，生成对比报告
 */
function analyzeCompetitors(elements: any, competitors: Competitor[]) {
  // 市场概述
  let marketOverview = '';
  if (competitors.length > 0) {
    const industries = [...new Set(competitors.flatMap(c => c.industry))].slice(0, 3);
    marketOverview = `当前${industries.join('、')}领域竞争激烈，主要玩家包括${competitors.map(c => c.name).join('、')}等。`;

    // 分析市场集中度
    const topShare = competitors.reduce((sum, c) => {
      const share = parseFloat(c.marketShare || '0');
      return sum + share;
    }, 0);

    if (topShare > 60) {
      marketOverview += `头部企业市场份额较高（约${Math.round(topShare)}%），市场集中度较强，新进入者需要明确差异化策略。`;
    } else {
      marketOverview += `市场较为分散，仍有较大的创新和进入机会。`;
    }
  } else {
    marketOverview = '这是一个相对新兴或细分的市场领域，现有竞争者较少，存在先发优势机会。';
  }

  // 竞争优势分析（基于我们的方案 vs 竞品弱点）
  const competitiveAdvantages: string[] = [];

  // 分析竞品共同弱点
  const commonWeaknesses = findCommonWeaknesses(competitors);
  commonWeaknesses.forEach(weakness => {
    if (weakness.includes('个性化') && elements.solution.includes('AI')) {
      competitiveAdvantages.push('利用AI技术提供个性化服务，解决现有产品千篇一律的问题');
    }
    if (weakness.includes('老年人') && elements.targetUsers?.includes('老年人')) {
      competitiveAdvantages.push('专注老年人群体，提供更友好的交互体验');
    }
    if (weakness.includes('价格') || weakness.includes('成本')) {
      competitiveAdvantages.push('通过技术创新降低成本，提供更具性价比的解决方案');
    }
    if (weakness.includes('数据') || weakness.includes('隐私')) {
      competitiveAdvantages.push('注重用户隐私保护和数据安全，建立信任优势');
    }
  });

  // 如果没有找到明显优势，添加通用优势
  if (competitiveAdvantages.length === 0) {
    if (elements.solution.includes('AI')) {
      competitiveAdvantages.push('AI技术赋能，提升服务效率和精准度');
    }
    if (elements.uniqueValue) {
      competitiveAdvantages.push(`独特价值：${elements.uniqueValue}`);
    }
    competitiveAdvantages.push('精准定位细分市场，避免与巨头正面竞争');
    competitiveAdvantages.push('灵活创新，快速响应用户需求');
  }

  // 差异化策略
  let differentiationStrategy = '';
  if (elements.targetUsers) {
    differentiationStrategy += `聚焦${elements.targetUsers}这一细分人群，`;
  }
  if (elements.solution.includes('AI')) {
    differentiationStrategy += '通过AI技术实现智能化和个性化，';
  }
  differentiationStrategy += '打造轻量级、易用性强的产品体验。';

  // 市场空白点
  let marketGap = '';
  if (competitors.length > 0) {
    const hasAIWeakness = commonWeaknesses.some(w => w.includes('AI') || w.includes('个性化'));
    const hasUXWeakness = commonWeaknesses.some(w => w.includes('体验') || w.includes('复杂'));
    const hasTargetWeakness = commonWeaknesses.some(w => w.includes('老年') || w.includes('下沉'));

    if (hasAIWeakness) {
      marketGap += '现有产品AI应用不足，智能化体验有待提升。';
    }
    if (hasUXWeakness) {
      marketGap += '用户体验复杂，存在简化和优化空间。';
    }
    if (hasTargetWeakness) {
      marketGap += '特定人群（如老年人）的需求未被充分满足。';
    }

    if (!marketGap) {
      marketGap = '市场中存在服务不够精细化、用户体验不够友好的空白地带。';
    }
  } else {
    marketGap = '这是一个新兴市场，有机会成为品类开创者。';
  }

  // 建议
  const recommendations: string[] = [
    '聚焦核心用户群体，深度挖掘痛点需求',
    '快速迭代产品，建立用户口碑和社区',
    '构建技术壁垒（如AI算法、数据积累），提高竞争门槛'
  ];

  if (competitors.length > 2) {
    recommendations.push('避免与头部企业正面竞争，寻找差异化切入点');
    recommendations.push('考虑与现有平台合作，借力生态资源');
  } else {
    recommendations.push('抓住先发优势，快速占领市场心智');
  }

  return {
    marketOverview,
    competitiveAdvantages,
    differentiationStrategy,
    marketGap,
    recommendations
  };
}

/**
 * 找出竞品的共同弱点
 */
function findCommonWeaknesses(competitors: Competitor[]): string[] {
  if (competitors.length === 0) return [];

  // 统计各个弱点出现的频率
  const weaknessCount: Record<string, number> = {};

  competitors.forEach(comp => {
    comp.weaknesses.forEach(weakness => {
      // 提取关键词
      const keywords = extractWeaknessKeywords(weakness);
      keywords.forEach(keyword => {
        weaknessCount[keyword] = (weaknessCount[keyword] || 0) + 1;
      });
    });
  });

  // 找出出现频率 >= 2 次的弱点（说明是共同问题）
  const commonWeaknesses: string[] = [];
  Object.entries(weaknessCount).forEach(([weakness, count]) => {
    if (count >= 2 || competitors.length === 1) {
      commonWeaknesses.push(weakness);
    }
  });

  return commonWeaknesses;
}

/**
 * 从弱点描述中提取关键词
 */
function extractWeaknessKeywords(weakness: string): string[] {
  const keywords: string[] = [];

  const keywordMap: Record<string, string> = {
    '个性化': '个性化',
    '老年': '老年人',
    '价格': '价格',
    '成本': '成本',
    '数据': '数据',
    '隐私': '隐私',
    'AI': 'AI',
    '体验': '体验',
    '复杂': '复杂',
    '下沉': '下沉',
    '盈利': '盈利',
    '获客': '获客',
    '留存': '留存'
  };

  Object.entries(keywordMap).forEach(([key, value]) => {
    if (weakness.includes(key)) {
      keywords.push(value);
    }
  });

  return keywords;
}

/**
 * 格式化竞品对比表格数据
 */
export function formatCompetitorTable(competitors: Competitor[]) {
  return competitors.map(comp => ({
    name: comp.name,
    marketShare: comp.marketShare || '未知',
    strengths: comp.strengths.join('、'),
    weaknesses: comp.weaknesses.join('、'),
    pricing: comp.pricing || '未知',
    targetUsers: comp.targetUsers || '通用用户'
  }));
}
