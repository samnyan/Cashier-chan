/// <reference types="vite/client" />

import { IDatabaseAPI } from '../electron/preload/interface'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
  database: IDatabaseAPI
}
