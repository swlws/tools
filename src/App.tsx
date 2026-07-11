import { Routes, Route, Navigate } from 'react-router-dom'
import EditorPage from '@/pages/Editor'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/editor" replace />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}

export default App