import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import EditorPage from '@/pages/Editor'
import JsonToolPage from '@/pages/JsonTool'
import './App.css'

function App() {
  return (
    <>
      <nav className="nav-bar">
        <NavLink to="/editor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Markdown 编辑器
        </NavLink>
        <NavLink to="/json" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          JSON 工具
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/json" element={<JsonToolPage />} />
      </Routes>
    </>
  )
}

export default App