<template>
  <section
    class="table-card"
    aria-label="Дерево элементов"
  >
    <AgGridVue
      class="tree-grid"
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :get-row-id="getRowId"
      :tree-data="true"
      tree-data-display-type="custom"
      tree-data-parent-id-field="gridParentId"
      :row-height="79"
      :header-height="80"
      :animate-rows="false"
      :suppress-cell-focus="true"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, GetRowIdParams } from 'ag-grid-community'
import type { Item } from './loadItems'
import { toGridRows, type GridTreeRow } from './treeRows'

type GridRow = GridTreeRow<Item>

const props = defineProps<{ items: Item[] }>()

const rowData = computed(() => toGridRows(props.items))

const columnDefs: ColDef<GridRow>[] = [
  {
    headerName: '№ п\\п',
    colId: 'rowNumber',
    width: 110,
    sortable: false,
    valueGetter: (params) => (params.node?.rowIndex ?? -1) + 1,
  },
  {
    headerName: 'Категория',
    field: 'category',
    minWidth: 490,
    showRowGroup: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: { suppressCount: true },
    sortable: false,
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
    sortable: false,
  },
]

const defaultColDef: ColDef<GridRow> = {
  resizable: false,
  suppressHeaderMenuButton: true,
}

const getRowId = (params: GetRowIdParams<GridRow>) => {
  return params.data.gridId
}
</script>

<style scoped>
.table-card {
  height: calc(100vh - 40px);
  min-height: 360px;
  margin: 20px;
  overflow: hidden;
  border-radius: 6px;
  background: #fff;
}

.tree-grid {
  width: 100%;
  height: 100%;
  --ag-font-family: Arial, Helvetica, sans-serif;
  --ag-font-size: 20px;
  --ag-foreground-color: #4c4c4c;
  --ag-background-color: #fff;
  --ag-header-background-color: #fff;
  --ag-border-color: #c9c9c9;
  --ag-row-border-color: #c9c9c9;
  --ag-header-column-separator-display: block;
  --ag-header-column-separator-color: #c9c9c9;
  --ag-header-column-separator-height: 100%;
  --ag-cell-horizontal-padding: 16px;
}

.tree-grid :deep(.ag-header-cell-text) {
  font-weight: 700;
}

.tree-grid :deep(.ag-row-group .ag-cell) {
  font-weight: 700;
}
</style>
