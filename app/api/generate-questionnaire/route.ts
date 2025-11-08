import { NextRequest, NextResponse } from 'next/server';
import { generateQuestionnaire } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const { elements } = await request.json();

    if (!elements) {
      return NextResponse.json(
        { success: false, error: '请提供商业要素数据' },
        { status: 400 }
      );
    }

    console.log('开始生成问卷...');

    // 生成问卷
    const questionnaire = await generateQuestionnaire(elements);

    console.log('问卷生成成功');

    return NextResponse.json({
      success: true,
      data: {
        title: '市场验证问卷',
        elements,
        questions: questionnaire.questions,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in generate-questionnaire API:', error);

    // 提取错误信息
    let errorMessage = '生成问卷失败，请重试';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
