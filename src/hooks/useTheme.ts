import { useCallback, useSyncExternalStore } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'
const PREFS: ThemePref[] = ['system', 'light', 'dark']

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

// Resolve a preference to the concrete theme actually applied to <html>.
function resolve(pref: ThemePref): 'light' | 'dark' {
  if (pref === 'system') return darkQuery.matches ? 'dark' : 'light'
  return pref
}

function apply(pref: ThemePref) {
  document.documentElement.setAttribute('data-theme', resolve(pref))
}

const listeners = new Set<() => void>()
let pref = readPref()

function notify() {
  listeners.forEach((cb) => cb())
}

// While preference is "system", follow OS changes live.
darkQuery.addEventListener('change', () => {
  if (pref === 'system') {
    apply(pref)
    notify()
  }
})

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function setThemePref(next: ThemePref) {
  pref = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // ignore disabled storage
  }
  apply(next)
  notify()
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, () => pref, () => pref)
  const resolved = resolve(preference)
  // Advance system → light → dark → system.
  const cycle = useCallback(() => {
    const i = PREFS.indexOf(pref)
    setThemePref(PREFS[(i + 1) % PREFS.length])
  }, [])
  return { preference, resolved, setThemePref, cycle }
}
