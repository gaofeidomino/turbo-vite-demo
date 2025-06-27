import { createApp } from 'vue'
import UI from '@gf/ui'
import '@gf/tailwindcss'
import { vLoading } from '@gf/utils'

import App from './App.vue'

const app = createApp(App)

app.directive('loading', vLoading)
app.use(UI)
app.mount('#app')
