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
    background:url('/static/icon.png') no-repeat center;
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
          <span class="layout-text">{{ item.children[0].title }}</span>
        </MenuItem>
      </template> 
      <!--处理子节点不为1的-->
      <template v-else-if="item.children.length>1">  
        <Submenu :name="item.name" :key="item.path">
          <template slot="title">
            <Icon :type="item.icon" :size="iconSize"></Icon>
            <span class="layout-text">{{ item.title }}</span>
          </template>
          <!-- -->
          <template v-for="child in item.children">
            <template>
              <MenuItem :name="child.name" :key="child.name">
                <Icon :type="child.icon" :size="iconSize" :key="child.name"></Icon>
                <span class="layout-text" :key="child.name + 1">{{ child.title }}</span>
              </MenuItem>
            </template>
          </template>
        </Submenu>
      </template>
    </template>

    <Menu-item name="login">
      <Icon type="md-log-out" :size="iconSize"></Icon>
      <span class="layout-text">退出</span>
    </Menu-item>
  </Menu>
</template>
<script>
  //
  import util from '@/libs/util'
  // import axios from 'axios'

  export default {
    name: 'sidebarMenu',
    props: {
      menuList: Array,
      iconSize: Number
    },
    data () {
      return {
      }
    },
    computed: {
      currentPageName () {
        return this.$store.state.currentPageName
      }
    },
    methods: {
      currentPageTab (val) {
        // if (val === 'login') {
        //   this.$router.push({
        //     name: 'login'
        //   })
        // } else {
        //   util.openPage(this, val)
        // }
        util.openPage(this, val)
      }
    },
    created () {
    }
  }
</script>
