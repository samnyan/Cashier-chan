import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import './style.css'

import './demos/ipc'
import { createPinia } from 'pinia'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const vuetify = createVuetify({
  components: {
    ...components,
    ...labsComponents
  },
  directives
})

app.use(vuetify)

app.mount('#app').$nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})
