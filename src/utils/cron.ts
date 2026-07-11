/**
 * 原生 cron 表达式解析与执行时间预测。
 * 支持 5 段（分 时 日 月 周）与 6 段（秒 分 时 日 月 周）两种格式，自动识别段数。
 * 语法：`*`、`,`（列表）、`-`（区间）、`/`（步长，含 `*​/n` 与 `a-b/n`）、具体数字。
 */

export interface CronField {
  /** 该字段命中的值（升序去重） */
  values: number[]
  /** 命中值集合，便于 O(1) 查询 */
  set: Set<number>
  /** 原始文本是否为 `*`（用于日/周的"或"关系判断） */
  isWildcard: boolean
}

export interface ParsedCron {
  /** 段数：5 或 6 */
  length: 5 | 6
  second: CronField | null // 6 段时存在，5 段时为 null（视为每 0 秒）
  minute: CronField
  hour: CronField
  dayOfMonth: CronField
  month: CronField
  dayOfWeek: CronField
}

export interface CronParseResult {
  ok: boolean
  parsed?: ParsedCron
  /** 出错时的中文提示 */
  error?: string
}

interface FieldSpec {
  label: string
  min: number
  max: number
}

// 字段范围定义（按 6 段顺序，5 段时跳过秒）
const SPEC_SECOND: FieldSpec = { label: '秒', min: 0, max: 59 }
const SPEC_MINUTE: FieldSpec = { label: '分', min: 0, max: 59 }
const SPEC_HOUR: FieldSpec = { label: '时', min: 0, max: 23 }
const SPEC_DOM: FieldSpec = { label: '日', min: 1, max: 31 }
const SPEC_MONTH: FieldSpec = { label: '月', min: 1, max: 12 }
// 周：0-6，0=周日。为兼容常见写法，也允许 7 表示周日。
const SPEC_DOW: FieldSpec = { label: '周', min: 0, max: 7 }

const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const MONTH_NAMES = [
  '',
  '1 月',
  '2 月',
  '3 月',
  '4 月',
  '5 月',
  '6 月',
  '7 月',
  '8 月',
  '9 月',
  '10 月',
  '11 月',
  '12 月',
]

/** 解析单个字段文本 → CronField，失败抛出带中文说明的 Error */
function parseField(raw: string, spec: FieldSpec): CronField {
  const text = raw.trim()
  if (text === '') {
    throw new Error(`「${spec.label}」字段为空`)
  }

  const isWildcard = text === '*'
  const set = new Set<number>()

  // 逗号分隔的每一项各自解析后取并集
  for (const part of text.split(',')) {
    const item = part.trim()
    if (item === '') {
      throw new Error(`「${spec.label}」字段存在空的列表项`)
    }
    parsePart(item, spec, set)
  }

  const values = [...set].sort((a, b) => a - b)
  if (values.length === 0) {
    throw new Error(`「${spec.label}」字段无有效取值`)
  }
  return { values, set, isWildcard }
}

/** 解析单项（可能是 * / a-b / a-b/n / *​/n / 数字），写入 set */
function parsePart(item: string, spec: FieldSpec, set: Set<number>) {
  let rangePart = item
  let step = 1

  // 处理步长 `/n`
  const slashIdx = item.indexOf('/')
  if (slashIdx !== -1) {
    rangePart = item.slice(0, slashIdx).trim()
    const stepStr = item.slice(slashIdx + 1).trim()
    if (!/^\d+$/.test(stepStr)) {
      throw new Error(`「${spec.label}」字段步长「${stepStr}」不是正整数`)
    }
    step = Number(stepStr)
    if (step <= 0) {
      throw new Error(`「${spec.label}」字段步长必须大于 0`)
    }
  }

  let start: number
  let end: number

  if (rangePart === '*') {
    start = spec.min
    end = spec.max
  } else if (rangePart.includes('-')) {
    const [aStr, bStr, ...extra] = rangePart.split('-')
    if (extra.length > 0) {
      throw new Error(`「${spec.label}」字段区间「${rangePart}」格式非法`)
    }
    start = parseNumber(aStr, spec)
    end = parseNumber(bStr, spec)
    if (start > end) {
      throw new Error(
        `「${spec.label}」字段区间「${rangePart}」起点大于终点`,
      )
    }
  } else {
    // 单个数字
    const n = parseNumber(rangePart, spec)
    if (slashIdx !== -1) {
      // 形如 `5/10`：从 5 起，每隔 10，直到 max
      start = n
      end = spec.max
    } else {
      set.add(normalize(n, spec))
      return
    }
  }

  for (let v = start; v <= end; v += step) {
    set.add(normalize(v, spec))
  }
}

/** 校验并解析单个数字取值 */
function parseNumber(str: string, spec: FieldSpec): number {
  const t = str.trim()
  if (!/^\d+$/.test(t)) {
    throw new Error(`「${spec.label}」字段取值「${str}」不是数字`)
  }
  const n = Number(t)
  if (n < spec.min || n > spec.max) {
    throw new Error(
      `「${spec.label}」字段取值 ${n} 超出范围（${spec.min}-${spec.max}）`,
    )
  }
  return n
}

