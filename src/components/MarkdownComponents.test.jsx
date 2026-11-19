import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MarkdownEditor from './MarkdownEditor.jsx'
import MarkdownViewer from './MarkdownViewer.jsx'

describe('MarkdownViewer', () => {
  it('merender markdown menjadi HTML', async () => {
    render(<MarkdownViewer content={'# Judul Besar\n\nIsi **tebal**'} dark={false} />)
    await waitFor(() => expect(screen.getByText('Judul Besar')).toBeInTheDocument())
    expect(screen.getByText('tebal').tagName).toBe('STRONG')
  })

  it('merender ulang saat konten/tema berubah dan membersihkan HTML berbahaya', async () => {
    const { rerender } = render(<MarkdownViewer content="awal" dark={false} />)
    rerender(<MarkdownViewer content={'baru <script>window.hacked=1</script>'} dark />)
    await waitFor(() => expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('baru'))
    expect(window.hacked).toBeUndefined()
  })
})

describe('MarkdownEditor', () => {
  it('menampilkan editor dengan nilai awal dan memanggil onChange saat teks berubah', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<MarkdownEditor value="halo" onChange={onChange} dark={false} height="300px" />)
    await waitFor(() => expect(document.querySelector('.toastui-editor-defaultUI')).toBeInTheDocument())

    // perubahan nilai dari luar disinkronkan ke editor -> memicu event change
    rerender(<MarkdownEditor value="diubah dari luar" onChange={onChange} dark={false} height="300px" />)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('diubah dari luar'))

    // nilai sama tidak memicu setMarkdown lagi
    const calls = onChange.mock.calls.length
    rerender(<MarkdownEditor value="diubah dari luar" onChange={onChange} dark={false} height="300px" />)
    expect(onChange.mock.calls.length).toBe(calls)
  })

  it('dibuat ulang dengan tema gelap', async () => {
    const { rerender } = render(<MarkdownEditor value="x" onChange={() => {}} dark={false} height="200px" />)
    rerender(<MarkdownEditor value="x" onChange={() => {}} dark height="200px" />)
    await waitFor(() => expect(document.querySelector('.toastui-editor-dark')).toBeInTheDocument())
  })
})
