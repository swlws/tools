import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import EditorPage from '@/pages/Editor'
import JsonToolPage from '@/pages/JsonTool'
import TextDiffPage from '@/pages/TextDiff'
import TimestampPage from '@/pages/Timestamp'
import './App.css'

function App() {
  return (
    <>
      <nav className="nav-bar">
        <span className="nav-brand">
          <span className="nav-brand-dot" />
          开发者工具箱
        </span>
        <NavLink to="/editor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Markdown 编辑器
        </NavLink>
        <NavLink to="/json" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          JSON 工具
        </NavLink>
        <NavLink to="/diff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          文本对比
        </NavLink>
        <NavLink to="/timestamp" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          时间戳工具
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/json" element={<JsonToolPage />} />
        <Route path="/diff" element={<TextDiffPage />} />
        <Route path="/timestamp" element={<TimestampPage />} />
      </Routes>
    </>
  )
}

export default App