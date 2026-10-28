import { describe, expect, it } from 'vitest'
import { TreeStore, type TreeItem } from './TreeStore'

type Item = TreeItem & { label: string }

const items: Item[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: '91064cef', parent: 1, label: 'Item 2' },
  { id: 3, parent: 1, label: 'Item 3' },
  { id: 4, parent: '91064cef', label: 'Item 4' },
  { id: 5, parent: '91064cef', label: 'Item 5' },
  { id: 6, parent: '91064cef', label: 'Item 6' },
  { id: 7, parent: 4, label: 'Item 7' },
  { id: 8, parent: 4, label: 'Item 8' },
]

describe('TreeStore', () => {
  it('returns all items and retrieves mixed string and number ids', () => {
    const store = new TreeStore(items)

    expect(store.getAll()).toEqual(items)
    expect(store.getItem(1)).toBe(items[0])
    expect(store.getItem('91064cef')).toBe(items[1])
    expect(store.getItem('1')).toBeUndefined()
  })

  it('returns direct children in their original order', () => {
    const store = new TreeStore(items)

    expect(store.getChildren(1)).toEqual([items[1], items[2]])
    expect(store.getChildren(4)).toEqual([items[6], items[7]])
    expect(store.getChildren(7)).toEqual([])
    expect(store.getChildren(999)).toEqual([])
  })

  it('links items when children appear before their parents in the source array', () => {
    const child: Item = { id: 'child', parent: 'root', label: 'Child' }
    const root: Item = { id: 'root', parent: null, label: 'Root' }
    const sibling: Item = { id: 2, parent: 'root', label: 'Sibling' }
    const store = new TreeStore([child, root, sibling])

    expect(store.getChildren('root')).toEqual([child, sibling])
    expect(store.getAllParents('child')).toEqual([child, root])
  })

  it('returns all descendants in depth-first order', () => {
    const store = new TreeStore(items)

    expect(store.getAllChildren(1)).toEqual([items[1], items[3], items[6], items[7], items[4], items[5], items[2]])
    expect(store.getAllChildren(7)).toEqual([])
  })

  it('returns the item-to-root path including the item itself', () => {
    const store = new TreeStore(items)

    expect(store.getAllParents(7)).toEqual([items[6], items[3], items[1], items[0]])
    expect(store.getAllParents(1)).toEqual([items[0]])
    expect(store.getAllParents(999)).toEqual([])
  })

  it('replaces the full collection and updates indexed items', () => {
    const store = new TreeStore(items)
    const replacement: Item[] = [
      { id: 'root', parent: null, label: 'New root' },
      { id: 'child', parent: 'root', label: 'New child' },
    ]

    store.setItems(replacement)
    expect(store.getAll()).toEqual(replacement)
    expect(store.getItem(1)).toBeUndefined()

    const updated = { ...replacement[1], label: 'Updated child' }
    store.updateItem(updated)
    expect(store.getItem('child')).toBe(updated)
    expect(store.getChildren('root')).toEqual([updated])
  })

  it('moves updated items between parents and adds new items', () => {
    const store = new TreeStore(items)
    const moved = { ...items[2], parent: 4 }

    store.updateItem(moved)
    expect(store.getChildren(1)).toEqual([items[1]])
    expect(store.getChildren(4)).toEqual([items[6], items[7], moved])

    const added: Item = { id: 'new', parent: 4, label: 'New item' }
    store.addItem(added)
    expect(store.getItem('new')).toBe(added)
    expect(store.getChildren(4)).toEqual([items[6], items[7], moved, added])
  })

  it('rejects updates that would make an item its own descendant', () => {
    const testItems = items.map((item) => ({ ...item }))
    const store = new TreeStore(testItems)
    const cyclicRoot = store.getItem(1)!
    cyclicRoot.parent = 7

    expect(() => store.updateItem(cyclicRoot)).toThrow(RangeError)
    expect(cyclicRoot.parent).toBeNull()
    expect(store.getChildren(7)).toEqual([])
  })

  it('rejects adding an item that closes a cycle through an existing orphan', () => {
    const orphan: Item = { id: 'orphan', parent: 'new-root', label: 'Orphan' }
    const store = new TreeStore([orphan])

    expect(() => store.addItem({ id: 'new-root', parent: 'orphan', label: 'New root' })).toThrow(RangeError)
    expect(store.getItem('new-root')).toBeUndefined()
  })

  it('returns unique descendants and terminates when initial data contains a cycle', () => {
    const cyclicItems: Item[] = [
      { id: 'a', parent: 'b', label: 'A' },
      { id: 'b', parent: 'a', label: 'B' },
    ]
    const store = new TreeStore(cyclicItems)

    expect(store.getAllChildren('a')).toEqual([cyclicItems[1]])
  })

  it('updates the parent index when an existing item object is mutated in place', () => {
    const testItems = items.map((item) => ({ ...item }))
    const store = new TreeStore(testItems)
    const moved = store.getItem(3)!
    moved.parent = 4

    store.updateItem(moved)

    expect(store.getChildren(1)).toEqual([testItems[1]])
    expect(store.getChildren(4)).toEqual([testItems[6], testItems[7], moved])
    expect(store.getAllParents(3)).toEqual([moved, testItems[3], testItems[1], testItems[0]])
  })

  it('removes an item and every descendant while preserving unrelated items', () => {
    const store = new TreeStore(items)

    store.removeItem('91064cef')

    expect(store.getAll()).toEqual([items[0], items[2]])
    expect(store.getChildren(1)).toEqual([items[2]])
    expect(store.getItem(4)).toBeUndefined()
    expect(store.getAllChildren(1)).toEqual([items[2]])
  })

  it('handles deeply nested trees without recursive traversal', () => {
    const deepItems: Item[] = Array.from({ length: 12_000 }, (_, index) => ({
      id: index,
      parent: index === 0 ? null : index - 1,
      label: `Item ${index}`,
    }))
    const store = new TreeStore(deepItems)

    expect(store.getAllChildren(0)).toHaveLength(deepItems.length - 1)
    expect(store.getAllParents(deepItems.length - 1)).toHaveLength(deepItems.length)
  })
})
