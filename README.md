# Delcom Blog — Frontend (ReactJS + Vite)

SPA multi-tier untuk backend Delcom Blog (Golang Gin, port 8081): React 19, Vite, Tailwind CSS 4,
Toast UI Editor/Viewer, SweetAlert2, Tabler Icons. Routing manual dengan `history.pushState` + `popstate`
(tanpa react-router) sehingga refresh peramban tetap di rute yang sama.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5174  (proxy /api -> http://localhost:8081)
```
Jalankan backend lebih dulu (`go run cmd/server/main.go`). Akun seeder: `admin/admin`, `member/member`.

## Pengujian

```bash
npm test           # Vitest + coverage v8, threshold 100% (statements, branches, functions, lines)
npm run build      # build produksi ke dist/ (siap dideploy ke Vercel/Netlify/S3)
```

## Rute

| Path | Komponen | Akses |
|---|---|---|
| `/` , `/public` | PublicArticleList | Publik |
| `/posts/:slug` | PublicArticleDetail | Publik |
| `/author` | AuthorDashboard | Login |
| `/admin` | AdminDashboard | Admin (member dialihkan ke `/author`) |
| `/login`, `/register` | AuthPage | Publik (yang sudah login dialihkan) |

Sesi kedaluwarsa (401 dari server) menghapus sesi dan mengalihkan ke `/login` lewat event `auth:expired`.

## Struktur

```
src/
  main.jsx  App.jsx  routes.js  index.css  setupTests.js
  components/   Link, KebabMenu, MarkdownEditor, MarkdownViewer
  helpers/      apiHelper (fetch + Bearer + envelope), toolsHelper (SweetAlert2, formatDate)
  hooks/        useInput, useTheme (terang/gelap + aksen warna)
  features/
    auth/   api/authApi · components/AuthForm, AuthPage · modals/AuthModal
    blog/   api/blogApi · components/StickyNavbar, PublicArticleList, PublicArticleDetail,
            AuthorDashboard, PostStats · modals/PostModal, AiPostGeneratorModal
    admin/  api/adminApi · components/AdminDashboard
```

`AuthForm` adalah form login/registrasi bersama yang dipakai `AuthPage` dan `AuthModal`; id wajib
`login-username`, `login-password`, `login-submit` ada di keduanya.
