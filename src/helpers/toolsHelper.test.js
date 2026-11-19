import { beforeEach, describe, expect, it, vi } from 'vitest'
import Swal from 'sweetalert2'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from './toolsHelper.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('formatDate', () => {
  it('mengembalikan "-" untuk nilai kosong', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
  })
  it('memformat tanggal Indonesia', () => {
    expect(formatDate('2026-03-05T10:00:00Z')).toMatch(/2026/)
  })
})

describe('alert helpers', () => {
  it('showSuccessAlert', () => {
    showSuccessAlert('ok')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'ok' }))
  })
  it('showErrorAlert', () => {
    showErrorAlert('gagal')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'gagal' }))
  })
  it('showConfirmDialog mengembalikan keputusan pengguna', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    await expect(showConfirmDialog('hapus?')).resolves.toBe(true)
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await expect(showConfirmDialog('hapus?')).resolves.toBe(false)
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ showCancelButton: true, text: 'hapus?' }))
  })
})
