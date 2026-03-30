import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null) // { title, body }
  const timerRef = useRef(null)

  const showToast = useCallback((title, body) => {
    clearTimeout(timerRef.current)
    setToast({ title, body })
    timerRef.current = setTimeout(() => setToast(null), 4200)
  }, [])

  return { toast, showToast }
}
