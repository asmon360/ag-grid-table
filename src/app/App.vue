<template>
  <main class="page">
    <div
      v-if="isLoading"
      class="loading"
      role="status"
      aria-live="polite"
    >
      <span
        class="spinner"
        aria-hidden="true"
      ></span>

      <span>Загрузка данных</span>
    </div>

    <TreeGrid
      v-else
      :items="items"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import TreeGrid from '@/features/tree/TreeGrid.vue'
import { loadItems, type Item } from '@/features/tree/loadItems'
import { TreeStore } from '@/features/tree/TreeStore'

const store = new TreeStore<Item>()
const items = shallowRef<Item[]>(store.getAll())

const isLoading = ref(true)

onMounted(async () => {
  const loadedItems = await loadItems()

  store.setItems(loadedItems)
  items.value = store.getAll()

  isLoading.value = false
})
</script>
