import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'
import { createI18n } from 'vue-i18n'

// UI 库
import iView from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import '../theme.less'

// 语言包
import en from 'view-ui-plus/dist/locale/en-US'
import zh from 'view-ui-plus/dist/locale/zh-CN'
import { locale as iviewLocale } from 'view-ui-plus'

import myEN from './libs/lang/en-US'
import myZH from './libs/lang/zh-CN'

// 项目文件
import { MainRoute } from './router'
import App from './App.vue'
import store from './store' 
import config from './config/config'



// ----------------------
// 1. 路由配置 (Vue Router 4)
// ----------------------
const router = createRouter({
  history: createWebHistory(), // 对应 mode: 'history'
  routes: MainRoute
})

// 重写 push 方法以处理重复导航错误
const originalPush = router.push
router.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (!['NavigationDuplicated', 'NavigationCancelled', 'Error'].includes(err.name)) {
      console.log(err.name)
      throw err
    }
    // 导航错误时不抛出错误
  })
}

// 路由守卫
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  
  let title = to.meta.title
  if (title) {
    title = `${config.platformname} - ${title}`
  } else {
    title = config.platformname
  }
  window.document.title = title


  if (['about', 'login', 'test'].includes(to.name)) {
    next()
  } else if (sessionStorage.getItem('locking') === '1') {
    next({ name: 'locking' })
  } else if (to.name === 'locking' && !sessionStorage.getItem('user')) {
    next({ name: 'login' })
  } else if (to.name === 'locking' && sessionStorage.getItem('user')) {
    next()
  } else if (!sessionStorage.getItem('hasLogin')) {
    next({ name: 'login' })
  } else {
    next()
  }
})

router.afterEach(() => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

// ----------------------
// 2. 国际化配置 (Vue I18n 9+)
// ----------------------
const messages = {
  'en-US': Object.assign(myEN, en),
  'zh-CN': Object.assign(myZH, zh)
}

let _locale = localStorage.getItem('language')
if (_locale === null) {
  _locale = 'zh-CN'
}

const i18n = createI18n({
  locale: _locale,
  legacy: false, // 使用 Composition API 模式，如果是 Options API 项目可设为 true
  globalInjection: true, // 全局注入 $t
  messages
})

// 设置 View UI Plus 的语言
iviewLocale(messages[_locale])

// ----------------------
// 3. 全局变量与 SessionStorage
// ----------------------
const languageList = [
  { 'name': 'zh-CN', 'value': '中文' },
  { 'name': 'en-US', 'value': 'english' }
]
sessionStorage.setItem('languageList', JSON.stringify(languageList))

// ----------------------
// 4. 初始化 Vue 应用
// ----------------------
const app = createApp(App)

// 使用插件
app.use(iView)
app.use(router)
app.use(store)
app.use(i18n)

// 挂载全局属性
// 如果需要使用 axios，请取消下方注释
// import axios from 'axios'
// app.config.globalProperties.$http = axios

// 挂载应用
app.mount('#app')