import Vue from 'vue'
import Vuex from 'vuex'
//
import { appRouter, orderList, myexec, home } from './router'
// import util from './libs/util'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    menuList: appRouter,
    newRouter: [...appRouter, orderList, myexec],
    currentPageName: home.children[0].name,
    currentPath: [home],
    pageOpenedList: JSON.parse(JSON.stringify(home.children))
  },
  mutations: {
    clearAllTags (state) {
      state.pageOpenedList.splice(1)               // 删除 从1到结尾 列表从0开始 即剩第一个
      state.currentPath.splice(1)
    },
    clearOtherTags (state, vm) {
      let currentName = vm.$route.name
      let currentIndex = 0
      state.pageOpenedList.forEach((item, index) => {
        if (item.name === currentName) {
          currentIndex = index
        }
      })
      if (currentIndex === 0) {
        state.pageOpenedList.splice(1)
      } else {
        state.pageOpenedList.splice(currentIndex + 1)        // 移除匹配之后 顺序不能反
        state.pageOpenedList.splice(1, currentIndex - 1)     // 移除匹配之前 顺序不能反
      }
    },
    removeTag (state, name) {
      state.pageOpenedList.map((item, index) => {
        if (item.name === name) {
          state.pageOpenedList.splice(index, 1)     // 只移除一个
        }
      })
    },
    setTag (state, name) {
      store.commit('removeTag', name);
      state.newRouter.forEach((val) => {
        for (let i of val.children) {
            if (i.name === name) {
              state.pageOpenedList.push({
                title: i.title,
                name: name
              })
            }
          }
        })
      state.currentPageName = name;
    },
    setBreadcrumb (state, name) {
      state.currentPath.splice(1, state.currentPath.length - 1)
      state.newRouter.forEach((val) => {
        for (let i of val.children) {
          if (i.name === name) {
            state.currentPath.push({
              'title': val.title,
              'path': val.path,
              'name': val.name
            }, {
              'title': i.title,
              'path': `${val.path}/${i.path}`,
              'name': i.name
            })
          }
        }
      })
    },
    setTagBreadBeforeOpen (state, name) {
      store.commit('setBreadcrumb', name);
      store.commit('setTag', name);
    },
    storeSet(state, kv){
      state[kv[0]] = kv[1]
    },
    sessionSet(state, kv){
      sessionStorage.setItem([kv[0]], kv[1])
    }
  },
  getters: {
    storeGet: (state) => (key) => {
      return state[key]
    },
    sessionGet: (state) => (key) => {
      return sessionStorage.getItem(key)
    }
  }
})

export default store
