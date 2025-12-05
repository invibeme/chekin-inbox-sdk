import {vi} from 'vitest';

Object.defineProperty(window, 'postMessage', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
    href: 'https://example.com/test',
  },
  writable: true,
});
