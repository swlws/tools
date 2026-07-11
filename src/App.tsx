import { Routes, Route, NavLink } from 'react-router-dom'
import HomePage from '@/pages/Home'
import EditorPage from '@/pages/Editor'
import JsonToolPage from '@/pages/JsonTool'
import TextDiffPage from '@/pages/TextDiff'
import TimestampPage from '@/pages/Timestamp'
import Logo from '@/components/Logo'
import { TOOLS } from '@/tools'
import './App.css'

function App() {
  return (
    <>
      <nav className="nav-bar">
        <NavLink to="/" className="nav-brand">
          <Logo size={22} idSuffix="nav" />
          开发者工具箱
        </NavLink>
        {TOOLS.map((tool) => (
          <NavLink
            key={tool.path}
            to={tool.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {tool.navLabel}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/json" element={<JsonToolPage />} />
        <Route path="/diff" element={<TextDiffPage />} />
        <Route path="/timestamp" element={<TimestampPage />} />
      </Routes>
    </>
  )
}

export default App
