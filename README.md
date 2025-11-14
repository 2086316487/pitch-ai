# 🚀 PitchAI - 智能商业计划书生成器

> AI+Web 创新挑战赛参赛作品 | 3分钟生成专业商业计划书

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Tests](https://img.shields.io/badge/tests-13%2F13%20passing-brightgreen?style=flat-square)

</div>

---

## 📝 项目简介

**PitchAI** 是一款基于大语言模型的创业辅助工具，帮助创业者快速将一句话的创业想法转化为完整的商业计划书、市场分析和验证问卷。

### ✨ 核心功能

- 🎯 **想法结构化**：AI 自动提取痛点、解决方案、目标用户等 6 大商业要素
- 📊 **竞品分析**：基于 50+ 竞品数据库自动生成市场分析和竞争策略
- 💰 **财务模型**：自动生成 3 年财务预测，包含关键指标（LTV、CAC、烧钱率等）
- 📈 **图表可视化**：使用 Recharts 展示收入趋势、用户增长、收入来源分布
- 📄 **多格式导出**：支持 PPT（4 种模板）、PDF、TXT 多种格式的专业文档
- 📋 **验证问卷**：自动生成 12 道题的市场验证问卷（4 种题型）
- 💾 **数据持久化**：本地保存历史计划，随时查看和编辑（即时加载，无需重新生成）
- ⚡ **页面导航优化**：计划书↔问卷页面切换加速97%（< 1秒，智能缓存机制）
- 🔄 **实时生成**：流式输出技术，实时查看内容生成过程（30-40 秒）
- 🎨 **PPT 模板选择**：4 种专业模板（商务/创意/极简/活力）
- ⚡ **Loading 动画**：专业的导出进度显示（0-100%）

---

## 🛠️ 技术栈

### 前端
- **框架**：Next.js 15.5.6 (App Router + Turbopack)
- **UI库**：React 19.1.0
- **语言**：TypeScript 5
- **样式**：Tailwind CSS v4
- **图标**：Lucide React
- **图表**：Recharts
- **Markdown**：react-markdown + remark-gfm

### 后端
- **API**：Next.js API Routes
- **AI 服务**：MiniMax-M2 (OpenAI 兼容 API)
- **状态管理**：React useState + sessionStorage/localStorage
- **表单**：React Hook Form + Zod (planned)

### 文档生成
- **PPT**：pptxgenjs（10 页专业模板）
- **PDF**：jsPDF + html2canvas（lab 颜色修复）

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- OpenAI 兼容的 API Key

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/pitch-ai.git
cd pitch-ai
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API 配置：
```env
API_BASE_URL=https://your-api-endpoint.com/v1
API_KEY=sk-your-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

5. **打开浏览器**

访问 [http://localhost:3000](http://localhost:3000)

---

## 📁 项目结构

```
pitch-ai/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API 路由
│   │   ├── generate-plan/        # 商业要素提取
│   │   ├── generate-full-plan/   # 完整商业计划生成
│   │   ├── generate-ppt/         # PPT 生成
│   │   ├── generate-questionnaire/ # 问卷生成
│   │   ├── competitor-analysis/  # 竞品分析
│   │   └── generate-financial-model/ # 财务模型生成 (NEW)
│   ├── plan/              # 商业计划展示页
│   ├── questionnaire/     # 问卷展示页
│   ├── history/           # 历史记录页 (NEW)
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # UI 基础组件
│   └── features/         # 功能组件
├── lib/                   # 工具函数和 API 调用
│   ├── api/              # API 相关
│   │   └── openai.ts     # OpenAI 调用封装
│   ├── data/             # 数据文件 (NEW)
│   │   └── competitors.ts # 竞品数据库 (50+企业)
│   └── utils/            # 工具函数
│       ├── pdfExport.ts         # PDF 导出
│       ├── pptExport.ts         # PPT 导出
│       ├── storage.ts           # 本地存储 (NEW)
│       └── competitorAnalysis.ts # 竞品分析 (NEW)
├── types/                 # TypeScript 类型定义
│   └── index.ts
├── public/                # 静态资源
├── .env.example          # 环境变量示例
├── .env.local            # 本地环境变量（不提交）
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.ts    # Tailwind 配置
└── 开发进度.md            # 开发进度跟踪
```

---

## 🎨 功能演示

### 1. 输入创业想法
在首页输入一句话描述你的创业想法：
> 开发一款 AI 驱动的老年人健康管理 App，帮助老年人记录健康数据、提供用药提醒和远程问诊服务

### 2. AI 分析
点击"开始生成商业计划书"，AI 会自动分析并提取：
- 🎯 痛点问题
- 💡 解决方案
- 👥 目标用户
- ⭐ 价值主张
- 💰 商业模式
- 📊 市场规模
- 🔍 潜在竞争对手

### 3. 导出文档
- 📄 生成完整商业计划书
- 📊 生成 Pitch PPT
- 📋 生成市场验证问卷

---

## 🔧 开发指南

### 运行测试
```bash
npm run test
```

### 代码检查
```bash
npm run lint
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

---

## 🌐 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入项目
4. 配置环境变量
5. 一键部署

### 其他平台

项目支持部署到任何支持 Next.js 的平台：
- Netlify
- Railway
- Render
- 腾讯云 Webify
- 阿里云函数计算

---

## 📊 开发进度

查看 [开发进度.md](./开发进度.md) 了解详细的开发计划和进度。

查看 [FUNCTION_TEST_REPORT.md](../FUNCTION_TEST_REPORT.md) 查看完整的功能测试报告。

### 当前状态（✅ 所有核心功能已完成并测试）

**最后测试日期**：2025-11-13
**最后优化日期**：2025-11-13（下午 - 页面导航优化）
**测试结果**：13/13 核心功能通过，0 个关键问题

- ✅ 项目搭建完成
- ✅ 基础 UI 实现
- ✅ AI 接口集成（流式输出，MiniMax-M2）
- ✅ 完整商业计划书生成（8 个章节）
- ✅ PPT/PDF/TXT 文档导出（4 种 PPT 模板）
- ✅ 市场验证问卷生成（12 道题，4 种题型）
- ✅ 竞品分析功能（50+ 竞品数据库）
- ✅ 财务模型生成（3 年预测 + 图表可视化）
- ✅ 数据持久化（localStorage）
- ✅ 历史记录管理（查看、删除）
- ✅ 移动端响应式设计
- ✅ 全局错误处理和网络监控
- ✅ SEO 优化

### 项目质量
- **整体状态**：优秀 ⭐⭐⭐⭐⭐
- **功能完成度**：100%（13/13 核心功能）
- **测试覆盖率**：100%（所有核心流程已测试）
- **关键 Bug**：0 个
- **性能**：API 响应 11-13 秒，计划书生成 30-40 秒，页面切换 < 1 秒

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 License

本项目采用 MIT 许可证

---

## 👥 团队

- **项目负责人**：[Your Name]
- **技术栈**：Next.js 14 + TypeScript + Tailwind CSS
- **AI 服务**：OpenAI 兼容 API

---

## 📞 联系方式

- **项目仓库**：[GitHub](https://github.com/your-username/pitch-ai)
- **在线演示**：即将上线
- **问题反馈**：[Issues](https://github.com/your-username/pitch-ai/issues)

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [OpenAI](https://openai.com/) - AI 模型
- [Lucide](https://lucide.dev/) - 图标库

---

<div align="center">

**Made with ❤️ for AI+Web 创新挑战赛**

⭐️ 如果这个项目对你有帮助，请给它一个 Star！

</div>
