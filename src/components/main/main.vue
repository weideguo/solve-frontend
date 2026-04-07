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
              <Icon type="md-menu" size="32" :style="{transform: this.hideMenuText ? 'rotateZ(90deg)' : 'rotateZ(0deg)'}"></Icon>
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
              <Tooltip :content="this.isFullScreen ? $t('exitFullScreen') : $t('fullScreen')" placement="bottom">
                <Icon :type="this.isFullScreen ? 'md-contract' : 'md-expand'" :size="23"></Icon>
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


<script>
  import sidebarMenu from './components/sidebarMenu.vue'
  import sidebarMenuShrink from './components/sidebarMenuShrink.vue'
  import tagsPageOpened from './components/tagsPageOpened.vue'
  import util from '@/libs/util'
  import custom from '@/config/custom'
  import { useAppStore } from '@/store' 

  export default {
    components: {
      sidebarMenu,
      sidebarMenuShrink,
      tagsPageOpened
    },
    setup() {
      const appStore = useAppStore()
      return { appStore }
    },
    data () {
      return {
        project: sessionStorage.getItem('project'),
        hideMenuText: false,
        userName: sessionStorage.getItem('user'),
        isFullScreen: false
      }
    },
    computed: {
      menuList () {
        return this.appStore.menuList
      },
      pageTagsList () {
        // 打开的页面的页面对象
        return this.appStore.pageOpenedList
      },
      currentPath () {
        // 当前路径数组
        return this.appStore.currentPath
      },
      // isFullScreen () {
      //   return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
      // }
    },
    methods: {
      logout (name) {
        this.$router.push({name: 'login'})

      },
      // 全屏 兼容其他浏览器
      handleFullScreen () {
        let body = document.getElementsByTagName('html')[0]
        if (this.isFullScreen) {
          // this.isFullScreen = false
          document.exitFullscreen()
        } else {
          // this.isFullScreen = true
          body.requestFullscreen()
        }
      },
      // 锁屏
      lockScreen () {
        sessionStorage.setItem('lastPageName', this.$route.name)              // 本地存储锁屏之前打开的页面以便解锁后打开
        this.$router.push({name: 'locking'})
      }
    },
    mounted () {
      custom.greeting(this)
      window.onresize = () => {
        this.isFullScreen = document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
      }
    },
    created () {
    }
  }
</script>
