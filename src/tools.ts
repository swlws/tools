export type CategoryKey = 'edit' | 'convert' | 'compare' | 'generate'

export interface Category {
  key: CategoryKey
  label: string
}

// Display order for both the nav dropdowns and the homepage sections.
// Ordered by real-world usage frequency for developers, most-used first.
export const CATEGORIES: Category[] = [
  { key: 'convert', label: '格式转换' },
  { key: 'compare', label: '对比校验' },
  { key: 'generate', label: '生成工具' },
  { key: 'edit', label: '编辑预览' },
]

export interface Tool {
  path: string
  name: string
  navLabel: string
  description: string
  keywords: string[]
  icon: string
  category: CategoryKey
}

export const TOOLS: Tool[] = [
  {
    path: '/editor',
    name: 'Markdown + Mermaid 编辑器',
    navLabel: 'Markdown 编辑器',
    description: '实时预览 Markdown,支持 Mermaid 图表渲染与 SVG/PNG 导出。',
    keywords: ['markdown', 'mermaid', '编辑器', '预览', '图表', 'svg', 'png', '导出'],
    icon: '📝',
    category: 'edit',
  },
  {
    path: '/json',
    name: 'JSON 可视化工具',
    navLabel: 'JSON 工具',
    description: '格式化、压缩、树形查看 JSON,支持自动修复单引号、尾逗号、注释等非标准格式。',
    keywords: ['json', '格式化', '压缩', '树形', '可视化', '校验', '修复'],
    icon: '{ }',
    category: 'convert',
  },
  {
    path: '/diff',
    name: '文本对比',
    navLabel: '文本对比',
    description: '并排对比两段文本或代码,高亮显示差异。',
    keywords: ['diff', '对比', '比较', '文本', '代码', '差异'],
    icon: '⇄',
    category: 'compare',
  },
  {
    path: '/timestamp',
    name: '时间戳工具',
    navLabel: '时间戳工具',
    description: 'Unix 时间戳与日期互转、实时时间显示、时区切换、时间差计算。',
    keywords: ['时间戳', 'timestamp', 'unix', '日期', '时区', '时间差', '转换'],
    icon: '🕐',
    category: 'convert',
  },
  {
    path: '/qrcode',
    name: '二维码工具',
    navLabel: '二维码',
    description: '将文本或链接生成二维码并导出 PNG/SVG,也可上传图片解析二维码内容。',
    keywords: ['二维码', 'qrcode', 'qr', '生成', '解析', '解码', '识别', '链接', 'url', 'png', 'svg', '导出'],
    icon: '▦',
    category: 'generate',
  },
  {
    path: '/base64',
    name: 'Base64 编解码',
    navLabel: 'Base64',
    description: '文本与 Base64 互转,支持中文（UTF-8),也可将本地文件转为 Base64。',
    keywords: ['base64', '编码', '解码', 'encode', 'decode', '转换', 'utf-8', '文件', 'dataurl'],
    icon: '⇄',
    category: 'convert',
  },
]

export interface ToolGroup extends Category {
  tools: Tool[]
}

// Tools grouped by category, in CATEGORIES order, skipping empty groups.
export function groupedTools(tools: Tool[] = TOOLS): ToolGroup[] {
  return CATEGORIES.map((cat) => ({
    ...cat,
    tools: tools.filter((t) => t.category === cat.key),
  })).filter((g) => g.tools.length > 0)
}
