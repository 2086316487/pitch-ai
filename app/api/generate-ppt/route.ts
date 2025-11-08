import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { BusinessElements } from '@/types';

/**
 * PPT模板类型
 */
type PPTTemplate = 'business' | 'creative' | 'minimal' | 'vibrant';

/**
 * 获取模板颜色配置
 */
function getTemplateColors(template: PPTTemplate = 'business') {
  const templates = {
    business: {
      primary: '1E40AF',      // 深蓝
      secondary: '7C3AED',    // 紫色
      success: '059669',      // 绿色
      warning: 'EA580C',      // 橙色
      danger: 'DC2626',       // 红色
      dark: '1F2937',         // 深灰
      light: 'F3F4F6',        // 浅灰
      white: 'FFFFFF',
      gradient1: '3B82F6',    // 蓝色渐变1
      gradient2: '8B5CF6'     // 紫色渐变2
    },
    creative: {
      primary: 'EA580C',      // 橙色
      secondary: 'F59E0B',    // 黄色
      success: '10B981',      // 绿色
      warning: 'EF4444',      // 红色
      danger: 'DC2626',       // 深红
      dark: '292524',         // 深灰
      light: 'FEF3C7',        // 浅黄
      white: 'FFFFFF',
      gradient1: 'F97316',    // 橙色渐变1
      gradient2: 'FB923C'     // 橙色渐变2
    },
    minimal: {
      primary: '374151',      // 深灰
      secondary: '6B7280',    // 中灰
      success: '10B981',      // 绿色
      warning: 'F59E0B',      // 黄色
      danger: 'EF4444',       // 红色
      dark: '111827',         // 极深灰
      light: 'F9FAFB',        // 极浅灰
      white: 'FFFFFF',
      gradient1: '4B5563',    // 灰色渐变1
      gradient2: '9CA3AF'     // 灰色渐变2
    },
    vibrant: {
      primary: '10B981',      // 绿色
      secondary: '06B6D4',    // 青色
      success: '22C55E',      // 亮绿
      warning: 'F59E0B',      // 黄色
      danger: 'EF4444',       // 红色
      dark: '064E3B',         // 深绿
      light: 'ECFDF5',        // 浅绿
      white: 'FFFFFF',
      gradient1: '14B8A6',    // 绿色渐变1
      gradient2: '22D3EE'     // 青色渐变2
    }
  };

  return templates[template];
}

