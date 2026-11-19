import { screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

vi.mock('./App.jsx', () => ({ default: () => <h1>app-root</h1> }))

it('me-render App ke elemen #root', async () => {
  document.body.innerHTML = '<div id="root"></div>'
  await import('./main.jsx')
  expect(await screen.findByRole('heading', { name: 'app-root' })).toBeInTheDocument()
})
