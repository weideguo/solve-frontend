import { defineStore,createPinia } from 'pinia'
import { ref, computed } from 'vue'
import { appRouter, orderDetail, execDetail, home } from './router'

const pinia = createPinia()

const useAppStore = defineStore('app', () => {
  // 1. State (响应式数据)
  const menuList = ref(appRouter)
  const newRouter = ref([...appRouter, orderDetail, execDetail])
  const currentPageName = ref(home.children[0].name)
  const currentPath = ref([home])
  const pageOpenedList = ref(JSON.parse(JSON.stringify(home.children)))
  
  const dynamicData = ref({}) 

  // 2. Getters 
  const storeGet = computed(() => (key) => {
    return dynamicData.value[key]
  })
  
  // 3. Actions 
  
  // 清空所有标签
  const clearAllTags = () => {
    pageOpenedList.value.splice(1)
    currentPath.value.splice(1)
  }

  // 清空其他标签
  const clearOtherTags = (currentName) => {
    let currentIndex = 0
    
    pageOpenedList.value.forEach((item, index) => {
      if (item.name === currentName) {
        currentIndex = index
      }
    })

    if (currentIndex === 0) {
      pageOpenedList.value.splice(1)
    } else {
      pageOpenedList.value.splice(currentIndex + 1)
      pageOpenedList.value.splice(1, currentIndex - 1)
    }
  }

  // 移除单个标签
  const removeTag = (name) => {
    const index = pageOpenedList.value.findIndex(item => item.name === name)
    if (index !== -1) {
        pageOpenedList.value.splice(index, 1)
    }
  }

  // 设置标签
  const setTag = (name) => {
    // 先移除（防止重复）
    removeTag(name)
    
    newRouter.value.forEach((val) => {
      for (let i of val.children) {
        if (i.name === name) {
          pageOpenedList.value.push({
            title: i.title,
            name: name
          })
        }
      }
    })
    currentPageName.value = name
  }

  // 设置面包屑
  const setBreadcrumb = (name) => {
    // 保留第一个，删除后面的
    currentPath.value.splice(1, currentPath.value.length - 1)
    
    newRouter.value.forEach((val) => {
      for (let i of val.children) {
        if (i.name === name) {
          currentPath.value.push(
            {
              'title': val.title,
              'path': val.path,
              'name': val.name
            }, 
            {
              'title': i.title,
              'path': `${val.path}/${i.path}`,
              'name': i.name
            }
          )
        }
      }
    })
  }

  // 组合操作：设置标签和面包屑
  const setTagBreadBeforeOpen = (name) => {
    setBreadcrumb(name)
    setTag(name)
  }

  // 通用设置 State
  const storeSet = (kv) => {
    // kv[0] 是 key, kv[1] 是 value
    // 动态修改 ref 的值
    let key = kv[0]
    let value = kv[1]
    dynamicData.value[key] = value
  }


  // 4. 返回给组件使用
  return {
    // State
    menuList,
    newRouter,
    currentPageName,
    currentPath,
    pageOpenedList,
    // Getters
    storeGet,
    // Actions
    clearAllTags,
    clearOtherTags,
    removeTag,
    setTag,
    setBreadcrumb,
    setTagBreadBeforeOpen,
    storeSet
  }
})


export { pinia, useAppStore }
