"use client"
import { useState, useEffect, useRef } from "react"
export function useCounter(end: number, duration = 2000): number {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  useEffect(() => {
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const prog = Math.min((ts - startRef.current) / duration, 1)
      setCount(Math.floor(prog * end))
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    return () => { startRef.current = null }
  }, [end, duration])
  return count
}
