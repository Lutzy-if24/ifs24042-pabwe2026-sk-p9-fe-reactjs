import { useEffect, useState } from 'react'
import { IconArrowLeft, IconClock } from '@tabler/icons-react'
import Link from '../../../components/Link.jsx'
import MarkdownViewer from '../../../components/MarkdownViewer.jsx'
import { formatDate } from '../../../helpers/toolsHelper.js'
import { getPublicPost } from '../api/blogApi.js'

/** Halaman baca artikel (layout full width) dengan render Markdown interaktif. */
export default function PublicArticleDetail({ slug, navigate, dark }) {
  const [state, setState] = useState({ post: null, error: '' })

  useEffect(() => {
    let cancelled = false
    setState({ post: null, error: '' })
    getPublicPost(slug)
      .then(
        (post) => ({ post, error: '' }),
        (err) => ({ post: null, error: err.message }),
      )
      .then((next) => {
        if (!cancelled) setState(next)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const back = (
    <Link to="/" navigate={navigate} className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline">
      <IconArrowLeft size={16} /> Kembali ke beranda
    </Link>
  )

  if (state.error) {
    return (
      <section className="w-full px-4 py-10 md:px-10">
        {back}
        <h1 className="mb-3 text-2xl font-extrabold">Artikel tidak dapat dimuat</h1>
        <p role="alert" className="text-red-600">{state.error}</p>
      </section>
    )
  }
  if (!state.post) {
    return <h1 className="px-4 py-10 text-center text-base font-normal text-slate-600">Memuat artikel…</h1>
  }

  const { post } = state
  return (
    <article className="w-full px-4 py-10 md:px-10">
      {back}
      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
        {post.category}
      </span>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{post.title}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        <span>Oleh {post.author.username}</span>
        <span>{formatDate(post.published_at)}</span>
        <span className="inline-flex items-center gap-1">
          <IconClock size={14} /> {post.reading_time} menit baca
        </span>
      </p>
      {post.cover_image_path && (
        <img src={post.cover_image_path} alt={post.title} className="mt-6 max-h-[28rem] w-full rounded-2xl object-cover" />
      )}
      <div className="mt-8">
        <MarkdownViewer content={post.content} dark={dark} />
      </div>
    </article>
  )
}