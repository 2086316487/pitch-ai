/**
 * 竞品数据库 - 预设数据
 * 包含常见行业的主要竞品信息
 */

export interface Competitor {
  id: string;
  name: string;
  industry: string[];
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: string;
  targetUsers?: string;
  pricing?: string;
  founded?: string;
}

export const competitorDatabase: Competitor[] = [
  // ===== 健康医疗类 =====
  {
    id: 'comp_health_001',
    name: '春雨医生',
    industry: ['健康', '医疗', '在线问诊', '健康管理'],
    description: '国内领先的在线医疗健康平台，提供在线问诊、健康咨询等服务',
    strengths: [
      '医生资源丰富，覆盖全科',
      '用户基数大，品牌认知度高',
      '积累大量医疗数据',
      '多年运营经验'
    ],
    weaknesses: [
      '个性化服务不足',
      'AI技术应用较浅',
      '用户粘性有待提高',
      '盈利模式单一'
    ],
    marketShare: '15%',
    targetUsers: '有健康咨询需求的普通用户',
    pricing: '免费+付费问诊（50-200元/次）',
    founded: '2011年'
  },
  {
    id: 'comp_health_002',
    name: '平安好医生',
    industry: ['健康', '医疗', '在线问诊', '健康保险'],
    description: '平安集团旗下一站式医疗健康生态平台',
    strengths: [
      '背靠平安集团资源',
      '线上线下结合',
      '保险业务协同',
      '技术投入大'
    ],
    weaknesses: [
      'APP体验复杂',
      '功能过于繁杂',
      '针对老年人不够友好'
    ],
    marketShare: '20%',
    targetUsers: '有医疗健康需求的中高端用户',
    pricing: '会员制（188元/年）+ 问诊费',
    founded: '2014年'
  },
  {
    id: 'comp_health_003',
    name: '丁香医生',
    industry: ['健康', '医疗', '健康科普', '在线问诊'],
    description: '专业医学健康内容平台，提供可信赖的医学科普',
    strengths: [
      '内容专业权威',
      '医生质量高',
      '用户信任度好',
      '社区氛围良好'
    ],
    weaknesses: [
      '商业化进展慢',
      '功能相对简单',
      'AI应用有限'
    ],
    marketShare: '10%',
    targetUsers: '关注健康知识的年轻用户',
    pricing: '免费内容 + 付费问诊',
    founded: '2014年'
  },
  {
    id: 'comp_health_004',
    name: '阿里健康',
    industry: ['健康', '医疗', '医药电商', '慢病管理'],
    description: '阿里巴巴集团旗下医疗健康平台',
    strengths: [
      '电商基因强大',
      '供应链完善',
      '技术实力雄厚',
      '数据资源丰富'
    ],
    weaknesses: [
      '医疗服务专业性弱',
      '用户更多用于购药',
      '健康管理功能欠缺'
    ],
    marketShare: '18%',
    targetUsers: '有购药和基础健康需求的用户',
    pricing: '免费服务 + 商品销售',
    founded: '2014年'
  },

  // ===== 教育培训类 =====
  {
    id: 'comp_edu_001',
    name: '作业帮',
    industry: ['教育', 'K12', '在线学习', 'AI辅导'],
    description: '中小学在线教育平台，提供拍照搜题、在线辅导等服务',
    strengths: [
      '用户量大（超4亿）',
      '题库资源丰富',
      'AI技术应用成熟',
      '品牌知名度高'
    ],
    weaknesses: [
      '政策监管压力',
      '同质化竞争激烈',
      '获客成本高',
      '用户留存难'
    ],
    marketShare: '25%',
    targetUsers: 'K12学生及家长',
    pricing: '免费功能 + 付费课程（几百至上万元）',
    founded: '2015年'
  },
  {
    id: 'comp_edu_002',
    name: '猿辅导',
    industry: ['教育', 'K12', '在线课程', 'AI学习'],
    description: '在线教育独角兽，提供系统化在线课程',
    strengths: [
      '课程体系完善',
      '名师资源优质',
      '技术研发强',
      '融资充足'
    ],
    weaknesses: [
      '课程价格较高',
      '个性化不足',
      '受双减政策影响大'
    ],
    marketShare: '20%',
    targetUsers: 'K12学生，尤其是一二线城市',
    pricing: '系统课程（3000-15000元/学期）',
    founded: '2012年'
  },
  {
    id: 'comp_edu_003',
    name: '网易有道',
    industry: ['教育', 'K12', '智能硬件', '词典工具'],
    description: '网易旗下智能学习公司，提供工具+内容+硬件',
    strengths: [
      '有道词典用户基础大',
      '智能硬件创新',
      '技术积累深厚',
      '产品矩阵完整'
    ],
    weaknesses: [
      'K12业务受政策限制',
      '硬件销量一般',
      '盈利压力大'
    ],
    marketShare: '15%',
    targetUsers: '学生及职场学习者',
    pricing: '工具免费 + 课程和硬件收费',
    founded: '2006年'
  },

  // ===== 电商零售类 =====
  {
    id: 'comp_ecom_001',
    name: '淘宝',
    industry: ['电商', '零售', 'C2C', '社交电商'],
    description: '中国最大的C2C电商平台',
    strengths: [
      '用户基数巨大',
      '商品种类全',
      '生态系统完善',
      '支付和物流成熟'
    ],
    weaknesses: [
      '假货问题',
      '商家质量参差不齐',
      'C端获客成本高',
      '年轻用户流失'
    ],
    marketShare: '45%',
    targetUsers: '全年龄段网购用户',
    pricing: '免费平台 + 商家费用',
    founded: '2003年'
  },
  {
    id: 'comp_ecom_002',
    name: '拼多多',
    industry: ['电商', '社交电商', '农产品', '下沉市场'],
    description: '社交电商平台，主打拼团模式',
    strengths: [
      '下沉市场优势明显',
      '增长速度快',
      '社交裂变强',
      '农产品供应链好'
    ],
    weaknesses: [
      '品牌形象较低端',
      '商品质量参差',
      '用户忠诚度低',
      '假货投诉多'
    ],
    marketShare: '30%',
    targetUsers: '三四线及以下城市用户',
    pricing: '免费平台 + 商家费用',
    founded: '2015年'
  },
  {
    id: 'comp_ecom_003',
    name: '京东',
    industry: ['电商', '零售', 'B2C', '物流'],
    description: '中国最大的自营式电商平台',
    strengths: [
      '物流体验好（自营）',
      '正品保障强',
      '供应链优势',
      '3C数码强势'
    ],
    weaknesses: [
      '品类不如淘宝全',
      '价格相对较高',
      '盈利压力大',
      '获客成本高'
    ],
    marketShare: '20%',
    targetUsers: '追求品质和物流的中高端用户',
    pricing: '免费平台 + Plus会员（99元/年）',
    founded: '2004年'
  },

  // ===== 金融科技类 =====
  {
    id: 'comp_fin_001',
    name: '支付宝',
    industry: ['金融', '支付', '理财', '生活服务'],
    description: '蚂蚁集团旗下综合金融服务平台',
    strengths: [
      '用户量超10亿',
      '支付场景全面',
      '金融产品丰富',
      '信用体系完善'
    ],
    weaknesses: [
      '功能过于复杂',
      '监管压力大',
      '社交属性弱',
      '隐私争议'
    ],
    marketShare: '55%',
    targetUsers: '全年龄段用户',
    pricing: '免费服务 + 金融产品收益',
    founded: '2004年'
  },
  {
    id: 'comp_fin_002',
    name: '微信支付',
    industry: ['金融', '支付', '社交支付', '小程序'],
    description: '腾讯旗下移动支付平台',
    strengths: [
      '微信生态绑定',
      '社交支付便捷',
      '小程序优势',
      '高频场景多'
    ],
    weaknesses: [
      '金融产品较少',
      '理财收益一般',
      'B端服务弱',
      '独立性差'
    ],
    marketShare: '40%',
    targetUsers: '微信用户（几乎全民）',
    pricing: '免费服务 + 提现手续费',
    founded: '2013年'
  },

  // ===== 本地生活类 =====
  {
    id: 'comp_local_001',
    name: '美团',
    industry: ['本地生活', '外卖', '到店', '酒旅'],
    description: '中国领先的生活服务电商平台',
    strengths: [
      '外卖市场份额第一',
      '配送网络强大',
      '本地商户资源多',
      'LBS技术优势'
    ],
    weaknesses: [
      '商家佣金高引发矛盾',
      '骑手权益争议',
      '新业务盈利难',
      '竞争压力大'
    ],
    marketShare: '65%',
    targetUsers: '城市白领及年轻用户',
    pricing: '免费APP + 配送费 + 会员（15元/月）',
    founded: '2010年'
  },
  {
    id: 'comp_local_002',
    name: '饿了么',
    industry: ['本地生活', '外卖', '即时配送'],
    description: '阿里巴巴旗下外卖平台',
    strengths: [
      '阿里生态支持',
      '饿了么星选高端化',
      '即时配送能力',
      '商家资源丰富'
    ],
    weaknesses: [
      '市场份额落后美团',
      '配送体验不稳定',
      '品牌老化',
      '创新不足'
    ],
    marketShare: '30%',
    targetUsers: '城市外卖用户',
    pricing: '免费APP + 配送费 + 会员联动88VIP',
    founded: '2008年'
  },

  // ===== 出行交通类 =====
  {
    id: 'comp_travel_001',
    name: '滴滴出行',
    industry: ['出行', '网约车', '共享出行', '地图'],
    description: '中国最大的移动出行平台',
    strengths: [
      '用户和司机规模大',
      '城市覆盖广',
      '技术调度优势',
      '多元化业务'
    ],
    weaknesses: [
      '安全事件影响',
      '监管合规压力',
      '司机补贴压力',
      '盈利困难'
    ],
    marketShare: '80%',
    targetUsers: '城市出行用户',
    pricing: '按里程计费 + 动态溢价',
    founded: '2012年'
  },
  {
    id: 'comp_travel_002',
    name: '高德地图',
    industry: ['出行', '地图', '导航', '聚合打车'],
    description: '阿里巴巴旗下地图导航及出行服务平台',
    strengths: [
      '地图数据精准',
      '导航体验好',
      '聚合打车模式',
      '不抽佣吸引司机'
    ],
    weaknesses: [
      '网约车业务起步晚',
      '司机数量少',
      '订单响应慢',
      '盈利模式不清'
    ],
    marketShare: '10%（网约车）',
    targetUsers: '地图导航用户',
    pricing: '免费地图 + 打车按平台计费',
    founded: '2002年（地图），2017年（打车）'
  },

  // ===== 社交媒体类 =====
  {
    id: 'comp_social_001',
    name: '微信',
    industry: ['社交', '即时通讯', '支付', '小程序'],
    description: '中国最大的社交通讯平台',
    strengths: [
      '月活超13亿',
      '社交关系牢固',
      '生态体系完整',
      '高频使用'
    ],
    weaknesses: [
      '功能臃肿',
      '创新乏力',
      '年轻用户增长慢',
      '隐私争议'
    ],
    marketShare: '85%',
    targetUsers: '全年龄段用户',
    pricing: '免费服务',
    founded: '2011年'
  },
  {
    id: 'comp_social_002',
    name: '抖音',
    industry: ['社交', '短视频', '直播', '电商'],
    description: '字节跳动旗下短视频社交平台',
    strengths: [
      '算法推荐强大',
      '用户时长高',
      '内容创作门槛低',
      '商业化能力强'
    ],
    weaknesses: [
      '内容质量参差',
      '沉迷问题争议',
      '同质化严重',
      '监管风险'
    ],
    marketShare: '70%（短视频）',
    targetUsers: '年轻用户为主',
    pricing: '免费观看 + 打赏/广告/电商',
    founded: '2016年'
  },
  {
    id: 'comp_social_003',
    name: '小红书',
    industry: ['社交', '种草', '电商', '生活方式'],
    description: '生活方式平台和消费决策入口',
    strengths: [
      '女性用户粘性高',
      '种草转化率高',
      '社区氛围好',
      '年轻高消费力用户'
    ],
    weaknesses: [
      '商业化与社区矛盾',
      '虚假种草问题',
      '电商转化不理想',
      '内容审核压力'
    ],
    marketShare: '15%（生活方式社区）',
    targetUsers: '一二线城市年轻女性',
    pricing: '免费社区 + 电商/广告',
    founded: '2013年'
  },

  // ===== 办公协作类 =====
  {
    id: 'comp_office_001',
    name: '钉钉',
    industry: ['办公', '协作', 'IM', '企业服务'],
    description: '阿里巴巴旗下企业协同办公平台',
    strengths: [
      '中小企业覆盖广',
      '免费基础功能',
      '阿里云支持',
      '审批流程强'
    ],
    weaknesses: [
      '用户体验一般',
      '"打工人噩梦"形象',
      '大企业渗透难',
      '功能复杂'
    ],
    marketShare: '40%',
    targetUsers: '中小企业及组织',
    pricing: '基础免费 + 增值服务',
    founded: '2015年'
  },
  {
    id: 'comp_office_002',
    name: '企业微信',
    industry: ['办公', '协作', '客户管理', '企业社交'],
    description: '腾讯推出的企业通讯与办公工具',
    strengths: [
      '与微信互通',
      '客户管理强',
      '大企业接受度高',
      '生态整合好'
    ],
    weaknesses: [
      '功能相对简单',
      '协作工具弱',
      '自定义能力差'
    ],
    marketShare: '35%',
    targetUsers: '中大型企业',
    pricing: '免费使用',
    founded: '2016年'
  },
  {
    id: 'comp_office_003',
    name: '飞书',
    industry: ['办公', '协作', '文档', 'OKR'],
    description: '字节跳动旗下企业协作平台',
    strengths: [
      '产品体验极佳',
      '协作功能强大',
      '多维表格创新',
      '年轻团队喜爱'
    ],
    weaknesses: [
      '市场份额小',
      '中小企业渗透低',
      '知名度不够',
      '生态较弱'
    ],
    marketShare: '10%',
    targetUsers: '互联网公司和创新团队',
    pricing: '基础免费 + 高级版（99元/人/年）',
    founded: '2016年'
  },

  // ===== 内容资讯类 =====
  {
    id: 'comp_content_001',
    name: '今日头条',
    industry: ['资讯', '新闻', '算法推荐', '内容聚合'],
    description: '字节跳动旗下个性化资讯推荐平台',
    strengths: [
      '算法推荐技术领先',
      '用户时长高',
      '广告变现强',
      '内容丰富'
    ],
    weaknesses: [
      '原创内容少',
      '低质内容多',
      '监管压力大',
      '用户增长放缓'
    ],
    marketShare: '35%',
    targetUsers: '中老年及下沉市场用户',
    pricing: '免费阅读 + 广告',
    founded: '2012年'
  },
  {
    id: 'comp_content_002',
    name: '知乎',
    industry: ['内容', '问答', '社区', '知识分享'],
    description: '中文互联网高质量问答社区',
    strengths: [
      '内容质量高',
      '用户质量好',
      '品牌调性高',
      'SEO优势强'
    ],
    weaknesses: [
      '商业化困难',
      '社区氛围变化',
      '用户增长慢',
      '竞争加剧'
    ],
    marketShare: '20%（问答社区）',
    targetUsers: '一二线城市年轻知识分子',
    pricing: '免费社区 + 盐选会员（198元/年）',
    founded: '2010年'
  },

  // ===== AI 工具类 =====
  {
    id: 'comp_ai_001',
    name: 'ChatGPT',
    industry: ['AI', '对话', '写作', '编程'],
    description: 'OpenAI开发的大语言模型对话工具',
    strengths: [
      '技术最先进',
      '能力最全面',
      '国际知名度高',
      '生态丰富（插件）'
    ],
    weaknesses: [
      '国内访问受限',
      '中文能力相对弱',
      '价格较贵',
      '数据隐私担忧'
    ],
    marketShare: '60%（全球）',
    targetUsers: '技术人员、内容创作者',
    pricing: '免费版 + Plus（$20/月）',
    founded: '2022年'
  },
  {
    id: 'comp_ai_002',
    name: '文心一言',
    industry: ['AI', '对话', '搜索', '创作'],
    description: '百度开发的大语言模型',
    strengths: [
      '中文能力强',
      '本土化好',
      '百度生态支持',
      '合规优势'
    ],
    weaknesses: [
      '技术能力与GPT有差距',
      '用户体验待优化',
      '知名度不如国际产品'
    ],
    marketShare: '25%（国内）',
    targetUsers: '国内普通用户',
    pricing: '免费使用',
    founded: '2023年'
  },
  {
    id: 'comp_ai_003',
    name: '通义千问',
    industry: ['AI', '对话', '办公', '创作'],
    description: '阿里云推出的大语言模型',
    strengths: [
      '阿里云技术支持',
      '企业服务能力',
      '多模态能力',
      '免费开放'
    ],
    weaknesses: [
      'C端知名度低',
      '产品体验一般',
      '差异化不足'
    ],
    marketShare: '15%（国内）',
    targetUsers: '企业用户和开发者',
    pricing: '免费使用',
    founded: '2023年'
  },

  // ===== 智能硬件类 =====
  {
    id: 'comp_hardware_001',
    name: '小米智能家居',
    industry: ['智能硬件', '物联网', '智能家居', 'AIoT'],
    description: '小米生态链智能家居产品体系',
    strengths: [
      '产品线最全',
      '性价比高',
      '生态链完善',
      '用户基数大'
    ],
    weaknesses: [
      '高端产品竞争力弱',
      '品控参差不齐',
      '同质化严重'
    ],
    marketShare: '35%',
    targetUsers: '追求性价比的年轻用户',
    pricing: '几十元到数千元不等',
    founded: '2010年'
  },
  {
    id: 'comp_hardware_002',
    name: '华为智选',
    industry: ['智能硬件', '物联网', '智能家居', '鸿蒙'],
    description: '华为鸿蒙生态智能家居产品',
    strengths: [
      '技术实力强',
      '鸿蒙生态',
      '品牌溢价高',
      '高端市场优势'
    ],
    weaknesses: [
      '价格较高',
      '产品线不够全',
      '生态建设中'
    ],
    marketShare: '20%',
    targetUsers: '中高端用户',
    pricing: '中高端定位',
    founded: '2018年'
  }
];

