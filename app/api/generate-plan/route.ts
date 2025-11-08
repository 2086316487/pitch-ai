import { NextRequest, NextResponse } from 'next/server';
import { extractBusinessElements } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供创业想法' },
        { status: 400 }
      );
    }

    // 调用 AI 提取商业要素
    const elements = await extractBusinessElements(idea);

    return NextResponse.json({
      success: true,
      data: {
        idea,
        elements,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in generate-plan API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI服务暂时不可用，请稍后重试',
      },
      { status: 500 }
    );
  }
}
