---
name: tools-dev-skill
description: 在「开发者工具箱」工程（React 19 + TypeScript + Vite）中新增或修改工具、页面、导航、样式时使用。蒸馏了本工程的架构约定、加工具清单、样式规范与协作流程。
---

# 开发者工具箱 · 开发规范

本工程是一个纯前端、纯本地运行的开发者在线工具集（Markdown、JSON、文本对比、时间戳、二维码……），部署在 GitHub Pages 的 `/tools/` 路径下。所有数据不离开浏览器。

在本工程做任何开发前，遵循以下规范。

## 技术栈与约定

- React 19 + TypeScript + Vite 6，路由用 `react-router-dom` 的 `HashRouter`
- `@/` 别名指向 `src/`；tsconfig 用相对 `paths`（`"@/*": ["./src/*"]`），**不要**加 `baseUrl`（TS 7 已弃用，CI 会报错）
- 优先选择自带类型声明、轻量、无框架依赖的库
- 纯本地：不引入需要联网/后端的能力，数据留在浏览器
- UI 文案用中文；代码注释极简，只在 WHY 非显而易见时写一行

## 单一数据源：src/tools.ts

工具注册表是唯一数据源，导航和首页都从它派生。新增工具只需改这里 + 建页面 + 挂路由。

- `Tool`：`{ path, name, navLabel, description, keywords[], icon, category }`
- `category`：`edit` / `convert` / `compare` / `generate`
- `CATEGORIES`：分类的显示顺序与名称，**按使用频次排序**（当前：格式转换 → 对比校验 → 生成工具 → 编辑预览）
- `groupedTools()`：按 CATEGORIES 顺序分组、跳过空组，导航与首页共用

## 新增一个工具的完整清单

按顺序完成，缺一不可：

1. **注册** — 在 `src/tools.ts` 的 `TOOLS` 追加一条，选好 `category`、`icon`、`keywords`
2. **建页面** — `src/pages/Xxx.tsx`，用固定页面结构（见下），首行调 `useSeo(TOOL.name, TOOL.description)`，`const TOOL = TOOLS.find(t => t.path === '/xxx')!`
3. **挂路由** — `src/App.tsx` 加 `import` + `<Route path="/xxx" element={<XxxPage />} />`
4. **SEO** — 在 `index.html` 同步 3 处静态 SEO（`description`、`keywords`、JSON-LD `hasPart`，见「SEO 规范」）；`public/sitemap.xml` 只列首页，**无需改**
5. **文档** — `README.md` 功能表加一行
6. **验证** — 跑 `npm run build`

## 页面结构规范

```tsx
<div className="page xxx-page">
  <header className="page-header">
    <div className="header-actions">
      {/* 按钮靠右；多模式用 .view-toggle > .toggle-btn */}
    </div>
  </header>
  <div className="xxx-body">{/* 内容 */}</div>
</div>
```

- 页面标题**不写**在页内（导航已表达），`.page-header` 只放右侧操作区
- 复用现有类：`.btn` / `.btn-secondary`、`.view-toggle` / `.toggle-btn`、`.pane-header`（`min-height: 39px` 保证左右标题栏等高）、`.pane-label`、`.error-badge` / `.success-badge` / `.error-hint`
- 状态徽标放进 `.pane-header`，避免有无徽标导致左右高度不一致
- **复用共享组件**：跨页面重复的交互控件提取到 `src/components/`，不在页面内重复定义。已有：`CopyButton`（`src/components/CopyButton.tsx`，`<CopyButton text={...} />`，自带「已复制」反馈），复制文本一律用它

## 样式规范

- **一律用 `src/index.css` 的设计变量**：间距 `--space-1..6`、颜色 `--color-*`、圆角 `--radius-sm/md/lg`、阴影 `--shadow-*`、过渡 `--transition`。禁止硬编码像素/颜色（渐变等特例除外）
- **无全局滚动条铁律**：`body`/`#root` 为 `height:100vh; overflow:hidden` 弹性列；`.page` 为 `flex:1; min-height:0; overflow:hidden`；滚动只发生在内容区（`overflow-y:auto`）
- 双栏布局用 flex，`min-width:0` 防溢出；`@media (max-width:768px)` 下改纵向并给固定高度
- 新页面样式追加到 `src/App.css`，按 `/* ===== Xxx Page ===== */` 分区

