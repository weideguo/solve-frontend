import { createApp } from 'vue'
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
import { router } from './router'
import App from './App.vue'
import { pinia } from './store'

// 为什需要在这里import？在页面中import则会出现Prism找不到？
import Prism from 'prismjs'


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
// router.beforeEach((to, from, next) => {
router.beforeEach((to, from) => {
  iView.LoadingBar.start()
  
  let title = to.meta.title
  if (title) {
    title = `${window.SITE_CONFIG.platformname} - ${title}`
  } else {
    title = window.SITE_CONFIG.platformname
  }
  window.document.title = title


  if (['about', 'login', 'test'].includes(to.name)) {
    return true 
  } else if (sessionStorage.getItem('locking') === '1') {
    return { name: 'locking' }
  } else if (to.name === 'locking' && !sessionStorage.getItem('user')) {
    return { name: 'login' }
  } else if (to.name === 'locking' && sessionStorage.getItem('user')) {
    return true
  } else if (!sessionStorage.getItem('hasLogin')) {
    return { name: 'login' }
  } else {
    return true
  }
})

router.afterEach(() => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

// 国际化配置
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
  legacy: false, 
  globalInjection: true,
  messages
})

// 设置 View UI Plus 的语言
iviewLocale(messages[_locale])

// 全局变量与 SessionStorage
const languageList = [
  { 'name': 'zh-CN', 'value': '中文' },
  { 'name': 'en-US', 'value': 'English' }
]
sessionStorage.setItem('languageList', JSON.stringify(languageList))

// 初始化 Vue 应用
const app = createApp(App)

// 使用插件
app.use(iView)
app.use(router)
app.use(pinia)
app.use(i18n)

// 挂载应用
app.mount('#app')