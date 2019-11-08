<style>
  .btn_hover {
    width: 60px;
    margin-left: 30%;
    padding:10px 0;
  }
  #icon_div_shrink {
    width: 40px;
    height: 40px;
    margin-top: 5px;
    -moz-border-radius: 50%;
    -webkit-border-radius: 50%;
    border-radius: 50%;
    background:url('/static/icon.png') no-repeat center;
    background-size:103% 103%
  }
</style>

<template>
  <div>
    <div align="center">
      <a href="/">
        <div id="icon_div_shrink"></div>
      </a>
      <br>
    </div>


    <template v-for="(item, index) in menuList">
      <!--处理子节点不为1的-->
      <Dropdown v-if="item.children.length > 1"  placement="right-start" :key="index" @on-click="currentPageTab">
        <div class="btn_hover">
          <Icon size="20" :color="iconColor" :type="item.icon"></Icon>
        </div>
        <DropdownMenu style="width: 200px;" slot="list">
          <DropdownItem v-for="child in item.children" :name="child.name" :key="child.title">
            <Icon :type="child.icon" size="20"></Icon>
            <span style="padding-left:10px;">{{ child.title }}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!--处理子节点为1的-->
      <Dropdown v-else-if="item.children.length === 1" placement="right-start" :key="index" @on-click="currentPageTab">
        <div @click="currentPageTab(item.children[0].name)" class="btn_hover">
          <Icon :size="20" :color="iconColor" :type="item.icon"></Icon>
        </div>
        <DropdownMenu style="width: 200px;" slot="list">
          <DropdownItem :name="item.children[0].name" :key="item.children[0].title">
            <Icon :type="item.icon" size="20"></Icon>
            <span style="padding-left:10px;">{{ item.children[0].title }}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      
    </template>
    
    
    <Dropdown placement="right-start" @on-click="currentPageTab">
      <div @click="currentPageTab('login')" class="btn_hover">
        <Icon type="md-log-out" size="20" :color="iconColor"></Icon>
      </div>
      <DropdownMenu style="width: 200px;" slot="list">
        <DropdownItem name="logout" key="logout">
          <Icon type="md-log-out" size="20"></Icon>
          <span style="padding-left:10px;">退出</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>

  </div>
</template>

<script>
  //
  import util from '@/libs/util'
  // import axios from 'axios'

  export default {
    name: 'sidebarMenuShrink',
    props: {
      menuList: {
        type: Array
      },
      iconColor: {
        type: String,
        default: 'white'
      }
    },
    data () {
      return {
        currentPageName: this.$route.name
      }
    },
    methods: {
      currentPageTab (val) {
        util.openPage(this, val)
      }
    },
    created () {
    }
  }
</script>
