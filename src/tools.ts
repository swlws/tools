export interface Tool {
  path: string
  name: string
  navLabel: string
  description: string
  keywords: string[]
  icon: string
}

export const TOOLS: Tool[] = [
  {
    path: '/editor',
    name: 'Markdown + Mermaid 编辑器',
    navLabel: 'Markdown 编辑器',
    description: '实时预览 Markdown,支持 Mermaid 图表渲染与 SVG/PNG 导出。',
    keywords: ['markdown', 'mermaid', '编辑器', '预览', '图表', 'svg', 'png', '导出'],
    icon: '📝',
  },
  {
    path: '/json',
    name: 'JSON 可视化工具',
    navLabel: 'JSON 工具',
    description: '格式化、压缩、树形查看 JSON,支持自动修复单引号、尾逗号、注释等非标准格式。',
    keywords: ['json', '格式化', '压缩', '树形', '可视化', '校验', '修复'],
    icon: '{ }',
  },
  {
    path: '/diff',
    name: '文本对比',
    navLabel: '文本对比',
    description: '并排对比两段文本或代码,高亮显示差异。',
    keywords: ['diff', '对比', '比较', '文本', '代码', '差异'],
    icon: '⇄',
  },
  {
    path: '/timestamp',
    name: '时间戳工具',
    navLabel: '时间戳工具',
    description: 'Unix 时间戳与日期互转、实时时间显示、时区切换、时间差计算。',
    keywords: ['时间戳', 'timestamp', 'unix', '日期', '时区', '时间差', '转换'],
    icon: '🕐',
  },
  {
    path: '/qrcode',
    name: '二维码工具',
    navLabel: '二维码',
    description: '将文本或链接生成二维码并导出 PNG/SVG,也可上传图片解析二维码内容。',
    keywords: ['二维码', 'qrcode', 'qr', '生成', '解析', '解码', '识别', '链接', 'url', 'png', 'svg', '导出'],
    icon: '▦',
  },
]
