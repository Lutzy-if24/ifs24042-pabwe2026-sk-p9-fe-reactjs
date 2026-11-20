import { useCallback, useEffect, useState } from 'react'
import { IconPlus, IconSparkles } from '@tabler/icons-react'
import KebabMenu from '../../../components/KebabMenu.jsx'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper.js'
import { deletePost, EMPTY_POST, getMyPost, getStats, listMyPosts, togglePublish } from '../api/blogApi.js'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal.jsx'
import PostModal from '../modals/PostModal.jsx'
import PostStats from './PostStats.jsx'

const NO_STATS = { total: 0, total_published: 0, total_draft: 0 }

/** Ruang kerja penulis (full width): statistik, tabel artikel, menu kebab, toggle terbit dan AI Generator. */
export default function AuthorDashboard({ navigate, dark }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(NO_STATS)
  const [filter, setFilter] = useState('all')
  const [loaded, setLoaded] = useState(false)
  const [modalPost, setModalPost] = useState(null)
  const [aiOpen, setAiOpen] = useState(false)

  const reload = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([listMyPosts(), getStats()])
      setPosts(list)
      setStats(summary)
    } catch (err) {
      showErrorAlert(err.message)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const guarded = async (action) => {
    try {
      await action()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const onToggle = (p) =>
    guarded(async () => {
      await togglePublish(p.id)
      await reload()
    })

  const onEdit = (p) => guarded(async () => setModalPost(await getMyPost(p.id)))

  const onDelete = async (p) => {
    if (!(await showConfirmDialog(`Hapus artikel "${p.title}"?`))) return
    await guarded(async () => {
      await deletePost(p.id)
      showSuccessAlert('Artikel berhasil dihapus')
      await reload()
    })
  }

  const visible = posts.filter((p) => filter === 'all' || p.is_published === (filter === 'published'))

  const menuItems = (p) => [
    ...(p.is_published ? [{ label: 'Lihat', onClick: () => navigate(`/posts/${p.slug}`) }] : []),
    { label: 'Ubah', onClick: () => onEdit(p) },
    { label: 'Hapus', onClick: () => onDelete(p), danger: true },
  ]

  let rows
  if (!loaded) {
    rows = <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-600">Memuat artikel…</td></tr>
  } else if (visible.length === 0) {
    rows = <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-600">Belum ada artikel.</td></tr>
  } else {
    rows = visible.map((p) => (
      <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
        <td className="px-4 py-3 font-medium">{p.title}</td>
        <td className="px-4 py-3">{p.category}</td>
        <td className="px-4 py-3">
          <button
            type="button"
            role="switch"
            aria-checked={p.is_published}
            aria-label={`Terbitkan ${p.title}`}
            onClick={() => onToggle(p)}
            className={`relative h-6 w-11 rounded-full transition ${p.is_published ? 'bg-[var(--accent)]' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${p.is_published ? 'left-5' : 'left-0.5'}`} />
          </button>
          <span className="ml-2 text-xs text-slate-600">{p.is_published ? 'Terbit' : 'Draf'}</span>
        </td>
        <td className="px-4 py-3">{formatDate(p.created_at)}</td>
        <td className="px-4 py-3">{p.reading_time} mnt</td>
        <td className="px-4 py-3 text-right">
          <KebabMenu label={`Aksi ${p.title}`} items={menuItems(p)} />
        </td>
      </tr>
    ))
  }

  return (
    <section className="w-full space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Workspace Penulis</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
          >
            <IconSparkles size={16} /> AI Generator
          </button>
          <button
            type="button"
            onClick={() => setModalPost(EMPTY_POST)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            <IconPlus size={16} /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} active={filter} onSelect={setFilter} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3">Baca</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      {modalPost && (
        <PostModal
          post={modalPost}
          dark={dark}
          onClose={() => setModalPost(null)}
          onSaved={() => {
            setModalPost(null)
            reload()
          }}
        />
      )}
      {aiOpen && (
        <AiPostGeneratorModal
          dark={dark}
          onClose={() => setAiOpen(false)}
          onApply={(draft) => {
            setAiOpen(false)
            setModalPost(draft)
          }}
        />
      )}
    </section>
  )
}
