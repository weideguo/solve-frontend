<style>
  .Menu span {
    color: #fffff0;
    font-weight: bold;
    margin-left: 10%;
  }
  #icon_div {
    width: 100px;
    height: 100px;
    margin-top: 10px;
    -moz-border-radius: 50%;
    -webkit-border-radius: 50%;
    border-radius: 50%;
    background:url('/public/favicon.ico') no-repeat center;
    background-size:103% 103%
  }
</style>
<template>
  <Menu width="auto" theme="dark" @on-select="currentPageTab" :active-name="currentPageName" accordion>
    <div align="center">
      <a href="/">
        <div id="icon_div"></div>
      </a>
      <br>
    </div>
    

    <template v-for="item in menuList">
      <!--处理子节点为1的-->
      <template v-if="item.children.length === 1"> 
        <MenuItem :name="item.children[0].name">
          <Icon :type="item.children[0].icon" :size="iconSize"></Icon>
          <span class="layout-text">{{ $t(item.children[0].title) }}</span>
        </MenuItem>
      </template> 
      <!--处理子节点不为1的-->
      <template v-else-if="item.children.length>1">  
        <Submenu :name="item.name" :key="item.path">
          <template #title>
            <Icon :type="item.icon" :size="iconSize"></Icon>
            <span class="layout-text">{{ $t(item.title) }}</span>
          </template>
          <MenuItem v-for="child in item.children" :key="child.name" :name="child.name" >
            <Icon :type="child.icon" :size="iconSize" :key="child.name"></Icon>
            <span class="layout-text" :key="child.name + 1">{{ $t(child.title) }}</span>
          </MenuItem>
        </Submenu>
      </template>
    </template>

    <MenuItem name="login">
      <Icon type="md-log-out" :size="iconSize"></Icon>
      <span class="layout-text">{{ $t('exit') }}</span>
    </MenuItem>
  </Menu>
</template>

<script setup>
  //
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAppStore } from '@/store'
  
  const props = defineProps({
    menuList: {
      type: Array,
      default: () => []
    },
    iconSize: {
      type: Number,
      default: 14
    }
  })
  
  const router = useRouter()
  const route = useRoute()
  const appStore = useAppStore()
  
  const currentPageName = computed(() => appStore.currentPageName)
  
  const currentPageTab = (val) => {
    router.push({ name: val })
    appStore.setTagBreadBeforeOpen(val)
  }
</script>
