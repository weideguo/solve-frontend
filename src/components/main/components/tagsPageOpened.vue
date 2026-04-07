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

<script>
  // import VueI18n from 'vue-i18n'
  import { useAppStore } from '@/store' 

  export default {
    name: 'tagsPageOpened',
    setup() {
      const appStore = useAppStore()
      return { appStore }
    },
    data () {
      return {
        currentPageName: this.$route.name
        // tagBodyLeft: 0
      }
    },
    props: {
      pageTagsList: Array
    },
    computed: {
    },
    methods: {
      closePage (event, name) {
        this.appStore.removeTag(name)
        if (this.currentPageName === name) {
          let lastPageName = this.appStore.pageOpenedList[this.appStore.pageOpenedList.length - 1].name
          this.$router.push({
            name: lastPageName
          })
          this.appStore.setBreadcrumb(lastPageName)
          this.appStore.currentPageName = lastPageName
        }
      },
      linkTo (name) {
        this.$router.push({
          name: name
        })
        this.appStore.setBreadcrumb(name)
        this.appStore.currentPageName = name
      },
      handleTagsOption (type) {
        if (type === 'clearAll') {
          this.appStore.clearAllTags()
          this.$router.push({
            name: this.appStore.pageOpenedList[0].name
          })
        } else {
          let currentName = this.$route.name
          this.appStore.clearOtherTags(currentName)
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
