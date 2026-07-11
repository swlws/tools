import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'tool-usage-counts'

type Counts = Record<string, number>

function read(): Counts {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Counts) : {}
  } catch {
    return {}
  }
}

const listeners = new Set<() => void>()
let snapshot = read()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return snapshot
}

// Record one open of a tool by path, persisting the incremented count and
// notifying subscribers so the homepage re-ranks without a reload.
export function recordToolUse(path: string) {
  const next = { ...read(), [path]: (read()[path] ?? 0) + 1 }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / disabled storage
  }
  snapshot = next
  listeners.forEach((cb) => cb())
}

export function useToolUsage() {
  const counts = useSyncExternalStore(subscribe, getSnapshot, () => ({}) as Counts)
  const record = useCallback((path: string) => recordToolUse(path), [])
  return { counts, record }
}
