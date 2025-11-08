import PptxGenJS from 'pptxgenjs';
import { BusinessElements } from '@/types';

/**
 * PPT模板类型
 */
export type PPTTemplate = 'business' | 'creative' | 'minimal' | 'vibrant';

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

/**
 * 生成专业的商业计划书 PPT
 */
export async function generateBusinessPlanPPT(planData: {
  title: string;
  elements: BusinessElements;
  content?: string;
  createdAt?: string;
  template?: PPTTemplate;
}): Promise<{ success: boolean; fileName?: string; error?: string }> {
  try {
    const pres = new PptxGenJS();

    // 设置 PPT 基础信息
    pres.author = 'PitchAI';
    pres.company = 'AI+Web 创新挑战赛';
    pres.title = planData.title || '商业计划书';

    // 获取模板颜色（支持自定义模板）
    const colors = getTemplateColors(planData.template);

    // 定义通用样式
    const titleStyle = {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 1,
      fontSize: 36,
      bold: true,
      color: colors.dark,
      align: 'left' as const
    };

    const subtitleStyle = {
      fontSize: 20,
      bold: true,
      color: colors.primary,
      align: 'left' as const
    };

    const bodyStyle = {
      fontSize: 16,
      color: colors.dark,
      align: 'left' as const,
      lineSpacing: 28
    };

    const bulletStyle = {
      fontSize: 14,
      color: colors.dark,
      bullet: { type: 'bullet' as const },
      lineSpacing: 24
    };

    // ==========================================
    // 第1页：封面页
    // ==========================================
    const slide1 = pres.addSlide();

    // 添加渐变背景
    slide1.background = {
      fill: {
        type: 'gradient',
        colors: [
          { position: 0, color: colors.gradient1 },
          { position: 100, color: colors.gradient2 }
        ],
        direction: 'diagonalUp'
      } as any
    };

    // 主标题
    slide1.addText(planData.title || '商业计划书', {
      x: '10%',
      y: '35%',
      w: '80%',
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: colors.white,
      align: 'center',
      shadow: {
        type: 'outer',
        angle: 45,
        blur: 5,
        offset: 3,
        opacity: 0.3,
        color: '000000'
      }
    });

    // 副标题
    slide1.addText('AI 驱动的商业创新方案', {
      x: '10%',
      y: '50%',
      w: '80%',
      h: 0.8,
      fontSize: 24,
      color: colors.white,
      align: 'center'
    });

    // 底部信息
    slide1.addText(`生成时间：${new Date(planData.createdAt || Date.now()).toLocaleDateString('zh-CN')}`, {
      x: '10%',
      y: '85%',
      w: '80%',
      h: 0.5,
      fontSize: 12,
      color: colors.white,
      align: 'center'
    });

    // Logo 或装饰元素
    slide1.addText('PitchAI', {
      x: '10%',
      y: '92%',
      w: '80%',
      h: 0.4,
      fontSize: 10,
      color: colors.white,
      align: 'center',
      italic: true
    });

    // ==========================================
    // 第2页：执行摘要
    // ==========================================
    const slide2 = pres.addSlide();
    slide2.background = { color: colors.white };

    // 标题
    slide2.addText('执行摘要', {
      ...titleStyle,
      color: colors.primary
    });

    // 添加装饰线
    slide2.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.gradient1, width: 3 }
    });

    // 核心价值主张
    slide2.addText('核心价值', {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 18
    });

    slide2.addText(planData.elements.valueProposition, {
      x: 0.5,
      y: 2.6,
      w: '90%',
      h: 1.5,
      ...bodyStyle,
      fontSize: 14,
      color: colors.dark
    });

    // 目标用户
    slide2.addText('目标用户', {
      x: 0.5,
      y: 4.2,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 18
    });

    slide2.addText(planData.elements.targetUsers, {
      x: 0.5,
      y: 4.8,
      w: '90%',
      h: 1.5,
      ...bodyStyle,
      fontSize: 14,
      color: colors.dark
    });

    // ==========================================
    // 第3页：问题与机会
    // ==========================================
    const slide3 = pres.addSlide();
    slide3.background = { color: colors.light };

    slide3.addText('问题与机会', {
      ...titleStyle,
      color: colors.danger
    });

    // 装饰元素
    slide3.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.danger, width: 3 }
    });

    // 问题图标和描述（使用形状模拟）
    slide3.addShape('ellipse', {
      x: 0.5,
      y: 2,
      w: 0.8,
      h: 0.8,
      fill: { color: colors.danger },
    });

    slide3.addText('!', {
      x: 0.7,
      y: 2.15,
      w: 0.4,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: colors.white,
      align: 'center'
    });

    slide3.addText('核心痛点', {
      x: 1.5,
      y: 2,
      w: '70%',
      h: 0.8,
      ...subtitleStyle,
      color: colors.danger
    });

    slide3.addText(planData.elements.problem, {
      x: 1.5,
      y: 2.8,
      w: '70%',
      h: 2,
      ...bodyStyle,
      fontSize: 14
    });

    // 市场规模
    slide3.addText('市场机会', {
      x: 0.5,
      y: 5,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 16,
      color: colors.success
    });

    slide3.addText(planData.elements.marketSize, {
      x: 0.5,
      y: 5.6,
      w: '90%',
      h: 1.2,
      ...bodyStyle,
      fontSize: 14
    });

    // ==========================================
    // 第4页：解决方案
    // ==========================================
    const slide4 = pres.addSlide();
    slide4.background = { color: colors.white };

    slide4.addText('解决方案', {
      ...titleStyle,
      color: colors.success
    });

    slide4.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.success, width: 3 }
    });

    // 解决方案描述
    slide4.addText(planData.elements.solution, {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 2.5,
      ...bodyStyle,
      fontSize: 16,
      lineSpacing: 32
    });

    // 关键特性（如果有）
    slide4.addText('核心功能特性', {
      x: 0.5,
      y: 4.8,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 16
    });

    const features = [
      '✓ 智能化程度高，自动化处理流程',
      '✓ 用户体验优秀，操作简单直观',
      '✓ 可扩展性强，支持多种业务场景',
      '✓ 数据安全可靠，保护用户隐私'
    ];

    features.forEach((feature, index) => {
      slide4.addText(feature, {
        x: 0.8,
        y: 5.5 + (index * 0.4),
        w: '80%',
        h: 0.4,
        fontSize: 13,
        color: colors.success
      });
    });

    // ==========================================
    // 第5页：商业模式
    // ==========================================
    const slide5 = pres.addSlide();

    // 渐变背景
    slide5.background = {
      fill: {
        type: 'gradient',
        colors: [
          { position: 0, color: colors.light },
          { position: 100, color: colors.white }
        ],
        direction: 'vertical'
      } as any
    };

    slide5.addText('商业模式', {
      ...titleStyle,
      color: colors.primary
    });

    slide5.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.primary, width: 3 }
    });

    // 商业模式描述
    slide5.addText('收入模式', {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 18
    });

    slide5.addText(planData.elements.businessModel, {
      x: 0.5,
      y: 2.6,
      w: '90%',
      h: 2,
      ...bodyStyle,
      fontSize: 14
    });

    // 收入来源（示例）
    slide5.addText('收入来源分析', {
      x: 0.5,
      y: 4.8,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 16
    });

    const revenueStreams = [
      '• 订阅服务费用',
      '• 交易手续费',
      '• 增值服务收费',
      '• 企业定制方案'
    ];

    revenueStreams.forEach((stream, index) => {
      slide5.addText(stream, {
        x: 0.8,
        y: 5.4 + (index * 0.4),
        w: '80%',
        h: 0.4,
        fontSize: 13,
        color: colors.dark
      });
    });

    // ==========================================
    // 第6页：竞争分析
    // ==========================================
    const slide6 = pres.addSlide();
    slide6.background = { color: colors.white };

    slide6.addText('竞争分析', {
      ...titleStyle,
      color: colors.warning
    });

    slide6.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.warning, width: 3 }
    });

    // 竞争对手列表
    if (planData.elements.competitors && planData.elements.competitors.length > 0) {
      slide6.addText('主要竞争对手', {
        x: 0.5,
        y: 2,
        w: '90%',
        h: 0.6,
        ...subtitleStyle,
        fontSize: 18
      });

      planData.elements.competitors.forEach((competitor, index) => {
        slide6.addText(`${index + 1}. ${competitor}`, {
          x: 0.8,
          y: 2.8 + (index * 0.5),
          w: '80%',
          h: 0.5,
          ...bulletStyle,
          fontSize: 14
        });
      });

      // 竞争优势
      slide6.addText('我们的竞争优势', {
        x: 0.5,
        y: 2.8 + (planData.elements.competitors.length * 0.5) + 0.5,
        w: '90%',
        h: 0.6,
        ...subtitleStyle,
        fontSize: 18,
        color: colors.success
      });

      const advantages = [
        '• 技术领先：采用最新的AI技术',
        '• 用户体验：更简洁直观的操作界面',
        '• 成本优势：更高效的运营模式',
        '• 服务质量：7×24小时客户支持'
      ];

      advantages.forEach((advantage, index) => {
        slide6.addText(advantage, {
          x: 0.8,
          y: 2.8 + (planData.elements.competitors.length * 0.5) + 1.2 + (index * 0.4),
          w: '80%',
          h: 0.4,
          fontSize: 13,
          color: colors.success
        });
      });
    } else {
      slide6.addText('市场定位独特，暂无直接竞争对手', {
        x: 0.5,
        y: 3,
        w: '90%',
        h: 1,
        ...bodyStyle,
        fontSize: 18,
        align: 'center',
        color: colors.success
      });
    }

    // ==========================================
    // 第7页：发展计划
    // ==========================================
    const slide7 = pres.addSlide();

    // 渐变背景
    slide7.background = {
      fill: {
        type: 'gradient',
        colors: [
          { position: 0, color: colors.white },
          { position: 100, color: colors.light }
        ],
        direction: 'horizontal'
      } as any
    };

    slide7.addText('发展规划', {
      ...titleStyle,
      color: colors.primary
    });

    slide7.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.primary, width: 3 }
    });

    // 时间线
    const milestones = [
      { phase: '第一阶段 (0-6月)', tasks: 'MVP开发与测试，种子用户获取' },
      { phase: '第二阶段 (6-12月)', tasks: '产品迭代优化，扩大用户规模' },
      { phase: '第三阶段 (12-24月)', tasks: '商业化探索，建立收入模式' },
      { phase: '第四阶段 (24月+)', tasks: '规模化扩张，市场领导地位' }
    ];

    milestones.forEach((milestone, index) => {
      // 时间线节点
      slide7.addShape('ellipse', {
        x: 0.5,
        y: 2.5 + (index * 1),
        w: 0.3,
        h: 0.3,
        fill: { color: colors.primary }
      });

      // 连接线
      if (index < milestones.length - 1) {
        slide7.addShape('line', {
          x: 0.65,
          y: 2.65 + (index * 1),
          w: 0,
          h: 0.7,
          line: { color: colors.primary, width: 2, dashType: 'dash' }
        });
      }

      // 阶段标题
      slide7.addText(milestone.phase, {
        x: 1,
        y: 2.3 + (index * 1),
        w: 3,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: colors.primary
      });

      // 阶段任务
      slide7.addText(milestone.tasks, {
        x: 1,
        y: 2.6 + (index * 1),
        w: 7,
        h: 0.4,
        fontSize: 12,
        color: colors.dark
      });
    });

    // ==========================================
    // 第8页：融资需求（如果适用）
    // ==========================================
    const slide8 = pres.addSlide();
    slide8.background = { color: colors.white };

    slide8.addText('融资计划', {
      ...titleStyle,
      color: colors.primary
    });

    slide8.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.primary, width: 3 }
    });

    // 融资信息
    slide8.addText('融资目标', {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 18
    });

    slide8.addText('种子轮融资：500万人民币', {
      x: 0.5,
      y: 2.6,
      w: '90%',
      h: 0.6,
      fontSize: 20,
      bold: true,
      color: colors.primary,
      align: 'center'
    });

    // 资金用途
    slide8.addText('资金用途', {
      x: 0.5,
      y: 3.5,
      w: '90%',
      h: 0.6,
      ...subtitleStyle,
      fontSize: 18
    });

    const fundingUse = [
      { use: '产品研发', percentage: '40%' },
      { use: '市场推广', percentage: '30%' },
      { use: '团队建设', percentage: '20%' },
      { use: '运营资金', percentage: '10%' }
    ];

    fundingUse.forEach((item, index) => {
      slide8.addText(`• ${item.use}`, {
        x: 0.8,
        y: 4.2 + (index * 0.5),
        w: 3,
        h: 0.4,
        fontSize: 14,
        color: colors.dark
      });

      slide8.addText(item.percentage, {
        x: 3.5,
        y: 4.2 + (index * 0.5),
        w: 1,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: colors.primary,
        align: 'right'
      });

      // 进度条
      slide8.addShape('rect', {
        x: 5,
        y: 4.3 + (index * 0.5),
        w: parseInt(item.percentage) / 100 * 3,
        h: 0.2,
        fill: { color: colors.gradient1 }
      });
    });

    // ==========================================
    // 第9页：团队介绍
    // ==========================================
    const slide9 = pres.addSlide();
    slide9.background = { color: colors.light };

    slide9.addText('核心团队', {
      ...titleStyle,
      color: colors.primary
    });

    slide9.addShape('line', {
      x: 0.5,
      y: 1.3,
      w: 3,
      h: 0,
      line: { color: colors.primary, width: 3 }
    });

    // 团队成员（示例）
    const teamMembers = [
      { name: '创始人/CEO', desc: '10年互联网创业经验，连续创业者' },
      { name: 'CTO', desc: '前大厂技术专家，AI领域深耕8年' },
      { name: '产品负责人', desc: '资深产品经理，千万级用户产品经验' },
      { name: '市场负责人', desc: '品牌营销专家，多次成功案例' }
    ];

    const positions = [
      { x: 1, y: 2.5 },
      { x: 5, y: 2.5 },
      { x: 1, y: 4.5 },
      { x: 5, y: 4.5 }
    ];

    teamMembers.forEach((member, index) => {
      const pos = positions[index];

      // 头像占位符
      slide9.addShape('ellipse', {
        x: pos.x,
        y: pos.y,
        w: 0.8,
        h: 0.8,
        fill: { color: colors.gradient1 }
      });

      // 姓名/职位
      slide9.addText(member.name, {
        x: pos.x + 1,
        y: pos.y,
        w: 2.5,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: colors.primary
      });

      // 简介
      slide9.addText(member.desc, {
        x: pos.x + 1,
        y: pos.y + 0.4,
        w: 2.5,
        h: 0.6,
        fontSize: 11,
        color: colors.dark
      });
    });

    // ==========================================
    // 第10页：致谢/联系方式
    // ==========================================
    const slide10 = pres.addSlide();

    // 渐变背景
    slide10.background = {
      fill: {
        type: 'gradient',
        colors: [
          { position: 0, color: colors.gradient1 },
          { position: 100, color: colors.gradient2 }
        ],
        direction: 'diagonalDown'
      } as any
    };

    // 感谢语
    slide10.addText('谢谢观看', {
      x: '10%',
      y: '30%',
      w: '80%',
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: colors.white,
      align: 'center'
    });

    // 联系信息
    slide10.addText('联系我们', {
      x: '10%',
      y: '50%',
      w: '80%',
      h: 0.8,
      fontSize: 20,
      color: colors.white,
      align: 'center'
    });

    const contactInfo = [
      '📧 contact@pitchai.com',
      '🌐 www.pitchai.com',
      '📱 微信公众号：PitchAI'
    ];

    contactInfo.forEach((info, index) => {
      slide10.addText(info, {
        x: '10%',
        y: `${58 + (index * 6)}%`,
        w: '80%',
        h: 0.5,
        fontSize: 14,
        color: colors.white,
        align: 'center'
      });
    });

    // 底部标语
    slide10.addText('Powered by PitchAI - AI+Web 创新挑战赛', {
      x: '10%',
      y: '90%',
      w: '80%',
      h: 0.4,
      fontSize: 10,
      color: colors.white,
      align: 'center',
      italic: true
    });

    // 生成文件名
    const fileName = `${planData.title || '商业计划书'}_${new Date().getTime()}.pptx`;

    // 保存 PPT
    await pres.writeFile({ fileName });

    return { success: true, fileName };
  } catch (error) {
    console.error('PPT 生成失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PPT 生成失败'
    };
  }
}

/**
 * 生成 PPT 并返回 Blob（用于 API 返回）
 */
export async function generatePPTBlob(planData: any): Promise<Blob> {
  const pres = new PptxGenJS();

  // ... 使用上面相同的 PPT 生成逻辑 ...
  // 为了简洁，这里只创建一个简单版本

  pres.author = 'PitchAI';
  pres.title = planData.title || '商业计划书';

  // 封面
  const slide1 = pres.addSlide();
  slide1.background = { color: '1E40AF' };
  slide1.addText(planData.title, {
    x: '10%',
    y: '40%',
    w: '80%',
    h: '20%',
    fontSize: 44,
    color: 'FFFFFF',
    align: 'center'
  });

  // 转换为 Blob
  const pptxBlob = await pres.stream() as Blob;
  return pptxBlob;
}