import type { TreeId, TreeItem } from './TreeStore'

export type GridTreeRow<T extends TreeItem> = T & {
  gridId: string
  gridParentId: string | null
  category: string
}

export function encodeTreeId(id: TreeId): string {
  return `${typeof id}:${id}`
}

export function toGridRows<T extends TreeItem>(items: T[]): GridTreeRow<T>[] {
  const parentsWithChildren = new Set<TreeId>()

  for (const item of items) {
    if (item.parent !== null) parentsWithChildren.add(item.parent)
  }

  return items.map((item) => ({
    ...item,
    gridId: encodeTreeId(item.id),
    gridParentId: item.parent === null ? null : encodeTreeId(item.parent),
    category: parentsWithChildren.has(item.id) ? 'Группа' : 'Элемент',
  }))
}