export async function POST(request: NextRequest) {
  try {
    const { title, elements, content, createdAt, template } = await request.json();

    if (!elements) {
      return NextResponse.json(
        { success: false, error: '请提供商业要素数据' },
        { status: 400 }
      );
    }

    // 创建 PPT 实例
    const pres = new PptxGenJS();

    // 设置 PPT 基础信息
    pres.author = 'PitchAI';
    pres.company = 'AI+Web 创新挑战赛';
    pres.title = title || '商业计划书';

    // 获取模板颜色配置（支持自定义模板）
    const colors = getTemplateColors(template as PPTTemplate || 'business');

    // ==========================================
    // 封面页
    // ==========================================
    const slide1 = pres.addSlide();
    slide1.background = { color: colors.primary };

    slide1.addText(title || '商业计划书', {
      x: '10%',
      y: '35%',
      w: '80%',
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: colors.white,
      align: 'center'
    });

    slide1.addText('AI 驱动的商业创新方案', {
      x: '10%',
      y: '50%',
      w: '80%',
      h: 0.8,
      fontSize: 24,
      color: colors.white,
      align: 'center'
    });

    slide1.addText(`生成时间：${new Date(createdAt || Date.now()).toLocaleDateString('zh-CN')}`, {
      x: '10%',
      y: '85%',
      w: '80%',
      h: 0.5,
      fontSize: 12,
      color: colors.white,
      align: 'center'
    });

    // ==========================================
    // 执行摘要
    // ==========================================
    const slide2 = pres.addSlide();
    slide2.background = { color: colors.white };

    slide2.addText('执行摘要', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 36,
      bold: true,
      color: colors.primary
    });

    // 价值主张
    slide2.addText('核心价值', {
      x: 0.5,
      y: 2,
      w: '90%',
      fontSize: 18,
      bold: true,
      color: colors.primary
    });

    slide2.addText(elements.valueProposition || '暂无数据', {
      x: 0.5,
      y: 2.6,
      w: '90%',
      h: 1.5,
      fontSize: 14,
      color: colors.dark,
      wrap: true
    });

    // 目标用户
    slide2.addText('目标用户', {
      x: 0.5,
      y: 4.2,
      w: '90%',
      fontSize: 18,
      bold: true,
      color: colors.primary
    });

    slide2.addText(elements.targetUsers || '暂无数据', {
      x: 0.5,
      y: 4.8,
      w: '90%',
      h: 1.5,
      fontSize: 14,
      color: colors.dark,
      wrap: true
    });

    // ==========================================
    // 问题与机会
    // ==========================================
    const slide3 = pres.addSlide();
    slide3.background = { color: colors.light };

    slide3.addText('问题与机会', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 36,
      bold: true,
      color: colors.danger
    });

    slide3.addText('核心痛点', {
      x: 0.5,
      y: 2,
      w: '90%',
      fontSize: 20,
      bold: true,
      color: colors.danger
    });

    slide3.addText(elements.problem || '暂无数据', {
      x: 0.5,
      y: 2.8,
      w: '90%',
      h: 2,
      fontSize: 14,
      color: colors.dark,
      wrap: true
    });

    slide3.addText('市场机会', {
      x: 0.5,
      y: 5,
      w: '90%',
      fontSize: 16,
      bold: true,
      color: colors.success
    });

    slide3.addText(elements.marketSize || '暂无数据', {
      x: 0.5,
      y: 5.6,
      w: '90%',
      h: 1.2,
      fontSize: 14,
      color: colors.dark,
      wrap: true
    });

    // ==========================================
    // 解决方案
    // ==========================================
    const slide4 = pres.addSlide();
    slide4.background = { color: colors.white };

    slide4.addText('解决方案', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 36,
      bold: true,
      color: colors.success
    });

    slide4.addText(elements.solution || '暂无数据', {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 3,
      fontSize: 16,
      color: colors.dark,
      wrap: true,
      lineSpacing: 32
    });

    slide4.addText('核心功能特性', {
      x: 0.5,
      y: 5.2,
      w: '90%',
      fontSize: 16,
      bold: true,
      color: colors.success
    });

    const features = [
      '✓ 智能化程度高',
      '✓ 用户体验优秀',
      '✓ 可扩展性强'
    ];

    features.forEach((feature, index) => {
      slide4.addText(feature, {
        x: 0.8,
        y: 5.8 + (index * 0.4),
        w: '80%',
        fontSize: 13,
        color: colors.success
      });
    });

    // ==========================================
    // 商业模式
    // ==========================================
    const slide5 = pres.addSlide();
    slide5.background = { color: colors.white };

    slide5.addText('商业模式', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 36,
      bold: true,
      color: colors.primary
    });

    slide5.addText('收入模式', {
      x: 0.5,
      y: 2,
      w: '90%',
      fontSize: 18,
      bold: true,
      color: colors.primary
    });

    slide5.addText(elements.businessModel || '暂无数据', {
      x: 0.5,
      y: 2.6,
      w: '90%',
      h: 2.5,
      fontSize: 14,
      color: colors.dark,
      wrap: true
    });

    // ==========================================
    // 竞争分析
    // ==========================================
    const slide6 = pres.addSlide();
    slide6.background = { color: colors.white };

    slide6.addText('竞争分析', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 36,
      bold: true,
      color: colors.warning
    });

    if (elements.competitors && elements.competitors.length > 0) {
      slide6.addText('主要竞争对手', {
        x: 0.5,
        y: 2,
        w: '90%',
        fontSize: 18,
        bold: true,
        color: colors.warning
      });

      elements.competitors.forEach((competitor: string, index: number) => {
        slide6.addText(`${index + 1}. ${competitor}`, {
          x: 0.8,
          y: 2.8 + (index * 0.5),
          w: '80%',
          fontSize: 14,
          color: colors.dark
        });
      });
    } else {
      slide6.addText('市场定位独特，暂无直接竞争对手', {
        x: 0.5,
        y: 3,
        w: '90%',
        h: 1,
        fontSize: 18,
        align: 'center',
        color: colors.success
      });
    }

    // ==========================================
    // 致谢页
    // ==========================================
    const slide7 = pres.addSlide();
    slide7.background = { color: colors.primary };

    slide7.addText('谢谢观看', {
      x: '10%',
      y: '40%',
      w: '80%',
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: colors.white,
      align: 'center'
    });

    slide7.addText('Powered by PitchAI', {
      x: '10%',
      y: '85%',
      w: '80%',
      fontSize: 12,
      color: colors.white,
      align: 'center',
      italic: true
    });

    // 生成 PPT 二进制数据
    // pres.stream() 返回的是 ArrayBuffer，不是 Blob
    const arrayBuffer = await pres.stream();
    const buffer = Buffer.from(arrayBuffer);

    // 返回二进制数据
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title || '商业计划书')}.pptx"`,
      },
    });
  } catch (error) {
    console.error('Error in generate-ppt API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PPT 生成失败',
      },
      { status: 500 }
    );
  }
}