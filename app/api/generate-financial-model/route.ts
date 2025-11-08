import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/api/openai';
import type { BusinessElements, FinancialModel, ApiResponse } from '@/types';

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的 API 调用
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 3000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // 如果是 429 限流错误，等待后重试
      if (error?.status === 429) {
        console.log(`遇到限流，${delayMs}ms 后重试... (${i + 1}/${maxRetries})`);
        if (i < maxRetries - 1) {
          await delay(delayMs);
          delayMs = delayMs * 2; // 指数退避
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * 财务模型生成 API
 * POST /api/generate-financial-model
 *
 * 根据商业要素生成财务预测模型
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { elements } = body as { elements: BusinessElements };

    if (!elements || !elements.businessModel) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '缺少必要的商业要素数据',
      }, { status: 400 });
    }

    console.log('🔢 开始生成财务模型...');

    // 使用重试机制调用 API
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是财务分析师。
严格规则：
1. 只输出纯JSON，不要任何其他文字
2. 不要解释、思考过程、或者前言后语
3. 不要OK、好的、明白等词汇
4. JSON必须使用双引号
5. 如果无法生成，请返回空JSON对象 {}`,
          },
          {
            role: 'user',
            content: `基于以下商业要素生成财务模型JSON。

商业要素：
${JSON.stringify(elements, null, 2)}

请严格按照以下JSON格式输出（不要任何其他内容）：

{
  "revenueStreams": [
    {
      "name": "收入来源名称",
      "description": "描述",
      "model": "subscription",
      "pricing": 199,
      "unit": "用户/月"
    }
  ],
  "costStructure": [
    {
      "category": "fixed",
      "name": "成本项名称",
      "description": "描述",
      "amount": 50000,
      "frequency": "monthly"
    }
  ],
  "projections": [
    {
      "year": 1,
      "revenue": 300,
      "costs": 500,
      "profit": -200,
      "users": 10000,
      "breakeven": false
    },
    {
      "year": 2,
      "revenue": 800,
      "costs": 600,
      "profit": 200,
      "users": 50000,
      "breakeven": true
    },
    {
      "year": 3,
      "revenue": 2000,
      "costs": 1000,
      "profit": 1000,
      "users": 150000,
      "breakeven": true
    }
  ],
  "assumptions": [
    "关键假设1",
    "关键假设2",
    "关键假设3"
  ],
  "fundingNeeds": {
    "amount": 500,
    "usage": ["用途1", "用途2", "用途3"],
    "milestone": ["里程碑1", "里程碑2", "里程碑3"]
  },
  "metrics": {
    "ltv": 5000,
    "cac": 200,
    "ltvCacRatio": 25,
    "burnRate": 50,
    "runway": 18
  }
}

要求：
1. model 只能是: "subscription", "one-time", "usage-based", "freemium", "advertising", "other"
2. category 只能是: "fixed", "variable", "semi-variable"
3. frequency 只能是: "monthly", "quarterly", "yearly", "one-time"
4. 金额单位为万元人民币
5. projections 必须包含 year 1-3
6. 所有数字必须是合理的估算值

