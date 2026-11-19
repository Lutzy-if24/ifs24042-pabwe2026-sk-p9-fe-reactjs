import { useEffect, useState } from 'react'
import { IconClock, IconSearch } from '@tabler/icons-react'
import Link from '../../../components/Link.jsx'
import useInput from '../../../hooks/useInput.js'
import { formatDate } from '../../../helpers/toolsHelper.js'
import { CATEGORIES, listPublicPosts } from '../api/blogApi.js'

const PILLS = ['Semua', ...CATEGORIES]

/** Beranda publik: galeri artikel dengan pencarian langsung dan filter kategori berbentuk pill. */
export default function PublicArticleList({ navigate }) {
  const [q, onQ] = useInput()
  const [category, setCategory] = useState('Semua')
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const r = await listPublicPosts({ q, category }).then(
        (data) => ({ data }),
        (err) => ({ err }),
      )
      if (cancelled) return
      if (r.err) {
        setError(r.err.message)
      } else {
        setError('')
        setPosts(r.data)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [q, category])

  let body
  if (error) {
    body = <p role="alert" className="py-12 text-center text-red-600">{error}</p>
  } else if (posts === null) {
    body = <p className="py-12 text-center text-slate-500">Memuat artikel…</p>
  } else if (posts.length === 0) {
    body = <p className="py-12 text-center text-slate-500">Belum ada artikel yang cocok.</p>
  } else {
    body = (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            {p.cover_image_path && <img src={p.cover_image_path} alt={p.title} className="h-44 w-full object-cover" />}
            <div className="flex flex-1 flex-col p-5">
              <span className="mb-2 w-fit rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                {p.category}
              </span>
              <h2 className="text-lg font-bold leading-snug">
                <Link to={`/posts/${p.slug}`} navigate={navigate} className="hover:text-[var(--accent)]">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{p.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {p.author.username} · {formatDate(p.published_at)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconClock size={14} /> {p.reading_time} menit baca
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-[96rem] px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold">Artikel Terbaru</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Bacaan pilihan dari para penulis Delcom Blog.</p>
      </div>

      <div className="mx-auto mb-5 flex max-w-xl items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
        <IconSearch size={18} className="text-slate-400" />
        <input
          type="search"
          value={q}
          onChange={onQ}
          placeholder="Cari artikel…"
          aria-label="Cari artikel"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori">
        {PILLS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === c
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-slate-300 hover:border-[var(--accent)] dark:border-slate-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {body}
    </section>
  )
}
