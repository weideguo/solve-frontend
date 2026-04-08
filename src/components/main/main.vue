<style lang="css">
  #sidebar-menu-con {
    position: fixed;
    height: 100%;
    z-index: 10000;
  }

</style>
<template>
  <div id="main">
    <!--首页左边-->
    <div id="sidebar-menu-con"
         :style="{width: hideMenuText?'60px':'200px', overflow: hideMenuText ? 'visible' : 'auto', background: '#515a6e'}">
      <sidebar-menu v-if="!hideMenuText" :menuList="menuList" :iconSize="18"/>
      <sidebar-menu-shrink v-else :menuList="menuList"/>
    </div>

    <!--首页右边-->
    <div :style="{paddingLeft: hideMenuText?'60px':'200px'}">
      <!--右边头部-->
      <div >
        <div style="height: 60px;background: #fff;">

          <!--折叠左边按钮-->
          <div  @click="hideMenuText=!hideMenuText" style="float:left;margin-top: 15px;margin-left: 10px">
            <a>
              <Icon type="md-menu" size="32" :style="{transform: hideMenuText ? 'rotateZ(90deg)' : 'rotateZ(0deg)'}"></Icon>
            </a>
          </div>
          
          <!--显示页面路路径信息-->
          <div style="float: left;margin-top: 20px;margin-left: 30px">
            <Breadcrumb>
              <BreadcrumbItem v-for="item in currentPath" :key="item.name" :to="item.path">{{ $t(item.title) }}
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          
  
          <div style="float: right;margin-top: 20px;margin-right: 10px">
            <!--div style="float:left;margin-right:600px">
              <span style="font-weight:800;font-size:18px">{{project}}</span>
            </div-->
            <div @click="handleFullScreen" style="float:left;margin-left:20px">
              <Tooltip :content="isFullScreen ? $t('exitFullScreen') : $t('fullScreen')" placement="bottom">
                <Icon :type="isFullScreen ? 'md-contract' : 'md-expand'" :size="23"></Icon>
              </Tooltip>
            </div>
  
            <div @click="lockScreen" style="float:left;margin-left:20px">
              <Tooltip :content="$t('lockScreen')" placement="bottom">
                <Icon type="md-lock" :size="20"></Icon>
              </Tooltip>
            </div>
  
            <div style="float:left;margin-left:20px;margin-right:20px">
              <Dropdown trigger="click" @on-click="logout">
                <a>
                  <span>{{ userName }}</span>
                  <Icon type="md-arrow-dropdown" />
                </a>
                <template #list>
                  <DropdownMenu>
                    <DropdownItem name="loginout">{{ $t('exit') }}</DropdownItem>
                  </DropdownMenu>
                </template>
              </Dropdown>
            </div>
  
          </div>
  
          <p align="center" style="padding-top:15px">
            <span style="font-weight:800;font-size:18px">{{project}}</span>
          </p>
  
        </div>

        <!--打开页面的标签-->
        <div style="height: 35px;padding-left: 2px;padding-right: 15px">
          <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
        </div>
      </div>

      <!--首页右边下 点击左边的选项显示的内容-->
      <!--使用<keep-alive></keep-alive>标签可以避免组件反复渲染，切换到其他的tab再切换回来不会改变组建的参数-->
      <div  style="clear:both">
        <router-view></router-view>
      </div>

    </div>
  

  </div>
</template>


<script setup>
  //
  import { ref, computed, onMounted, getCurrentInstance  } from 'vue'
  import { useRouter } from 'vue-router'
  import sidebarMenu from './components/sidebarMenu.vue'
  import sidebarMenuShrink from './components/sidebarMenuShrink.vue'
  import tagsPageOpened from './components/tagsPageOpened.vue'
  import util from '@/libs/util'
  import custom from '@/config/custom'
  import { useAppStore } from '@/store' 

  // 路由 与 store
  const router = useRouter()
  const appStore = useAppStore()
  
  const { proxy } = getCurrentInstance()

  // 响应式数据
  const project = ref(sessionStorage.getItem('project'))
  const hideMenuText = ref(false)
  const userName = ref(sessionStorage.getItem('user'))
  const isFullScreen = ref(false)

  // 计算属性
  const menuList = computed(() => appStore.menuList)
  const pageTagsList = computed(() => appStore.pageOpenedList)
  const currentPath = computed(() => appStore.currentPath)

  // 方法
  const logout = (name) => {
    router.push({ name: 'login' })
  }

  // 全屏 - 兼容其他浏览器
  const handleFullScreen = () => {
    //
    let body = document.getElementsByTagName('html')[0]
    
    if (isFullScreen.value) {
      document.exitFullscreen()
    } else {
      body.requestFullscreen()
    }
  }

  // 锁屏
  const lockScreen = () => {
    sessionStorage.setItem('lastPageName', router.currentRoute.value.name)
    router.push({ name: 'locking' })
  }

  //
  onMounted(() => {
    custom.greeting(proxy)    
    // 监听窗口变化以更新全屏状态
    window.onresize = () => {
      isFullScreen.value = !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement)
    }
  })
</script>

