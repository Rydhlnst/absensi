"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { apiClient } from "@/lib/api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setData: (data: T | null) => void
}

export function useApi<T = unknown>(
  path: string | null,
  params?: Record<string, string | number | boolean | undefined | null>
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!path)
  const [error, setError] = useState<string | null>(null)
  const paramsRef = useRef(params)

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  const fetchData = useCallback(async () => {
    if (!path) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.get<T>(path, paramsRef.current)
      setData(result)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memuat data"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    const id = requestAnimationFrame(() => fetchData())
    return () => cancelAnimationFrame(id)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, setData }
}

export function useApiAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async <T = unknown>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (e: unknown) {
      if (mountedRef.current) {
        const message = e instanceof Error ? e.message : "Gagal memuat data"
        setError(message)
      }
      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  return { loading, error, execute }
}
