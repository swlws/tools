import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS } from '@/tools'
import { useSeo } from '@/hooks/useSeo'

export default function HomePage() {
  useSeo('首页', '开发者工具箱:Markdown 编辑器、JSON 可视化、文本对比、时间戳工具,免费在线使用。')

  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TOOLS
    return TOOLS.filter((t) =>
      [t.name, t.description, ...t.keywords].some((s) => s.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <div className="page home-page">
      <div className="home-body">
        <header className="home-hero">
          <h1 className="home-title">开发者工具箱</h1>
          <p className="home-subtitle">常用的前端与开发辅助工具,免费、无需登录、本地运行。</p>
          <input
            className="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具，如 json、markdown、时间戳…"
            spellCheck={false}
          />
        </header>

        {filtered.length > 0 ? (
          <div className="home-grid">
            {filtered.map((tool) => (
              <Link key={tool.path} to={tool.path} className="tool-card">
                <span className="tool-card-icon">{tool.icon}</span>
                <span className="tool-card-name">{tool.name}</span>
                <span className="tool-card-desc">{tool.description}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="home-empty">没有匹配「{query}」的工具</p>
        )}
      </div>
    </div>
  )
}
