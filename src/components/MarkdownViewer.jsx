import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Viewer: merender Markdown (dengan sanitasi HTML bawaan) secara responsif. */
export default function MarkdownViewer({ content, dark }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const viewer = new Viewer({
      el: hostRef.current,
      initialValue: content,
      theme: dark ? 'dark' : 'light',
      usageStatistics: false,
    })
    return () => viewer.destroy()
  }, [content, dark])

  return <div ref={hostRef} data-testid="markdown-viewer" />
}
