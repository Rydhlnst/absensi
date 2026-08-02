"use client"

const PREFIX = "absensi_cache_"
const DEFAULT_TTL = 5 * 60 * 1000

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.timestamp > entry.ttl
}

export function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null

    const entry: CacheEntry<T> = JSON.parse(raw)
    if (isExpired(entry)) {
      localStorage.removeItem(PREFIX + key)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (typeof window === "undefined") return

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(PREFIX + key, JSON.stringify(entry))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function removeCache(key: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}

export function clearAllCache(): void {
  if (typeof window === "undefined") return
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}

export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const key = cacheKey || `fetch:${url}`

  const cached = getCached<T>(key)
  if (cached) {
    return cached
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }

  const data = (await res.json()) as T
  setCache(key, data, ttl)
  return data
}
