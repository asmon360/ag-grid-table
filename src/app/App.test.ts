// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from './App.vue'

const loadedItems = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: 'child', parent: 1, label: 'Айтем 2' },
]

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows loading for two seconds, then passes loaded items to the table', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => loadedItems })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(App, {
      global: {
        stubs: {
          TreeGrid: {
            props: ['items'],
            template: '<div data-testid="tree-grid">{{ items.length }}</div>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Загрузка данных')
    expect(fetchMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1_999)
    expect(wrapper.text()).toContain('Загрузка данных')
    expect(fetchMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/items.json')
    expect(wrapper.find('[data-testid="tree-grid"]').text()).toBe('2')
    expect(wrapper.text()).not.toContain('Загрузка данных')
  })
})
