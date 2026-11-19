import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// matchMedia (dipakai useTheme dan Toast UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Canvas tidak tersedia di JSDOM
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  measureText: () => ({ width: 0 }),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
}))

// Seleksi & Range yang dibutuhkan ProseMirror (Toast UI WYSIWYG)
const fakeSelection = () => ({
  anchorNode: null,
  anchorOffset: 0,
  focusNode: null,
  focusOffset: 0,
  rangeCount: 0,
  isCollapsed: true,
  type: 'None',
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  getRangeAt: vi.fn(),
  collapse: vi.fn(),
  collapseToStart: vi.fn(),
  collapseToEnd: vi.fn(),
  extend: vi.fn(),
  setBaseAndExtent: vi.fn(),
  selectAllChildren: vi.fn(),
  containsNode: vi.fn(() => false),
  toString: () => '',
})
document.getSelection = window.getSelection = fakeSelection
Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
Range.prototype.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: [][Symbol.iterator] })
Element.prototype.scrollIntoView = vi.fn()

afterEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  delete document.documentElement.dataset.accent
})
