import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessPlanStream } from '@/lib/api/openai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { elements, title, stream = true } = await request.json();

    if (!elements) {
      return NextResponse.json(
        { success: false, error: '请提供商业要素数据' },
        { status: 400 }
      );
    }

    // 如果不需要流式输出，使用原有逻辑（向后兼容）
    if (!stream) {
      const { generateBusinessPlan } = await import('@/lib/api/openai');
      const planContent = await generateBusinessPlan(elements);
      return NextResponse.json({
        success: true,
        data: {
          title: title || '商业计划书',
          elements,
          content: planContent,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // 流式输出
    const encoder = new TextEncoder();
    let fullContent = '';
    let wasTruncated = false;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // 首先发送元数据
          const metadata = {
            type: 'metadata',
            data: {
              title: title || '商业计划书',
              elements,
              createdAt: new Date().toISOString(),
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // 开始流式生成内容
          const generator = generateBusinessPlanStream(elements);

          let buffer = ''; // 用于累积和过滤内容
          let insideThinkTag = false; // 跟踪是否在<think>标签内

          for await (const chunk of generator) {
            buffer += chunk;

            // 移除所有完整的<think>...</think>标签内容
            buffer = buffer.replace(/<think>[\s\S]*?<\/think>/g, '');

            // 检查是否有未闭合的<think>标签
            const thinkStartIndex = buffer.lastIndexOf('<think>');
            const thinkEndIndex = buffer.lastIndexOf('</think>');

            // 如果有未闭合的<think>标签，暂时保留buffer不发送
            if (thinkStartIndex > thinkEndIndex) {
              insideThinkTag = true;
              continue; // 等待更多内容来闭合标签
            }

            // 如果之前在think标签内，现在标签闭合了，移除think内容
            if (insideThinkTag && thinkEndIndex > thinkStartIndex) {
              buffer = buffer.replace(/<think>[\s\S]*?<\/think>/g, '');
              insideThinkTag = false;
            }

            // 发送清理后的内容
            if (buffer.length > 0 && !insideThinkTag) {
              fullContent += buffer;
              const contentChunk = {
                type: 'content',
                data: buffer,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentChunk)}\n\n`));
              buffer = ''; // 清空buffer
            }
          }

          // 处理剩余buffer（如果有）
          if (buffer.length > 0) {
            // 最后一次移除可能残留的think标签
            buffer = buffer.replace(/<think>[\s\S]*?<\/think>/g, '');
            buffer = buffer.replace(/<think>[\s\S]*$/g, ''); // 移除未闭合的think开始标签

            if (buffer.length > 0) {
              fullContent += buffer;
              const contentChunk = {
                type: 'content',
                data: buffer,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentChunk)}\n\n`));
            }
          }

          // 检查内容是否完整（简单启发式检查：是否包含"财务预测"章节）
          if (!fullContent.includes('财务预测') && !fullContent.includes('8.')) {
            wasTruncated = true;
            console.warn('⚠️ 检测到内容可能被截断');
          }

          // 发送完成信号
          const doneSignal = {
            type: 'done',
            data: {
              fullContent,
              wasTruncated, // 告知前端是否被截断
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneSignal)}\n\n`));

          controller.close();
        } catch (error: any) {
          console.error('Stream generation error:', error);
          const errorSignal = {
            type: 'error',
            data: { message: error?.message || '生成失败，请重试' },
          };
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorSignal)}\n\n`));
          } catch (e) {
            console.error('无法发送错误信号:', e);
          }
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in generate-full-plan API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成完整计划书失败，请重试',
      },
      { status: 500 }
    );
  }
}