/** 归一化：周字段的 7 折算为 0（周日） */
function normalize(n: number, spec: FieldSpec): number {
  if (spec.label === '周' && n === 7) return 0
  return n
}

/** 解析完整 cron 表达式 */
export function parseCron(expr: string): CronParseResult {
  const trimmed = expr.trim()
  if (trimmed === '') {
    return { ok: false, error: '表达式为空' }
  }
  const segments = trimmed.split(/\s+/)
  if (segments.length !== 5 && segments.length !== 6) {
    return {
      ok: false,
      error: `段数应为 5 或 6，当前为 ${segments.length} 段`,
    }
  }

  try {
    if (segments.length === 6) {
      const [sec, min, hour, dom, mon, dow] = segments
      return {
        ok: true,
        parsed: {
          length: 6,
          second: parseField(sec, SPEC_SECOND),
          minute: parseField(min, SPEC_MINUTE),
          hour: parseField(hour, SPEC_HOUR),
          dayOfMonth: parseField(dom, SPEC_DOM),
          month: parseField(mon, SPEC_MONTH),
          dayOfWeek: parseField(dow, SPEC_DOW),
        },
      }
    }
    const [min, hour, dom, mon, dow] = segments
    return {
      ok: true,
      parsed: {
        length: 5,
        second: null,
        minute: parseField(min, SPEC_MINUTE),
        hour: parseField(hour, SPEC_HOUR),
        dayOfMonth: parseField(dom, SPEC_DOM),
        month: parseField(mon, SPEC_MONTH),
        dayOfWeek: parseField(dow, SPEC_DOW),
      },
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 判断某个 Date 是否命中解析结果 */
function matches(parsed: ParsedCron, d: Date): boolean {
  if (!parsed.minute.set.has(d.getMinutes())) return false
  if (!parsed.hour.set.has(d.getHours())) return false
  if (!parsed.month.set.has(d.getMonth() + 1)) return false
  if (parsed.second && !parsed.second.set.has(d.getSeconds())) return false

  const domHit = parsed.dayOfMonth.set.has(d.getDate())
  const dowHit = parsed.dayOfWeek.set.has(d.getDay())

  // Vixie cron：日与周都非 * 时取"或"，否则都需命中。
  if (!parsed.dayOfMonth.isWildcard && !parsed.dayOfWeek.isWildcard) {
    return domHit || dowHit
  }
  return domHit && dowHit
}

export interface NextRunResult {
  /** 命中的时间点（本地时间字符串） */
  times: string[]
  /** 是否因达到扫描上限而提前结束 */
  reachedLimit: boolean
}

/**
 * 计算未来 count 次执行时间。
 * 6 段按秒推进，5 段按分钟推进；从 from 的下一个时间单位起扫描。
 * 给定扫描步数上限防止死循环（约 5 年）。
 */
export function nextRuns(
  parsed: ParsedCron,
  count = 5,
  from: Date = new Date(),
): NextRunResult {
  const times: string[] = []
  const stepSec = parsed.length === 6

  // 从下一个时间单位起，并清零更细粒度
  const cursor = new Date(from.getTime())
  cursor.setMilliseconds(0)
  if (stepSec) {
    cursor.setSeconds(cursor.getSeconds() + 1)
  } else {
    cursor.setSeconds(0)
    cursor.setMinutes(cursor.getMinutes() + 1)
  }

  // 扫描上限：约 5 年。按秒推进时上限更大。
  const maxSteps = stepSec ? 5 * 366 * 24 * 60 * 60 : 5 * 366 * 24 * 60
  let steps = 0

  while (times.length < count && steps < maxSteps) {
    if (matches(parsed, cursor)) {
      times.push(formatLocal(cursor))
    }
    if (stepSec) {
      cursor.setSeconds(cursor.getSeconds() + 1)
    } else {
      cursor.setMinutes(cursor.getMinutes() + 1)
    }
    steps++
  }

  return { times, reachedLimit: times.length < count }
}

/** 本地时间格式化：YYYY-MM-DD HH:mm:ss（含星期） */
export function formatLocal(d: Date): string {
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return `${date} ${time} ${WEEK_NAMES[d.getDay()]}`
}

/** 描述单个字段（复杂时逐字段回退用） */
function describeField(field: CronField, spec: FieldSpec): string {
  if (field.isWildcard) return `每${spec.label}`
  if (field.values.length === 1) return `${field.values[0]}`
  return field.values.join(', ')
}

/** 判断字段是否为"每隔 n"形式（从 min 起等间隔覆盖到接近 max） */
function detectStep(field: CronField, spec: FieldSpec): number | null {
  if (field.isWildcard) return null
  if (field.values.length < 2) return null
  const first = field.values[0]
  if (first !== spec.min) return null
  const step = field.values[1] - field.values[0]
  if (step <= 0) return null
  for (let i = 1; i < field.values.length; i++) {
    if (field.values[i] - field.values[i - 1] !== step) return null
  }
  // 末尾应接近 max（下一个间隔会越界）
  if (field.values[field.values.length - 1] + step <= spec.max) return null
  return step
}

/**
 * 生成中文可读描述。覆盖常见组合，复杂组合退化为逐字段描述。
 */
export function describeCron(parsed: ParsedCron): string {
  const { second, minute, hour, dayOfMonth, month, dayOfWeek } = parsed

  // 收集"时刻"部分（时:分[:秒]），仅当时、分（、秒）都为单值时给出明确时刻
  const singleMinute = !minute.isWildcard && minute.values.length === 1
  const singleHour = !hour.isWildcard && hour.values.length === 1
  const singleSecond = second ? !second.isWildcard && second.values.length === 1 : true

  const parts: string[] = []

  // ── 频率部分（秒/分/时的步长优先）──
  const secStep = second ? detectStep(second, SPEC_SECOND) : null
  const minStep = detectStep(minute, SPEC_MINUTE)
  const hourStep = detectStep(hour, SPEC_HOUR)

  let frequency = ''

  if (second && second.isWildcard && minute.isWildcard && hour.isWildcard) {
    frequency = '每秒'
  } else if (secStep && minute.isWildcard) {
    frequency = `每 ${secStep} 秒`
  } else if (
    (second === null || (second.isWildcard || (second.values.length === 1 && second.values[0] === 0))) &&
    minute.isWildcard &&
    hour.isWildcard
  ) {
    frequency = '每分钟'
  } else if (minStep) {
    frequency = `每 ${minStep} 分钟`
  } else if (singleMinute && hour.isWildcard) {
    frequency = `每小时的第 ${minute.values[0]} 分钟`
  } else if (hourStep && singleMinute) {
    frequency = `每 ${hourStep} 小时的第 ${minute.values[0]} 分钟`
  }

  // ── 明确时刻（时:分[:秒]都是单值）──
  let timeOfDay = ''
  if (singleHour && singleMinute && (second === null || singleSecond)) {
    const secPart =
      second && second.values.length === 1 && second.values[0] !== 0
        ? `:${pad(second.values[0])}`
        : ''
    timeOfDay = `${pad(hour.values[0])}:${pad(minute.values[0])}${secPart}`
  }

  // ── 日期范围部分（月/日/周）──
  const scopeParts: string[] = []

  // 周
  if (!dayOfWeek.isWildcard) {
    if (dayOfWeek.values.length === 1) {
      scopeParts.push(`每${WEEK_NAMES[dayOfWeek.values[0]]}`)
    } else {
      scopeParts.push(`每周的 ${dayOfWeek.values.map((v) => WEEK_NAMES[v]).join('、')}`)
    }
  }

  // 日（当周为 * 时才作为主日期描述，否则并列）
  if (!dayOfMonth.isWildcard) {
    if (dayOfMonth.values.length === 1) {
      scopeParts.push(`每月 ${dayOfMonth.values[0]} 日`)
    } else {
      const domStep = detectStep(dayOfMonth, SPEC_DOM)
      if (domStep) {
        scopeParts.push(`每隔 ${domStep} 天`)
      } else {
        scopeParts.push(`每月的 ${dayOfMonth.values.join('、')} 日`)
      }
    }
  }

  // 月
  if (!month.isWildcard) {
    if (month.values.length === 1) {
      scopeParts.push(MONTH_NAMES[month.values[0]])
    } else {
      scopeParts.push(month.values.map((v) => MONTH_NAMES[v]).join('、'))
    }
  }

  // ── 组装 ──
  // 场景 1：有明确时刻
  if (timeOfDay) {
    if (scopeParts.length === 0) {
      parts.push(`每天 ${timeOfDay}`)
    } else {
      parts.push(`${scopeParts.join('、')} ${timeOfDay}`)
    }
    return parts.join('')
  }

  // 场景 2：有频率描述
  if (frequency) {
    if (scopeParts.length === 0) return frequency
    return `${scopeParts.join('、')}，${frequency}`
  }

  // 场景 3：退化为逐字段描述
  const lines: string[] = []
  if (second) lines.push(`秒：${describeField(second, SPEC_SECOND)}`)
  lines.push(`分：${describeField(minute, SPEC_MINUTE)}`)
  lines.push(`时：${describeField(hour, SPEC_HOUR)}`)
  lines.push(`日：${describeField(dayOfMonth, SPEC_DOM)}`)
  lines.push(`月：${describeField(month, SPEC_MONTH)}`)
  lines.push(
    `周：${
      dayOfWeek.isWildcard
        ? '每周'
        : dayOfWeek.values.map((v) => WEEK_NAMES[v]).join('、')
    }`,
  )
  return lines.join('；')
}