立即输出 JSON（不要其他任何文字）：`,
          },
        ],
        temperature: 0.3,
        max_tokens: 6000,
      });
    }, 3, 3000);

    const choice = completion.choices[0];

    // 打印调试信息
    console.log('API 响应结构:', {
      hasChoice: !!choice,
      hasMessage: !!choice?.message,
      hasContent: !!choice?.message?.content,
      hasReasoningContent: !!(choice?.message as any)?.reasoning_content,
      choicesLength: completion.choices?.length || 0
    });

    // 获取返回内容（支持 Gemini reasoning_content）
    let aiResponse = choice?.message?.content || '';
    if (!aiResponse && (choice?.message as any)?.reasoning_content) {
      aiResponse = (choice.message as any).reasoning_content;
      console.log('使用 reasoning_content');
    }

    console.log('AI 响应长度:', aiResponse?.length || 0);
    console.log('AI 响应前500字符:', aiResponse?.substring(0, 500) || '(空)');

    if (!aiResponse) {
      console.error('完整响应对象:', JSON.stringify(completion, null, 2));
      throw new Error('AI 返回了空内容');
    }

    // 解析 AI 返回的财务模型
    let financialModel: FinancialModel;

    try {
      // 增强的 JSON 提取逻辑（应用成功策略）
      console.log('财务模型 AI 原始响应:', aiResponse);

      let jsonString = '';
      let jsonMatch = null;

      // 策略1：尝试从代码块中提取
      jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }

      // 策略2：尝试直接提取花括号包裹的内容
      if (!jsonString) {
        jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
      }

      if (!jsonString) {
        console.error('无法提取JSON:', aiResponse);
        throw new Error('AI 返回格式异常，请重试');
      }

      financialModel = JSON.parse(jsonString);

      // 验证必要字段
      if (!financialModel.revenueStreams || !financialModel.costStructure || !financialModel.projections) {
        throw new Error('财务模型数据不完整');
      }

      // 字段映射：兼容AI返回的不同字段名
      // 修复 costStructure 字段结构
      financialModel.costStructure = financialModel.costStructure.map((cost: any) => {
        return {
          category: cost.category || 'fixed',
          name: cost.name || '成本项',
          description: cost.description || '成本描述',
          amount: cost.amount || 0,
          frequency: cost.frequency || 'monthly'
        };
      });

      // 修复 revenueStreams 字段结构
      financialModel.revenueStreams = financialModel.revenueStreams.map((stream: any) => {
        return {
          name: stream.name || '收入来源',
          description: stream.description || '收入描述',
          model: stream.model || 'subscription',
          pricing: stream.pricing || 0,
          unit: stream.unit || '用户/月'
        };
      });

      if (financialModel.fundingNeeds) {
        // useOfFunds -> usage
        if (financialModel.fundingNeeds.useOfFunds && !financialModel.fundingNeeds.usage) {
          financialModel.fundingNeeds.usage = Array.isArray(financialModel.fundingNeeds.useOfFunds)
            ? financialModel.fundingNeeds.useOfFunds
            : [financialModel.fundingNeeds.useOfFunds];
        }
        // 确保 milestone 字段存在
        if (!financialModel.fundingNeeds.milestone) {
          financialModel.fundingNeeds.milestone = [
            '完成产品开发',
            '获得首批用户',
            '实现盈亏平衡'
          ];
        }
      }

      // 确保 assumptions 是数组格式
      if (!financialModel.assumptions) {
        financialModel.assumptions = [
          '市场保持稳定增长',
          '用户获取成本逐步降低',
          '产品定价保持竞争力'
        ];
      } else if (!Array.isArray(financialModel.assumptions)) {
        financialModel.assumptions = [String(financialModel.assumptions)];
      }

      // 确保 projections 中包含 profit、users、breakeven 字段
      financialModel.projections = financialModel.projections.map((proj: any) => {
        // 自动计算 profit
        if (proj.profit === undefined) {
          proj.profit = (proj.revenue || 0) - (proj.costs || 0);
        }
        // 确保 users 字段存在
        if (!proj.users) {
          proj.users = Math.floor((proj.revenue || 0) / 100); // 简单估算
        }
        // 确保 breakeven 字段存在
        if (proj.breakeven === undefined) {
          proj.breakeven = proj.profit > 0;
        }
        return proj;
      });

      // 确保 metrics 字段存在并完整
      if (!financialModel.metrics) {
        financialModel.metrics = {};
      }
      // 自动计算缺失的指标
      if (!financialModel.metrics.ltv) {
        financialModel.metrics.ltv = 5000;
      }
      if (!financialModel.metrics.cac) {
        financialModel.metrics.cac = 200;
      }
      if (!financialModel.metrics.ltvCacRatio) {
        financialModel.metrics.ltvCacRatio = financialModel.metrics.ltv / financialModel.metrics.cac;
      }
      if (!financialModel.metrics.burnRate) {
        // 估算烧钱率：取第一年的平均月成本
        const firstYearCosts = financialModel.projections[0]?.costs || 100;
        financialModel.metrics.burnRate = Math.floor(firstYearCosts / 12);
      }
      if (!financialModel.metrics.runway) {
        // 估算跑道期：假设融资300万
        const totalFunding = financialModel.fundingNeeds?.amount || 300;
        const monthlyBurn = financialModel.metrics.burnRate || 50;
        financialModel.metrics.runway = Math.floor(totalFunding / monthlyBurn);
      }

      console.log('✅ 财务模型生成成功');
      console.log(`- 收入来源: ${financialModel.revenueStreams.length} 个`);
      console.log(`- 成本项: ${financialModel.costStructure.length} 个`);
      console.log(`- 预测年份: ${financialModel.projections.length} 年`);
      console.log(`- LTV: ${financialModel.metrics.ltv}, CAC: ${financialModel.metrics.cac}`);

    } catch (parseError) {
      console.error('❌ 解析财务模型失败:', parseError);
      console.log('AI 原始响应:', aiResponse.substring(0, 500));

      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '财务模型数据解析失败，请重试',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<FinancialModel>>({
      success: true,
      data: financialModel,
    });

  } catch (error) {
    console.error('财务模型生成失败:', error);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : '生成失败，请重试',
    }, { status: 500 });
  }
}
