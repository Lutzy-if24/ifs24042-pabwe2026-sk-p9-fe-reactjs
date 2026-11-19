import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor.jsx'
import useInput from '../../../hooks/useInput.js'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper.js'
import { CATEGORIES, createPost, updatePost } from '../api/blogApi.js'

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-slate-600 dark:bg-slate-800'

/** Modal layar penuh tambah/ubah artikel; header & footer berwarna kontras, tombol di kanan footer. */
export default function PostModal({ post, dark, onClose, onSaved }) {
  const isEdit = Boolean(post.id)
  const [title, onTitle] = useInput(post.title)
  const [category, onCategory] = useInput(post.category)
  const [excerpt, onExcerpt] = useInput(post.excerpt)
  const [cover, onCover] = useInput(post.cover_image_path)
  const [content, setContent] = useState(post.content)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi')
      return
    }
    setError('')
    setSaving(true)
    const payload = { title: title.trim(), category, excerpt, content, cover_image_path: cover }
    try {
      if (isEdit) {
        await updatePost(post.id, payload)
      } else {
        await createPost({ ...payload, is_published: published })
      }
      showSuccessAlert(isEdit ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dibuat')
      onSaved()
    } catch (err) {
      showErrorAlert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2" role="dialog" aria-modal="true">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? 'Ubah Artikel' : 'Tambah Artikel'}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded p-1 hover:bg-white/20">
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="post-title" className="mb-1 block text-sm font-medium">Judul</label>
              <input id="post-title" value={title} onChange={onTitle} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="post-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="post-category" value={category} onChange={onCategory} className={fieldClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">Ringkasan (excerpt)</label>
              <textarea id="post-excerpt" rows={2} value={excerpt} onChange={onExcerpt} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="post-cover" className="mb-1 block text-sm font-medium">URL Gambar Sampul</label>
              <input id="post-cover" value={cover} onChange={onCover} placeholder="https://…" className={fieldClass} />
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Konten (Markdown)</span>
            <MarkdownEditor value={content} onChange={setContent} dark={dark} height="52vh" />
          </div>
          {!isEdit && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Terbitkan langsung
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-slate-100 px-6 py-4 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white dark:border-slate-600 dark:hover:bg-slate-700">
            Batal
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
