import OpenAI from 'openai';

// 初始化 OpenAI 客户端（兼容格式）
export const openai = new OpenAI({
  baseURL: process.env.API_BASE_URL,
  apiKey: process.env.API_KEY || 'default-key',
  timeout: 60000, // 60秒超时（优化后足够）
  maxRetries: 2, // 2次重试足够
});

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
  delayMs = 2000
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
          // 指数退避：每次重试增加延迟时间
          delayMs = delayMs * 2;
          continue;
        }
      }

      // 其他错误直接抛出
      throw error;
    }
  }

  throw lastError;
}

/**
 * 从用户输入提取商业要素
 */
export async function extractBusinessElements(idea: string) {
  // 精简系统提示
  const systemPrompt = `你是商业顾问。直接输出JSON结果。

要求：
1. 每个字段精简到50-80字
2. 必须输出完整JSON
3. 格式：{"problem":"...","solution":"...","targetUsers":"...","valueProposition":"...","businessModel":"...","marketSize":"...","competitors":["...","...","..."]}`;

  // 简化用户提示
  const userPrompt = `分析创业想法：${idea}

输出完整JSON（每个字段50-80字）：problem、solution、targetUsers、valueProposition、businessModel、marketSize、competitors(3个竞品)。`;



  try {
    // 使用重试机制调用 API
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'MiniMax-M2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2500, // 增加到2500确保JSON完整输出
        top_p: 0.9, // 添加 top_p 提高输出质量
      });
    }, 3, 3000);

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('API 返回了空的 choices 数组');
    }

    // 支持Kimi thinking模型的reasoning_content字段
    let content = choice.message?.content || '';
    const reasoningContent = (choice.message as any)?.reasoning_content || '';

    // 如果content为空但reasoning_content有内容，使用reasoning_content
    if (!content && reasoningContent) {
      console.log('⚠️ 检测到Kimi thinking模型，从reasoning_content提取内容');
      content = reasoningContent;
    }

    // MiniMax-M2 使用 reasoning_split 时，思考内容在 reasoning_details 中
    // 实际 JSON 数据在 content 字段中
    if (!content) {
      throw new Error('AI 返回了空内容');
    }

    // 增强的 JSON 提取逻辑
    console.log('AI 原始响应:', content);

    // 先移除 MiniMax-M2 的 <think> 标签内容
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let jsonString = '';
    let jsonMatch = null;

    // 策略1：尝试从代码块中提取
    jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    // 策略2：尝试直接提取花括号包裹的内容
    if (!jsonString) {
      jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }

    // 策略3：尝试修复不完整的 JSON
    if (jsonString && !jsonString.endsWith('}')) {
      console.warn('⚠️ 检测到JSON未闭合，尝试修复...');
      // 尝试闭合未完成的字符串和对象
      jsonString = jsonString.replace(/,\s*$/, ''); // 移除末尾逗号
      if (!jsonString.includes('"competitors"')) {
        jsonString += ',"competitors":["待分析","待分析","待分析"]';
      }
      jsonString += '}';
    }

    // 策略4：如果内容被严重截断，尝试提取可能的JSON片段
    if (!jsonString || jsonString.length < 50) {
      console.warn('⚠️ 检测到响应可能被截断，尝试从部分内容构建JSON');

      const problemMatch = content.match(/["']?problem["']?\s*:\s*["']([^"']*)["']/);
      const solutionMatch = content.match(/["']?solution["']?\s*:\s*["']([^"']*)["']/);
      const targetUsersMatch = content.match(/["']?targetUsers["']?\s*:\s*["']([^"']*)["']/);
      const valueMatch = content.match(/["']?valueProposition["']?\s*:\s*["']([^"']*)["']/);
      const businessMatch = content.match(/["']?businessModel["']?\s*:\s*["']([^"']*)["']/);
      const marketMatch = content.match(/["']?marketSize["']?\s*:\s*["']([^"']*)["']/);
      const competitorsMatch = content.match(/["']?competitors["']?\s*:\s*\[([^\]]*)\]/);

      if (problemMatch || solutionMatch) {
        console.log('使用部分字段构建JSON');
        jsonString = JSON.stringify({
          problem: problemMatch?.[1] || '用户痛点待分析',
          solution: solutionMatch?.[1] || '解决方案待完善',
          targetUsers: targetUsersMatch?.[1] || '目标用户待定义',
          valueProposition: valueMatch?.[1] || '价值主张待提炼',
          businessModel: businessMatch?.[1] || '商业模式待设计',
          marketSize: marketMatch?.[1] || '市场规模待评估',
          competitors: competitorsMatch?.[1] ? competitorsMatch[1].split(',').map(c => c.trim().replace(/['"]/g, '')).filter(Boolean) : ['竞品待分析']
        });
      }
    }

    if (!jsonString) {
      console.error('无法提取JSON:', content);
      throw new Error('AI 返回的内容格式异常。可能原因：API响应被截断或格式错误。请稍后重试');
    }

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始字符串:', jsonString);
      throw new Error('AI 返回的内容格式有误，请重试');
    }
  } catch (error: any) {
    console.error('Error extracting business elements:', error);

    // 提供更友好的错误信息
    if (error?.status === 429) {
      throw new Error('API 请求过于频繁，请稍后再试（公益站限流）');
    } else if (error?.status === 401) {
      throw new Error('API Key 无效或已过期');
    } else if (error?.status === 500) {
      throw new Error('AI 服务暂时不可用，请稍后重试');
    }

    throw error;
  }
}

/**
 * 生成商业计划书内容
 */
export async function generateBusinessPlan(elements: any) {
  const prompt = `基于以下商业要素，生成一份完整的商业计划书大纲：

${JSON.stringify(elements, null, 2)}

请生成包含以下章节的商业计划书：
1. 执行摘要
2. 问题与机会
3. 解决方案
4. 市场分析
5. 商业模式
6. 竞争分析
7. 营销策略
8. 财务预测

每个章节请提供2-3段详细描述。`;

  try {
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'MiniMax-M2',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      });
    }, 3, 3000);

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('API 返回了空的 choices 数组');
    }

    return choice.message?.content || '';
  } catch (error: any) {
    console.error('Error generating business plan:', error);

    if (error?.status === 429) {
      throw new Error('API 请求过于频繁，请稍后再试');
    }

    throw error;
  }
}

/**
 * 流式生成商业计划书内容
 */
export async function* generateBusinessPlanStream(elements: any) {
  const prompt = `基于以下商业要素，生成一份完整的商业计划书大纲：

${JSON.stringify(elements, null, 2)}

请生成包含以下章节的商业计划书：
1. 执行摘要
2. 问题与机会
3. 解决方案
4. 市场分析
5. 商业模式
6. 竞争分析
7. 营销策略
8. 财务预测

每个章节请提供2-3段详细描述。`;

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'MiniMax-M2',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 6000, // 优化：降低到6000以加快响应
      stream: true,
      timeout: 120000, // 2分钟超时
    });

    let finishReason: string | null = null;
    let hasYieldedContent = false;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        hasYieldedContent = true;
        yield content;
      }

      // 检查完成原因
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
    }

    // 如果因为长度限制被截断，记录警告
    if (finishReason === 'length') {
      console.warn('⚠️ 内容因达到 max_tokens 限制而被截断，请考虑增加 max_tokens 或优化提示词');
    }

    // 如果没有生成任何内容，抛出错误
    if (!hasYieldedContent) {
      throw new Error('AI 未返回任何内容，请重试');
    }
  } catch (error: any) {
    console.error('Error in stream generation:', error);

    if (error?.status === 429) {
      throw new Error('API 请求过于频繁，请稍后再试');
    } else if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      throw new Error('网络连接中断，请检查网络后重试');
    } else if (error?.message?.includes('timeout')) {
      throw new Error('AI 响应超时，请稍后重试');
    }

    throw error;
  }
}

/**
 * 流式生成（用于实时显示）
 */
export async function* streamGenerate(prompt: string) {
  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'MiniMax-M2',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Error in stream generation:', error);
    throw error;
  }
}

/**
 * 生成市场验证问卷
 */
export async function generateQuestionnaire(elements: any) {
  const systemPrompt = `你是一个专业的市场调研专家。你的任务是基于商业要素生成结构化的市场验证问卷 JSON 数据。

严格规则：
1. 只输出纯 JSON 格式，不要任何其他文字
2. 不要添加注释、解释或思考过程
3. 确保 JSON 格式完全有效，可以被 JSON.parse() 解析
4. 所有字符串必须使用双引号
5. 不要在字符串中使用未转义的引号或换行符`;

  const userPrompt = `基于以下商业要素，生成一份市场验证问卷。

商业要素：
${JSON.stringify(elements, null, 2)}

请严格按照以下 JSON 格式输出（不要任何其他内容）：

{
  "questions": [
    {
      "id": 1,
      "category": "问题认知",
      "type": "choice",
      "question": "您是否遇到过相关问题？",
      "options": ["经常遇到", "偶尔遇到", "很少遇到", "从未遇到"],
      "purpose": "了解用户对问题的认知程度"
    }
  ]
}

要求：
1. 生成 10-12 个问题
2. 问题分类：问题认知（2-3题）、解决方案（2-3题）、用户画像（2-3题）、付费意愿（2-3题）
3. 问题类型：choice（单选）、multiple（多选）、scale（量表1-5分）、text（开放）
4. 每个问题都要有明确的调研目的
5. 选项要具体、简短、互斥
6. 问题描述要清晰简洁

立即输出 JSON（不要其他任何文字）：`;

  try {
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'MiniMax-M2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 3000, // 优化：问卷生成不需要太多token
      });
    }, 3, 3000);

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('API 返回了空的 choices 数组');
    }

    let content = choice.message?.content || '';

    if (!content) {
      throw new Error('AI 返回了空内容');
    }

    console.log('AI 返回的原始内容长度:', content.length);
    console.log('AI 返回的原始内容前 500 字符:', content.substring(0, 500));

    // 先移除 MiniMax-M2 的 <think> 标签内容
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // 清理内容：移除 markdown 代码块标记
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // 提取 JSON 内容：找到第一个 { 和最后一个 }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.error('无法找到有效的 JSON 结构');
      throw new Error('AI 返回的内容不包含有效的 JSON 格式');
    }

    const jsonStr = content.substring(firstBrace, lastBrace + 1);
    console.log('提取的 JSON 长度:', jsonStr.length);

    // 尝试解析 JSON
    try {
      const parsed = JSON.parse(jsonStr);

      // 验证返回的数据结构
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('返回的 JSON 缺少 questions 数组');
      }

      // 验证每个问题的结构
      for (let i = 0; i < parsed.questions.length; i++) {
        const q = parsed.questions[i];
        if (!q.id || !q.category || !q.type || !q.question || !q.purpose) {
          console.error(`问题 ${i + 1} 缺少必需字段:`, q);
          throw new Error(`问题 ${i + 1} 的数据结构不完整`);
        }
      }

      console.log('问卷生成成功，共', parsed.questions.length, '个问题');
      return parsed;

    } catch (parseError: any) {
      console.error('JSON 解析失败:', parseError.message);
      console.error('尝试解析的 JSON:', jsonStr.substring(0, 1000));
      throw new Error(`JSON 解析失败: ${parseError.message}`);
    }

  } catch (error: any) {
    console.error('Error generating questionnaire:', error);

    if (error?.status === 429) {
      throw new Error('API 请求过于频繁，请稍后再试');
    }

    throw error;
  }
}
