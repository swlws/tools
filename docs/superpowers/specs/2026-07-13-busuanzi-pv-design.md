# 首页 PV/UV 统计（不蒜子）设计

## 目标

在首页底部展示全站访问量（site_pv）与访客数（site_uv），一行小字。工具页不受影响，不引入全局页脚，不破坏「无全局滚动」铁律。

## 隐私取舍

不蒜子是第三方服务，会向 `busuanzi.ibruce.info` 发 JSONP 请求上报访问信息，与工程「纯本地、数据不离开浏览器」定位有张力。已与开发者确认：仍用不蒜子。PV/UV 是聚合的访问计数，不涉及用户在工具内输入的数据，工具本身仍纯本地运行。

## SPA + HashRouter 下的关键坑

不蒜子机制：脚本加载时发一次 JSONP 请求，回调时用 `getElementById` 找 `busuanzi_value_site_pv` / `busuanzi_value_site_uv` 写入数字。SPA 下两个问题：

1. 若脚本在目标 `<span>` 挂载前完成回调，数字写不进去。
2. 首页组件随路由切换卸载/重建，脚本只在 index.html 加载一次的话，二次进首页拿不到数字。

## 方案

不在 index.html 静态引脚本。新建 `src/components/BusuanziStats.tsx`，只在首页渲染：

- 组件先渲染两个带固定 id 的 `<span>`（`busuanzi_value_site_pv`、`busuanzi_value_site_uv`），初始占位 `…`
- `useEffect` 中动态注入不蒜子脚本（`//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js`），确保 span 已在 DOM 后再拉取回填
- 每次挂载重新注入脚本，触发重新拉取，保证二次进首页数字仍显示
- 卸载时清理注入的 script 标签
- 脚本失败（网络/被拦截）时容错：保持占位，不报错、不破坏布局

文案：`本站访问量 <span pv> 次 · 访客 <span uv> 人`

站点 site_pv/site_uv 是服务端全站累计，「只在首页计数」不影响其准确性。

## 接入点

`src/pages/Home.tsx` 的 `.home-body` 末尾、非搜索态时渲染 `<BusuanziStats />`（在 `groups.map` 之后）。

## 样式

`src/App.css` 加 `/* ===== Busuanzi Stats ===== */` 分区，一律用设计变量：弱化文字色、`--space-*` 间距、小字号，居中，置于内容流底部。

## 不做

- 不加全局页脚
- 不改无全局滚动铁律
- 不动 SEO 三处（PV 与 SEO 无关）
- 不统计当前页（HashRouter 下 page_pv 不准）

## 验证

- `npm run build` 通过
- `npm run dev` 目视：首页底部显示 PV/UV；切到工具页无残留；回首页数字仍在
