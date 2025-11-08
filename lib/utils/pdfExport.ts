import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 导出商业计划书为 PDF（完美支持中文）
 */
export async function exportBusinessPlanToPDF(planData: any) {
  try {
    // 获取要导出的元素
    const element = document.getElementById('business-plan-content');

    if (!element) {
      console.error('找不到 business-plan-content 元素');
      alert('页面结构错误，请刷新页面后重试');
      return { success: false, error: '找不到要导出的内容' };
    }

    console.log('开始使用 html2canvas 导出 PDF...');
    console.log('元素大小:', element.offsetWidth, 'x', element.offsetHeight);

    // 配置 html2canvas 选项
    const canvasOptions = {
      scale: 3, // 提高到3倍清晰度，改善显示效果
      useCORS: true, // 允许跨域图片
      logging: false, // 关闭日志减少控制台输出
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      backgroundColor: '#ffffff',
      // 添加以下选项以改善中文渲染
      letterRendering: true,
      allowTaint: true,
      foreignObjectRendering: false, // 避免某些渲染问题
      // 处理不支持的 CSS 颜色函数（如 lab()）
      onclone: (clonedDoc: Document) => {
        console.log('正在处理克隆的文档，移除不支持的颜色格式...');

        const allElements = clonedDoc.querySelectorAll('*');

        // 遍历所有元素，替换不支持的颜色
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;

          // 获取计算样式并检查是否有 lab() 颜色
          const computedStyle = window.getComputedStyle(el);

          // 替换背景颜色
          if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('lab(')) {
            htmlEl.style.backgroundColor = '#ffffff';
          }

          // 替换文字颜色
          if (computedStyle.color && computedStyle.color.includes('lab(')) {
            htmlEl.style.color = '#000000';
          }

          // 替换边框颜色
          if (computedStyle.borderColor && computedStyle.borderColor.includes('lab(')) {
            htmlEl.style.borderColor = '#cccccc';
          }

          // 处理渐变背景
          if (htmlEl.classList.contains('bg-gradient-to-br')) {
            htmlEl.style.background = 'linear-gradient(to bottom right, #dbeafe, #f3e8ff)';
          }
          if (htmlEl.classList.contains('bg-gradient-to-r')) {
            htmlEl.style.background = 'linear-gradient(to right, #3b82f6, #8b5cf6)';
          }

          // 确保文本颜色可读
          const classList = Array.from(htmlEl.classList);
          classList.forEach(className => {
            if (className.includes('text-gray-900')) htmlEl.style.color = '#111827';
            else if (className.includes('text-gray-800')) htmlEl.style.color = '#1f2937';
            else if (className.includes('text-gray-700')) htmlEl.style.color = '#374151';
            else if (className.includes('text-gray-600')) htmlEl.style.color = '#4b5563';
            else if (className.includes('text-gray-500')) htmlEl.style.color = '#6b7280';
            else if (className.includes('text-blue')) htmlEl.style.color = '#2563eb';
            else if (className.includes('text-green')) htmlEl.style.color = '#16a34a';
            else if (className.includes('text-purple')) htmlEl.style.color = '#9333ea';
            else if (className.includes('text-orange')) htmlEl.style.color = '#ea580c';
            else if (className.includes('text-red')) htmlEl.style.color = '#dc2626';
            else if (className.includes('text-indigo')) htmlEl.style.color = '#4f46e5';
            else if (className.includes('text-teal')) htmlEl.style.color = '#0d9488';
          });

          // 处理内联样式中的 lab() 颜色
          if (htmlEl.style.cssText) {
            let cssText = htmlEl.style.cssText;
            // 使用正则表达式替换所有 lab() 函数
            cssText = cssText.replace(/lab\([^)]*\)/gi, '#000000');
            // 替换 oklab() 函数
            cssText = cssText.replace(/oklab\([^)]*\)/gi, '#000000');
            // 替换 lch() 函数
            cssText = cssText.replace(/lch\([^)]*\)/gi, '#000000');
            // 替换 oklch() 函数
            cssText = cssText.replace(/oklch\([^)]*\)/gi, '#000000');
            htmlEl.style.cssText = cssText;
          }
        });

        // 添加全局样式覆盖
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            color-scheme: light !important;
          }
          .bg-gradient-to-br {
            background: linear-gradient(to bottom right, #dbeafe, #f3e8ff) !important;
          }
          .bg-gradient-to-r {
            background: linear-gradient(to right, #3b82f6, #8b5cf6) !important;
          }
          .text-gray-900 { color: #111827 !important; }
          .text-gray-800 { color: #1f2937 !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-green-600 { color: #16a34a !important; }
          .text-purple-600 { color: #9333ea !important; }
          .text-orange-600 { color: #ea580c !important; }
          .text-red-600 { color: #dc2626 !important; }
          .text-indigo-600 { color: #4f46e5 !important; }
          .text-teal-600 { color: #0d9488 !important; }
          .bg-white { background-color: #ffffff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-purple-50 { background-color: #faf5ff !important; }
          .bg-orange-50 { background-color: #fff7ed !important; }
          .bg-red-50 { background-color: #fef2f2 !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
        `;
        clonedDoc.head.appendChild(style);

        console.log('颜色处理完成，已替换所有不支持的颜色函数');
      }
    };

    // 将 HTML 转换为 Canvas
    console.log('正在将 HTML 转换为 Canvas...');
    const canvas = await html2canvas(element, canvasOptions);

    console.log('Canvas 生成成功，大小:', canvas.width, 'x', canvas.height);

    // 创建 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 计算尺寸
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 设置边距
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    console.log('PDF 页面尺寸:', pageWidth, 'x', pageHeight);
    console.log('内容尺寸:', contentWidth, 'x', contentHeight);

    // 将canvas转为图片数据
    const imgData = canvas.toDataURL('image/png', 1.0);

    // 改进的分页处理
    const usablePageHeight = pageHeight - (margin * 2);
    let pages = Math.ceil(contentHeight / usablePageHeight);

    console.log(`总共需要 ${pages} 页`);

    // 第一页
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      contentWidth,
      contentHeight,
      undefined,
      'FAST'
    );

    // 添加后续页面（改进的算法，避免内容被截断）
    for (let page = 1; page < pages; page++) {
      pdf.addPage();

      // 计算当前页面的Y偏移（负值向上移动图片）
      const yOffset = -(usablePageHeight * page) + margin;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        yOffset,
        contentWidth,
        contentHeight,
        undefined,
        'FAST'
      );
    }

    // 添加页脚和页码（使用英文避免乱码）
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // 添加页码（纯数字，避免中文乱码）
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);

      const pageText = `Page ${i} of ${totalPages}`;
      const textWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 5);

      // 添加生成信息
      pdf.setFontSize(8);
      const footerText = 'PitchAI';
      pdf.text(footerText, margin, pageHeight - 5);
    }

    // 生成文件名
    const fileName = `${planData.title || '商业计划书'}_${new Date().toISOString().slice(0, 10)}.pdf`;

    // 保存 PDF
    console.log('保存 PDF 文件:', fileName);
    pdf.save(fileName);

    return {
      success: true,
      fileName,
      message: 'PDF导出成功（使用图片渲染，完美支持中文）'
    };

  } catch (error) {
    console.error('PDF 导出失败:', error);

    // 提供详细的错误信息
    let errorMessage = 'PDF 导出失败';
    if (error instanceof Error) {
      errorMessage = error.message;

      // 特殊错误处理
      if (error.message.includes('html2canvas')) {
        errorMessage = 'html2canvas 模块加载失败，请刷新页面后重试';
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 简单文本导出（仅作为最后的备用方案）
 * 注意：这种方式不支持中文，只用于紧急情况
 */
export function exportBusinessPlanToText(planData: any) {
  try {
    // 构建文本内容
    let content = `商业计划书\n\n`;
    content += `标题: ${planData.title}\n`;
    content += `生成时间: ${new Date(planData.createdAt).toLocaleDateString('zh-CN')}\n\n`;

    content += `=== 执行摘要 ===\n\n`;
    content += `核心问题:\n${planData.elements.problem}\n\n`;
    content += `解决方案:\n${planData.elements.solution}\n\n`;
    content += `目标用户:\n${planData.elements.targetUsers}\n\n`;
    content += `价值主张:\n${planData.elements.valueProposition}\n\n`;
    content += `商业模式:\n${planData.elements.businessModel}\n\n`;
    content += `市场规模:\n${planData.elements.marketSize}\n\n`;

    if (planData.elements.competitors && planData.elements.competitors.length > 0) {
      content += `竞争对手:\n`;
      planData.elements.competitors.forEach((competitor: string, index: number) => {
        content += `${index + 1}. ${competitor}\n`;
      });
      content += '\n';
    }

    if (planData.content) {
      content += `=== 详细计划 ===\n\n`;
      content += planData.content;
    }

    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${planData.title || '商业计划书'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      fileName: link.download,
      message: '已导出为文本文件（TXT格式）'
    };
  } catch (error) {
    console.error('文本导出失败:', error);
    return {
      success: false,
      error: '导出失败'
    };
  }
}