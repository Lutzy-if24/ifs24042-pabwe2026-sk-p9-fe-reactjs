import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useInput from './useInput.js'

describe('useInput', () => {
  it('nilai awal default string kosong', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')
  })

  it('onChange, setValue dan reset', () => {
    const { result } = renderHook(() => useInput('awal'))
    expect(result.current[0]).toBe('awal')
    act(() => result.current[1]({ target: { value: 'baru' } }))
    expect(result.current[0]).toBe('baru')
    act(() => result.current[2]())
    expect(result.current[0]).toBe('awal')
    act(() => result.current[3]('manual'))
    expect(result.current[0]).toBe('manual')
  })
})
