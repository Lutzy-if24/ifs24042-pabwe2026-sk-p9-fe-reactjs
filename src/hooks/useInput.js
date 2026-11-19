import { useCallback, useState } from 'react'

/** State input dua arah: const [value, onChange, reset, setValue] = useInput('') */
export default function useInput(initial = '') {
  const [value, setValue] = useState(initial)
  const onChange = useCallback((e) => setValue(e.target.value), [])
  const reset = useCallback(() => setValue(initial), [initial])
  return [value, onChange, reset, setValue]
}
