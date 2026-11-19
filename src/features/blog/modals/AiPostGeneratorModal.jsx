import { useState } from 'react'
import { IconSparkles, IconX } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer.jsx'
import useInput from '../../../hooks/useInput.js'
import { showErrorAlert } from '../../../helpers/toolsHelper.js'
import { CATEGORIES, generateWithAi } from '../api/blogApi.js'

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-slate-600 dark:bg-slate-800'

/** Modal layar penuh AI Blog Generator dengan opsi penelusuran Search Engine dan daftar sumber rujukan. */
export default function AiPostGeneratorModal({ dark, onClose, onApply }) {
  const [topic, onTopic] = useInput()
  const [category, onCategory] = useInput('')
  const [webSearch, setWebSearch] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (topic.trim().length < 3) {
      setError('Topik minimal 3 karakter')
      return
    }
    setError('')
    setLoading(true)
    try {
      setResult(await generateWithAi({ topic: topic.trim(), category, include_web_search: webSearch }))
    } catch (err) {
      showErrorAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const apply = () =>
    onApply({
      title: result.title,
      category: result.category,
      excerpt: result.excerpt,
      content: result.content,
      cover_image_path: '',
    })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2" role="dialog" aria-modal="true">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
            <IconSparkles size={20} /> AI Blog Generator
          </h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded p-1 hover:bg-white/20">
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">Topik artikel</label>
              <input id="ai-topic" value={topic} onChange={onTopic} placeholder="Mis. Dampak AI pada pendidikan tinggi" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="ai-category" value={category} onChange={onCategory} className={fieldClass}>
                <option value="">Otomatis (pilihan AI)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={webSearch} onChange={(e) => setWebSearch(e.target.checked)} />
            Sertakan penelusuran Search Engine (fakta terkini &amp; sumber rujukan)
          </label>

          {result && (
            <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
              {result.search_warning && (
                <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {result.search_warning}
                </p>
              )}
              <div>
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                  {result.category}
                </span>
                <h3 className="mt-2 text-2xl font-bold">{result.title}</h3>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{result.excerpt}</p>
              </div>
              <MarkdownViewer content={result.content} dark={dark} />
              {result.sources.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Sumber Rujukan Mesin Pencari</h4>
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {result.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-slate-100 px-6 py-4 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white dark:border-slate-600 dark:hover:bg-slate-700">
            Batal
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="rounded-lg border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)] disabled:opacity-60"
          >
            {loading ? 'Membuat artikel…' : result ? 'Buat Ulang' : 'Buat Draf'}
          </button>
          {result && (
            <button type="button" onClick={apply} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Gunakan Draf
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
