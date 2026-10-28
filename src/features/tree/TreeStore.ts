export type TreeId = string | number

export interface TreeItem {
  id: TreeId
  parent: TreeId | null
}

export class TreeStore<T extends TreeItem> {
  private items: T[] = []
  private readonly itemsById = new Map<TreeId, T>()
  private readonly indexById = new Map<TreeId, number>()
  private readonly parentById = new Map<TreeId, TreeId | null>()
  private readonly childrenById = new Map<TreeId, T[]>()

  constructor(items: T[] = []) {
    this.setItems(items)
  }

  getAll(): T[] {
    return this.items
  }

  getItem(id: TreeId): T | undefined {
    return this.itemsById.get(id)
  }

  getChildren(id: TreeId): T[] {
    return this.childrenById.get(id) ?? []
  }

  getAllChildren(id: TreeId): T[] {
    if (!this.itemsById.has(id)) {
      return []
    }

    const result: T[] = []
    const visited = new Set<TreeId>([id])
    const stack = [...(this.childrenById.get(id) ?? [])].reverse()

    while (stack.length) {
      const item = stack.pop()!

      if (visited.has(item.id)) {
        continue
      }

      visited.add(item.id)
      result.push(item)

      const children = this.childrenById.get(item.id)

      if (!children) {
        continue
      }

      for (let index = children.length - 1; index >= 0; index--) {
        stack.push(children[index])
      }
    }

    return result
  }

  getAllParents(id: TreeId): T[] {
    const result: T[] = []
    const visited = new Set<TreeId>()
    let item = this.itemsById.get(id)

    while (item && !visited.has(item.id)) {
      result.push(item)
      visited.add(item.id)

      const parentId = this.parentById.get(item.id)

      if (parentId == null) {
        break
      }

      item = this.itemsById.get(parentId)
    }

    return result
  }

  setItems(items: T[]): void {
    this.items = items.slice()
    this.itemsById.clear()
    this.indexById.clear()
    this.parentById.clear()
    this.childrenById.clear()

    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index]
      this.itemsById.set(item.id, item)
      this.indexById.set(item.id, index)
      this.parentById.set(item.id, item.parent)

      if (item.parent === null) {
        continue
      }

      const siblings = this.childrenById.get(item.parent)

      if (siblings) {
        siblings.push(item)
      } else {
        this.childrenById.set(item.parent, [item])
      }
    }
  }

  addItem(item: T): void {
    if (this.itemsById.has(item.id)) {
      this.updateItem(item)
      return
    }

    if (this.wouldCreateCycle(item.id, item.parent)) {
      throw new RangeError('TreeStore items cannot form a cycle')
    }

    this.indexById.set(item.id, this.items.length)
    this.itemsById.set(item.id, item)
    this.parentById.set(item.id, item.parent)
    this.items.push(item)
    this.addChild(item.parent, item)
  }

  removeItem(id: TreeId): void {
    const item = this.itemsById.get(id)

    if (!item) {
      return
    }

    this.removeChild(this.parentById.get(id)!, id)

    const removedIds = new Set<TreeId>()
    const stack = [id]

    while (stack.length) {
      const currentId = stack.pop()!

      if (removedIds.has(currentId)) {
        continue
      }

      removedIds.add(currentId)

      const children = this.childrenById.get(currentId)

      if (!children) {
        continue
      }

      for (const child of children) {
        stack.push(child.id)
      }
    }

    for (const removedId of removedIds) {
      this.itemsById.delete(removedId)
      this.indexById.delete(removedId)
      this.parentById.delete(removedId)
      this.childrenById.delete(removedId)
    }

    this.items = this.items.filter((current) => !removedIds.has(current.id))

    for (let index = 0; index < this.items.length; index++) {
      this.indexById.set(this.items[index].id, index)
    }
  }

  updateItem(item: T): void {
    const index = this.indexById.get(item.id)

    if (index === undefined) {
      return
    }

    const previousParent = this.parentById.get(item.id)!

    if (previousParent !== item.parent) {
      if (this.wouldCreateCycle(item.id, item.parent)) {
        if (this.items[index] === item) {
          item.parent = previousParent
        }

        throw new RangeError('TreeStore items cannot form a cycle')
      }

      this.removeChild(previousParent, item.id)
      this.addChild(item.parent, item)
    } else {
      const siblings = item.parent === null ? undefined : this.childrenById.get(item.parent)
      const siblingIndex = siblings?.findIndex((sibling) => Object.is(sibling.id, item.id))

      if (siblings && siblingIndex !== undefined && siblingIndex >= 0) {
        siblings[siblingIndex] = item
      }
    }

    this.items[index] = item
    this.itemsById.set(item.id, item)
    this.parentById.set(item.id, item.parent)
  }

  private addChild(parent: TreeId | null, item: T): void {
    if (parent === null) {
      return
    }

    const children = this.childrenById.get(parent)

    if (children) {
      children.push(item)
    } else {
      this.childrenById.set(parent, [item])
    }
  }

  private wouldCreateCycle(id: TreeId, parent: TreeId | null): boolean {
    const visited = new Set<TreeId>()
    let current = parent

    while (current !== null) {
      if (Object.is(current, id) || (current === 0 && id === 0)) {
        return true
      }

      if (visited.has(current)) {
        return false
      }

      visited.add(current)
      current = this.parentById.get(current) ?? null
    }

    return false
  }

  private removeChild(parent: TreeId | null, childId: TreeId): void {
    if (parent === null) {
      return
    }

    const children = this.childrenById.get(parent)

    if (!children) {
      return
    }

    const index = children.findIndex((child) => Object.is(child.id, childId))

    if (index < 0) {
      return
    }

    children.splice(index, 1)

    if (children.length === 0) {
      this.childrenById.delete(parent)
    }
  }
}
