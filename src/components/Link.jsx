/** Tautan SPA: mencegah reload halaman dan menavigasi lewat history.pushState. */
export default function Link({ to, navigate, children, ...rest }) {
  const onClick = (e) => {
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}
