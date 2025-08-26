"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debouncing callbacks
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay],
  )

  return debouncedCallback
}

/**
 * Custom hook for debounced validation
 * Useful for form fields that need real-time validation
 * @param value - The value to validate
 * @param validate - The validation function
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns Object with validation result and loading state
 */
export function useDebouncedValidation<T>(
  value: T,
  validate: (value: T) => Promise<string | null> | string | null,
  delay: number = 300,
) {
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    if (!debouncedValue) {
      setError(null)
      setIsValidating(false)
      return
    }

    setIsValidating(true)

    const validateAsync = async () => {
      try {
        const result = await validate(debouncedValue)
        setError(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Validation error")
      } finally {
        setIsValidating(false)
      }
    }

    validateAsync()
  }, [debouncedValue, validate])

  return { error, isValidating }
}
