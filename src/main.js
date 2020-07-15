// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import iView from 'iview'
import iView from 'view-design'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import axios from 'axios'
// import 'iview/dist/styles/iview.css'
import 'view-design/dist/styles/iview.css';
import particles from 'particles.js/particles'
// multi language
import VueI18n from 'vue-i18n';
import en from 'view-design/dist/locale/en-US';
import zh from 'view-design/dist/locale/zh-CN';

// 自定义lang
import myEN from './libs/lang/en-US';
import myZH  from './libs/lang/zh-CN';

import { MainRoute } from './router'
import App from './App.vue'
import store from './store'
import config from './config/config'

Vue.config.productionTip = false
Vue.use(particles)
Vue.use(Vuex)
Vue.use(VueI18n)
Vue.use(iView)
Vue.use(VueRouter)
Vue.prototype.$http = axios
/* eslint-disable no-new */
const RouterConfig = {
  // 去除前端路由中的#
  mode: 'history',
  routes: MainRoute
}

Vue.locale = () => {};
const messages = {
    'en-US': Object.assign(myEN, en),
    'zh-CN': Object.assign(myZH, zh)
};
// 在其他页面通过设置localStorage并重新加载，实现语言设置
let locale = localStorage.getItem('language')
if (locale === null) {
  locale='zh-CN'
}
const i18n = new VueI18n({
    locale: locale,  // set locale
    messages  // set locale messages
});

const router = new VueRouter(RouterConfig)

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()                                                          // 页面最上层的进度条
  let title = to.meta.title
  if (title) {
    title = config.platformname + ' - ' + title
  } else {
    title = config.platformname
  }
  window.document.title = title
  // to.name in {'about':'','test':''}
  if (to.name === 'about' || to.name === 'test') {                                  // 不需要登陆即可访问的页面
    next()
  } else if (sessionStorage.getItem('locking') === '1' && to.name !== 'locking') {  // 从锁定到其他 锁定到锁定不能适用 why？
    iView.LoadingBar.finish()
    next(false)                                                                     // 终止跳转 重置到 from 路由对应的地址
    // router.replace({name: 'login'})                                              // 跟push类似 但不会向 history 添加新记录 从而不能点浏览器的回退按钮回到之前的页面
  } else if (to.name === 'locking' && !sessionStorage.getItem('user')) {            // 存在账号才能锁定 防止没有登录就直接锁定
    iView.LoadingBar.finish()
    next(false)
  } else if (to.name === 'locking' && sessionStorage.getItem('user')) {
    next()
  } else if (!sessionStorage.getItem('hasLogin') && to.name !== 'login') {          // 未登录且前往的页面不是登录页 未登录到未登录不能适用 why？
    // iView.LoadingBar.finish()
    next({name: 'login'})
  } else {
    next()
  }
})

router.afterEach(() => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

new Vue({
  el: '#app',
  template: '<App/>',
  components: {App},
  store: store,
  router: router,
  i18n 
})
