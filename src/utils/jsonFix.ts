/**
 * 尝试修复常见的无效 JSON 字符串，返回修复后的字符串。
 * 支持修复：尾逗号、单引号、无引号键、注释、undefined 值
 */
export function fixJson(input: string): string {
  let s = input.trim()

  // 1. 移除单行注释 // ...
  s = s.replace(/\/\/.*$/gm, '')
  // 2. 移除多行注释 /* ... */
  s = s.replace(/\/\*[\s\S]*?\*\//g, '')

  // 3. 将单引号字符串替换为双引号
  //    匹配 '...' 内部转义的单引号 \' 和普通内容
  s = s.replace(/'((?:[^'\\]|\\.)*)'/g, (_, content: string) => {
    // 将内部转义单引号 \' 还原为 '，转义双引号 " 为 \"
    const fixed = content
      .replace(/\\'/g, "'")
      .replace(/"/g, '\\"')
    return `"${fixed}"`
  })

  // 4. 为无引号的键加双引号
  //    匹配 {key: 或 ,key: 中的 key（key 由字母/数字/下划线/$ 组成）
  s = s.replace(/([,{]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

  // 5. 移除尾逗号（对象/数组中最后一个元素后的逗号）
  s = s.replace(/,\s*([}\]])/g, '$1')

  // 6. 将 undefined 替换为 null
  s = s.replace(/\bundefined\b/g, 'null')

  // 7. 将 NaN / Infinity 替换为 null（JSON 不支持）
  s = s.replace(/\bNaN\b/g, 'null')
  s = s.replace(/\bInfinity\b/g, 'null')

  // 8. 允许十六进制数字 → 转为十进制
  s = s.replace(/\b0x([0-9a-fA-F]+)\b/g, (_, hex: string) =>
    String(parseInt(hex, 16)),
  )

  return s
}

/** 解析 JSON，如果失败则尝试修复后再解析 */
export function parseJson(input: string): {
  data: unknown
  error: string | null
  fixed: boolean
  originalError: string | null
} {
  let originalError: string | null = null

  // 先尝试直接解析
  try {
    const data = JSON.parse(input)
    return { data, error: null, fixed: false, originalError: null }
  } catch (err) {
    originalError = (err as Error).message
  }

  // 尝试修复后解析
  const fixed = fixJson(input)
  try {
    const data = JSON.parse(fixed)
    return { data, error: null, fixed: true, originalError }
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message,
      fixed: false,
      originalError,
    }
  }
}