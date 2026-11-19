/** Tiga kartu ringkasan statistik; kartu dapat diklik untuk memfilter tabel. */
export default function PostStats({ stats, active, onSelect }) {
  const cards = [
    { key: 'all', label: 'Total Artikel', value: stats.total },
    { key: 'published', label: 'Total Terbit', value: stats.total_published },
    { key: 'draft', label: 'Belum Selesai (Draf)', value: stats.total_draft },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          aria-pressed={active === c.key}
          onClick={() => onSelect(c.key)}
          className={`rounded-xl border p-5 text-left transition ${
            active === c.key
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-slate-900'
              : 'border-slate-200 bg-white hover:border-[var(--accent)] dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
          <p className="mt-1 text-3xl font-bold">{c.value}</p>
        </button>
      ))}
    </div>
  )
}
