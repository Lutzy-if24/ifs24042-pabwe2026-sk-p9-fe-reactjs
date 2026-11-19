import Swal from 'sweetalert2'

export const formatDate = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const showSuccessAlert = (message) =>
  Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })

export const showErrorAlert = (message) => Swal.fire({ icon: 'error', title: 'Gagal', text: message })

export const showConfirmDialog = async (text) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Apakah Anda yakin?',
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  })
  return result.isConfirmed
}
