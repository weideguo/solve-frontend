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
             @click.native="linkTo(item.name, item.title)" :closable="item.name==='home_index'?false:true"
             :color="item.children?(item.children[0].name===currentPageName?'primary':'default'):(item.name===currentPageName?'primary':'default')">
          {{ item.title }}
        </Tag>
      </transition-group>
    </div>

    <div style="float:right;margin-top:6px;">
      <Dropdown transfer @on-click="handleTagsOption">
        <Button size="small" type="primary">
          标签开关
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name="clearAll">关闭所有</DropdownItem>
          <DropdownItem name="clearOthers">关闭其他</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    
  </div>
</template>

<script>
  export default {
    name: 'tagsPageOpened',
    data () {
      return {
        currentPageName: this.$route.name
        // except_item: this.$store.state.pageOpenedList[0].name
        // tagBodyLeft: 0
      }
    },
    props: {
      pageTagsList: Array
    },
    computed: {
      // title () {
      //   return this.$store.state.currentTitle
      // }
    },
    methods: {
      closePage (event, name) {
        this.$store.commit('removeTag', name)
        if (this.currentPageName === name) {
          let lastPageName = this.$store.state.pageOpenedList[this.$store.state.pageOpenedList.length - 1].name
          this.$router.push({
            name: lastPageName
          })
          this.$store.commit('setBreadcrumb', lastPageName)
          this.$store.state.currentPageName = lastPageName
        }
      },
      linkTo (name) {
        this.$router.push({
          name: name
        })
        this.$store.commit('setBreadcrumb', name)
        this.$store.state.currentPageName = name
      },
      handleTagsOption (type) {
        if (type === 'clearAll') {
          this.$store.commit('clearAllTags')
          this.$router.push({
            // name: 'home_index'
            name: this.$store.state.pageOpenedList[0].name
          })
        } else {
          this.$store.commit('clearOtherTags', this)
        }
      }
    },
    watch: {
      '$route' (to) {
        this.currentPageName = to.name
      }
    }
  }
</script>
