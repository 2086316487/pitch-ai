/**
 * 竞品分析API端点
 * POST /api/competitor-analysis
 * 接收业务元素，返回竞品分析报告
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCompetitorAnalysis, formatCompetitorTable } from '@/lib/utils/competitorAnalysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { elements } = body;

    if (!elements) {
      return NextResponse.json(
        { error: '缺少必要参数：elements' },
        { status: 400 }
      );
    }

    console.log('📋 接收到的业务元素:', elements);

    // 生成竞品分析
    const result = generateCompetitorAnalysis(elements);

    console.log('🔍 竞品分析结果:', {
      竞品数量: result.competitors.length,
      竞品名称: result.competitors.map(c => c.name)
    });

    // 格式化表格数据
    const competitorTable = formatCompetitorTable(result.competitors);

    return NextResponse.json({
      success: true,
      data: {
        competitors: result.competitors,
        competitorTable,
        analysis: result.analysis
      }
    });

  } catch (error) {
    console.error('竞品分析API错误:', error);
    return NextResponse.json(
      {
        error: '竞品分析失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
