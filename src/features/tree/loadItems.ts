import type { TreeItem } from './TreeStore'

export interface Item extends TreeItem {
  label: string
}

export async function loadItems(): Promise<Item[]> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const response = await fetch('/items.json')
  return response.json() as Promise<Item[]>
}
