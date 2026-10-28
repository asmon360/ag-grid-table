import { describe, expect, it } from 'vitest'
import { TreeStore, type TreeItem } from './TreeStore'
import { toGridRows } from './treeRows'

describe('toGridRows', () => {
  it('adds tree ids and categories without conflating numeric and string ids', () => {
    const store = new TreeStore([
      { id: 1, parent: null, label: 'Numeric root' },
      { id: '1', parent: null, label: 'String root' },
      { id: 'child', parent: 1, label: 'Child' },
    ] satisfies (TreeItem & { label: string })[])

    expect(toGridRows(store.getAll())).toEqual([
      {
        id: 1,
        parent: null,
        label: 'Numeric root',
        gridId: 'number:1',
        gridParentId: null,
        category: 'Группа',
      },
      {
        id: '1',
        parent: null,
        label: 'String root',
        gridId: 'string:1',
        gridParentId: null,
        category: 'Элемент',
      },
      {
        id: 'child',
        parent: 1,
        label: 'Child',
        gridId: 'string:child',
        gridParentId: 'number:1',
        category: 'Элемент',
      },
    ])
  })
})
