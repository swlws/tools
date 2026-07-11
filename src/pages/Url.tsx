import { useState, useMemo, useCallback } from 'react'
import { useSeo } from '@/hooks/useSeo'
import { TOOLS } from '@/tools'
import CopyButton from '@/components/CopyButton'
import Button from '@/components/Button'
import ToggleGroup from '@/components/ToggleGroup'

const TOOL = TOOLS.find((t) => t.path === '/url')!

type Mode = 'encode' | 'decode'

const SAMPLE_TEXT = 'https://example.com/搜索?q=开发者工具箱&lang=zh CN'

export default function UrlPage() {
  useSeo(TOOL.name, TOOL.description)
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState(SAMPLE_TEXT)

  const { output, error } = useMemo(() => {
    if (input === '') return { output: '', error: '' }
    try {
      return {
        output: mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input),
        error: '',
      }
    } catch {
      return { output: '', error: mode === 'encode' ? '编码失败' : '不是有效的 URL 编码' }
    }
  }, [input, mode])

  const handleSwap = useCallback(() => {
    if (output && !error) setInput(output)
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'))
  }, [output, error])

  const handleClear = useCallback(() => {
    setInput('')
  }, [])

  const placeholder =
    mode === 'encode' ? '输入文本后显示编码结果' : '输入 URL 编码后显示原文'

  return (
    <div className="page url-page">
      <header className="page-header">
        <h1 className="page-title">{TOOL.name}</h1>
        <div className="header-actions">
          <ToggleGroup
            value={mode}
            onChange={setMode}
            options={[
              { value: 'encode', label: '编码' },
              { value: 'decode', label: '解码' },
            ]}
          />
          <Button onClick={handleSwap}>交换</Button>
          <Button onClick={handleClear}>清空</Button>
        </div>
      </header>

      <div className="url-body">
        <section className="url-pane">
          <div className="pane-header">
            <span className="pane-label">{mode === 'encode' ? '原文' : 'URL 编码'}</span>
          </div>
          <textarea
            className="url-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本' : '输入要解码的 URL 编码'}
            spellCheck={false}
          />
        </section>

        <section className="url-pane">
          <div className="pane-header">
            <span className="pane-label">结果</span>
            {error && <span className="error-badge">{error}</span>}
          </div>
          <div className="url-output">
            {output === '' ? (
              <p className="error-hint">{error ? '' : placeholder}</p>
            ) : (
              <>
                <textarea
                  className="url-textarea"
                  value={output}
                  readOnly
                  spellCheck={false}
                />
                <div className="url-output-actions">
                  <CopyButton text={output} />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
