import { useEffect, useState } from 'react'
import { formatDate, showErrorAlert } from '../../../helpers/toolsHelper.js'
import { listAllPosts, listUserPosts, listUsers } from '../api/adminApi.js'

const sum = (items, key) => items.reduce((total, item) => total + item[key], 0)

/** Panel admin (full width): ringkasan pengguna, direktori pengguna dan arsip seluruh artikel. */
export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [u, p] = await Promise.all([listUsers(), listAllPosts()])
        setUsers(u)
        setAllPosts(p)
      } catch (err) {
        showErrorAlert(err.message)
      } finally {
        setLoaded(true)
      }
    })()
  }, [])

  const selectUser = async (u) => {
    try {
      setUserPosts(await listUserPosts(u.id))
      setSelected(u)
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const archive = selected ? userPosts : allPosts
  const cards = [
    { label: 'Total Pengguna', value: users.length },
    { label: 'Total Artikel', value: sum(users, 'total_posts') },
    { label: 'Total Terbit', value: sum(users, 'total_published') },
  ]

  const empty = (cols, text) => (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-slate-600">{text}</td>
    </tr>
  )

  return (
    <section className="w-full space-y-8 px-4 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold">Panel Administrasi</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Direktori Pengguna</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Artikel</th>
                <th className="px-4 py-3">Terbit</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!loaded && empty(7, 'Memuat pengguna…')}
              {loaded && users.length === 0 && empty(7, 'Belum ada pengguna.')}
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.total_posts}</td>
                  <td className="px-4 py-3">{u.total_published}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`Lihat artikel ${u.username}`}
                      onClick={() => selectUser(u)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                    >
                      Lihat artikel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{selected ? `Artikel ${selected.username}` : 'Arsip Seluruh Artikel'}</h2>
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="text-sm font-medium text-[var(--accent)] hover:underline">
              Tampilkan semua
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Penulis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {archive.length === 0 && empty(5, 'Belum ada artikel.')}
              {archive.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{p.author.username}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.is_published ? 'Terbit' : 'Draf'}</td>
                  <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
