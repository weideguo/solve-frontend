<style lang="less">
// vue transition-group的动画效果
.taglist-moving-animation-move {
  transition: transform 0.5s;
}
</style>

<template>
  <div>
    <div style="float:left">
      <transition-group name="taglist-moving-animation">
        <Tag type="dot" v-for="item in pageTagsList" :key="item.name" :name="item.name" @on-close="closePage"
             @click.native="linkTo(item.name)" :closable="item.name==='mainPage'?false:true"
             :color="item.children?(item.children[0].name===currentPageName?'primary':'default'):(item.name===currentPageName?'primary':'default')">
          {{ $t(item.title) }}
        </Tag>
      </transition-group>
    </div>

    <div style="float:right;margin-top:6px;">
      <Dropdown transfer @on-click="handleTagsOption">
        <Button size="small" type="primary">
          {{ $t('tag') }}
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
        <template #list>
          <DropdownMenu>
            <DropdownItem name="clearAll">{{ $t('closeAll') }}</DropdownItem>
            <DropdownItem name="clearOthers">{{ $t('closeOther') }}</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>
    </div>
    
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAppStore } from '@/store'
  
  const props = defineProps({
    pageTagsList: {
      type: Array,
      default: () => []
    }
  })
  
  const router = useRouter()
  const route = useRoute()
  const appStore = useAppStore()
  
  const currentPageName = ref(route.name)
  
  const closePage = (event, name) => {
    appStore.removeTag(name)
    if (currentPageName.value === name) {
      const lastPageName = appStore.pageOpenedList[appStore.pageOpenedList.length - 1].name
      router.push({ name: lastPageName })
      appStore.setBreadcrumb(lastPageName)
      appStore.currentPageName = lastPageName
      currentPageName.value = lastPageName
    }
  }
  
  const linkTo = (name) => {
    router.push({ name })
    appStore.setBreadcrumb(name)
    appStore.currentPageName = name
    currentPageName.value = name
  }
  
  const handleTagsOption = (type) => {
    if (type === 'clearAll') {
      appStore.clearAllTags()
      router.push({ name: appStore.pageOpenedList[0].name })
    } else {
      const currentName = route.name
      appStore.clearOtherTags(currentName)
    }
  }
  
  watch(
    () => route.name,
    (newName) => {
      currentPageName.value = newName
    }
  )
</script>