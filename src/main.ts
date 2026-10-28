import { createApp } from 'vue'
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import './style.css'
import App from './app/App.vue'

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule])

createApp(App).mount('#app')
