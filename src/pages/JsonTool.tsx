import { useState, useMemo, useCallback } from 'react'

type ViewMode = 'formatted' | 'tree'

interface TreeNode {
  key: string
  value: unknown
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: TreeNode[]
  depth: number
}

function buildTree(data: unknown, key: string, depth: number): TreeNode {
  if (data === null || data === undefined) {
    return { key, value: data, type: 'null', depth }
  }
  if (Array.isArray(data)) {
    return {
      key,
      value: data,
      type: 'array',
      depth,
      children: data.map((item, i) => buildTree(item, String(i), depth + 1)),
    }
  }
  if (typeof data === 'object') {
    return {
      key,
      value: data,
      type: 'object',
      depth,
      children: Object.entries(data as Record<string, unknown>).map(([k, v]) =>
        buildTree(v, k, depth + 1),
      ),
    }
  }
  if (typeof data === 'boolean') return { key, value: data, type: 'boolean', depth }
  if (typeof data === 'number') return { key, value: data, type: 'number', depth }
  return { key, value: data, type: 'string', depth }
}

function typeColor(type: TreeNode['type']): string {
  const map: Record<TreeNode['type'], string> = {
    object: '#7c3aed',
    array: '#2563eb',
    string: '#059669',
    number: '#d97706',
    boolean: '#dc2626',
    null: '#6b7280',
  }
  return map[type]
}

function formatValue(value: unknown, type: TreeNode['type']): string {
  if (type === 'null') return 'null'
  if (type === 'boolean') return String(value)
  if (type === 'number') return String(value)
  if (type === 'string') return `"${String(value)}"`
  if (type === 'array') return `Array(${(value as unknown[]).length})`
  if (type === 'object') return `Object{${Object.keys(value as object).length}}`
  return String(value)
}

function TreeNodeRow({ node, defaultExpanded }: { node: TreeNode; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded && node.depth < 3)
  const isContainer = node.type === 'object' || node.type === 'array'

  return (
    <li className="tree-node">
      <div
        className="tree-row"
        style={{ paddingLeft: node.depth * 20 + 8 }}
        onClick={isContainer ? () => setExpanded((e) => !e) : undefined}
        role={isContainer ? 'button' : undefined}
        tabIndex={isContainer ? 0 : undefined}
      >
        {isContainer && (
          <span className={`tree-toggle ${expanded ? 'expanded' : ''}`}>▶</span>
        )}
        {!isContainer && <span className="tree-leaf-dot" />}
        <span className="tree-key">{node.key}</span>
        <span className="tree-colon">: </span>
        <span className="tree-value" style={{ color: typeColor(node.type) }}>
          {isContainer ? (node.type === 'object' ? `{${(node.children || []).length}}` : `[${(node.children || []).length}]`) : formatValue(node.value, node.type)}
        </span>
      </div>
      {isContainer && expanded && node.children && (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNodeRow key={child.key} node={child} defaultExpanded={defaultExpanded} />
          ))}
        </ul>
      )}
    </li>
  )
}

const SAMPLE_JSON = `{
  "name": "示例项目",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "mermaid": "^11.16.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  },
  "keywords": ["json", "visualizer", "tool"],
  "count": 42,
  "deprecated": false,
  "license": null
}`

export default function JsonToolPage() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [viewMode, setViewMode] = useState<ViewMode>('formatted')

  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(input)
      return { ok: true as const, data }
    } catch (err) {
      return { ok: false as const, error: (err as Error).message }
    }
  }, [input])

  const formatted = useMemo(() => {
    if (!parsed.ok) return ''
    return JSON.stringify(parsed.data, null, 2)
  }, [parsed])

  const minified = useMemo(() => {
    if (!parsed.ok) return ''
    return JSON.stringify(parsed.data)
  }, [parsed])

  const tree = useMemo(() => {
    if (!parsed.ok) return null
    return buildTree(parsed.data, 'root', 0)
  }, [parsed])

  const handleFormat = useCallback(() => {
    if (parsed.ok) setInput(JSON.stringify(parsed.data, null, 2))
  }, [parsed])

  const handleMinify = useCallback(() => {
    if (parsed.ok) setInput(JSON.stringify(parsed.data))
  }, [parsed])

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
  }, [])

  return (
    <div className="json-page">
      <header className="json-header">
        <h1 className="json-title">JSON 可视化工具</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleFormat} disabled={!parsed.ok}>
            格式化
          </button>
          <button className="btn btn-secondary" onClick={handleMinify} disabled={!parsed.ok}>
            压缩
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleCopy(viewMode === 'formatted' ? formatted : minified)}
            disabled={!parsed.ok}
          >
            复制结果
          </button>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'formatted' ? 'active' : ''}`}
              onClick={() => setViewMode('formatted')}
            >
              格式化
            </button>
            <button
              className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              树形
            </button>
          </div>
        </div>
      </header>

      <div className="json-body">
        <section className="json-pane">
          <div className="pane-header">
            <span className="pane-label">输入</span>
            {!parsed.ok && <span className="error-badge">解析错误</span>}
            {parsed.ok && <span className="success-badge">有效 JSON</span>}
          </div>
          <textarea
            className="json-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴 JSON 字符串..."
            spellCheck={false}
          />
        </section>

        <section className="json-pane">
          <div className="pane-header">
            <span className="pane-label">输出</span>
          </div>
          <div className="json-output">
            {!parsed.ok && (
              <div className="json-error">
                <p className="error-title">JSON 解析失败</p>
                <p className="error-msg">{parsed.error}</p>
              </div>
            )}
            {parsed.ok && viewMode === 'formatted' && (
              <pre className="json-formatted">{formatted}</pre>
            )}
            {parsed.ok && viewMode === 'tree' && tree && (
              <ul className="json-tree">
                <TreeNodeRow node={tree} defaultExpanded />
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}