/**
 * 根据关键词搜索竞品
 */
export function searchCompetitors(keywords: string[]): Competitor[] {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const results = competitorDatabase.filter(comp => {
    // 检查关键词是否匹配行业、名称或描述
    return keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return (
        comp.industry.some(ind => ind.includes(keyword) || ind.toLowerCase().includes(lowerKeyword)) ||
        comp.name.includes(keyword) ||
        comp.description.includes(keyword) ||
        comp.targetUsers?.includes(keyword)
      );
    });
  });

  // 按匹配度排序（匹配更多关键词的排前面）
  return results.sort((a, b) => {
    const scoreA = keywords.filter(kw =>
      a.industry.some(ind => ind.includes(kw)) || a.name.includes(kw)
    ).length;
    const scoreB = keywords.filter(kw =>
      b.industry.some(ind => ind.includes(kw)) || b.name.includes(kw)
    ).length;
    return scoreB - scoreA;
  }).slice(0, 5); // 最多返回5个竞品
}

/**
 * 根据行业获取竞品
 */
export function getCompetitorsByIndustry(industry: string): Competitor[] {
  return competitorDatabase
    .filter(comp => comp.industry.some(ind => ind.includes(industry)))
    .slice(0, 5);
}

/**
 * 从业务元素中提取关键词，用于匹配竞品
 */
