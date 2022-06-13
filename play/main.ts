import { createApp } from 'vue'
import '//at.alicdn.com/t/font_3186874_xpvv6829cfi.js'
import '@element-plus/theme-chalk/src/index.scss'
import * as el from 'element-plus'
;(async () => {
  const apps = import.meta.glob('./src/*.vue')
  const name = location.pathname.replace(/^\//, '') || 'App'
  const file = apps[`./src/${name}.vue`]
  if (!file) {
    location.pathname = 'App'
    return
  }
  const App = (await file()).default
  const app = createApp(App)
  app.use(el)

  app.mount('#play')
})()
