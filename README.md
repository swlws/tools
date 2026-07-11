# 开发者工具箱

常用的前端与开发辅助工具集合,无需登录、纯本地运行(数据不离开浏览器)。

在线访问:<https://swlws.github.io/tools/>

## 功能

| 工具 | 说明 |
| --- | --- |
| Markdown + Mermaid 编辑器 | 实时预览 Markdown,支持 Mermaid 图表渲染与 SVG / PNG 导出 |
| JSON 可视化工具 | 格式化、压缩、树形查看,自动修复单引号、尾逗号、注释等非标准格式 |
| 文本对比 | 基于 Monaco 的并排 Diff,高亮显示两段文本 / 代码的差异 |
| 时间戳工具 | Unix 时间戳与日期互转、实时时间显示、时区切换、时间差计算 |

## 技术栈

- React 19 + TypeScript
- Vite 6 构建
- react-router-dom(HashRouter)
- Monaco Editor(文本对比)、Mermaid(图表)、react-markdown

## 本地开发

```bash
npm install
npm run dev      # 启动开发服务器
```

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查并打包到 `dist/` |
| `npm run preview` | 本地预览打包产物 |
| `npm run lint` | 运行 ESLint |

## 部署

推送到 `master` 分支后,GitHub Actions 会自动构建并发布到 GitHub Pages(工作流见 `.github/workflows/deploy.yml`)。

首次部署需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

> 站点作为项目页发布在 `/tools/` 路径下,对应 `vite.config.ts` 中的 `base: '/tools/'`。