export function extractKeywordsFromElements(elements: any): string[] {
  const keywords: string[] = [];

  // 扩展的关键词列表
  const industryKeywords = [
    '健康', '医疗', '问诊', '体检', '康复', '养生',
    '教育', '学习', 'K12', '培训', '课程', '辅导',
    '电商', '购物', '零售', '商城',
    '支付', '金融', '理财', '保险', '贷款',
    '外卖', '餐饮', '美食',
    '出行', '打车', '网约车', '导航', '地图',
    '社交', '聊天', '通讯', '社区',
    '办公', '协作', '企业', 'OA', '文档',
    '资讯', '新闻', '内容', '阅读',
    'AI', '智能', '人工智能', '算法',
    '硬件', '物联网', '智能家居', '设备'
  ];

  // 从问题、解决方案、描述中提取
  const textToAnalyze = [
    elements.problem || '',
    elements.solution || '',
    elements.description || '',
    elements.valueProposition || ''
  ].join(' ');

  // 检查所有关键词
  industryKeywords.forEach(keyword => {
    if (textToAnalyze.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  // 从目标用户中提取并推断行业
  if (elements.targetUsers) {
    const userWords = ['老年人', '学生', 'K12', '白领', '家长', '企业', '商家', '儿童', '青少年'];
    userWords.forEach(word => {
      if (elements.targetUsers.includes(word)) {
        keywords.push(word);
        // 用户类型推断行业
        if (word === '老年人') {
          keywords.push('健康', '医疗');
        }
        if (word === '学生' || word === 'K12' || word === '家长' || word === '儿童' || word === '青少年') {
          keywords.push('教育', '学习');
        }
        if (word === '企业') {
          keywords.push('办公', '协作');
        }
        if (word === '商家') {
          keywords.push('电商', '零售');
        }
      }
    });
  }

  // 去重并返回
  return [...new Set(keywords)];
}