## SEO 规范

站点用 `HashRouter` 部署在 `https://swlws.github.io/tools/`，工具页真实地址是 `#/xxx`。**hash 片段不会被爬虫当独立页面索引**，因此 SEO 只优化首页这一个可索引页面（方案 A，务实取舍；真正让子页可索引需改 BrowserRouter + 预渲染，成本高、暂不做）。

- **运行时（SPA 内切换）**：每个页面首行调 `useSeo(TOOL.name, TOOL.description)`，动态改 `document.title` 与 description/og。这只影响已加载后的切换，爬虫首屏抓取看不到。
- **静态首屏（爬虫抓取）**：`index.html` 是静态文件，**无法 import `tools.ts`**，有 3 处需手工覆盖全部工具，新增工具时务必同步：
  1. `<meta name="description">` — 概括并列举主要工具名
  2. `<meta name="keywords">` — 补齐新工具关键词
  3. JSON-LD `hasPart` — 每个工具一条 `SoftwareApplication`，`url` 用**绝对地址** `https://swlws.github.io/tools/#/xxx`
  （`og:description` 一并同步）
- **sitemap / robots**：`public/sitemap.xml` **只列首页**、`<loc>` 用绝对 URL，**不要**为 hash 子路由加条目（爬虫抓不到，等于无效条目）；`public/robots.txt` 的 `Sitemap:` 也用绝对 URL。

## 协作流程

- **先设计后编码**：非平凡任务先用 `superpowers:brainstorming` 出方案 → 展示 → 用户确认（如「执行」）后才写代码
- 需要用户定范围时用 `AskUserQuestion`，一次问一个问题，多选项给推荐
- 多步任务用 Task 工具跟踪进度
- UI 调整是迭代式的，按用户逐条反馈微调，改完即验证
- **未经用户明确要求，不 commit、不 push**
- commit message 用中文、聚焦「为什么」，结尾带 `Co-Authored-By: Claude <noreply@anthropic.com>`

## 验证与部署

- 每次改动后跑 `npm run build`（= `tsc -b && vite build`），必须通过再交付
- 推送到 `master` 后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages
- 工作流用 Node 24；`vite.config.ts` 的 `base: '/tools/'` 对应项目页路径

## 目录约定

- skill 实体在 `ai-native-spec/skills/`，通过软链暴露到 `.claude/skills/`
- 方案设计等中间产物放 `ai-native-tmp/`（已被 `.gitignore` 忽略），不进版本库

## 自我学习

本 skill 应随工程演进持续更新。当在开发中检测到**尚未被本文档记录的新模式**时，主动学习并沉淀，但必须经开发者确认后才写入。

**何时触发**（检测到以下任一情况）：
- 引入了新的技术栈、库或架构约定（如新的状态管理、新的构建配置）
- 出现了新的可复用模式（新的通用组件、CSS 类、hook、工具函数）
- 开发者给出了新的、可复用于未来的偏好或纠正（如"以后都这样做"）
- 现有约定被有意改变，使本文档某条规则过时
- 新增了一类与"新增工具清单"不同的开发流程

**处理流程**：
1. **识别**：注意到当前做法与本文档不符或本文档未覆盖，且该做法应沉淀为规范
2. **确认**：向开发者说明"检测到新模式 X，建议加入 skill"，简述内容与归属章节，等待确认——**未经确认不写入**
3. **写入**：确认后编辑本 `SKILL.md`，更新到对应章节（新约定进对应小节，过时规则就地修正或删除），保持文档精简、不重复
4. **中间产物**：如需推敲，方案草稿放 `ai-native-tmp/`，只有最终规则进 `SKILL.md`

**边界**：只沉淀可复用于未来开发的规范；一次性的任务细节、临时状态不写入。
