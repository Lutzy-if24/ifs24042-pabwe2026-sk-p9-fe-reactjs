import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Editor: tab Markdown/WYSIWYG dengan pratinjau simultan dan tema gelap. */
export default function MarkdownEditor({ value, onChange, dark, height }) {
  const hostRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: hostRef.current,
      height,
      initialValue: value,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: dark ? 'dark' : 'light',
      usageStatistics: false,
      events: { change: () => onChangeRef.current(editor.getMarkdown()) },
    })
    editorRef.current = editor
    return () => editor.destroy()
    // editor dibuat ulang hanya bila tema/tinggi berubah; isi disinkronkan oleh efek di bawah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, height])

  useEffect(() => {
    if (editorRef.current.getMarkdown() !== value) editorRef.current.setMarkdown(value)
  }, [value])

  return <div ref={hostRef} data-testid="markdown-editor" />
}
