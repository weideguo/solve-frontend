<style scoped>
html {
  overflow-x: scroll !important; /* 始终显示水平滚动条 */
}

.format-content {
  line-height: 1.6;
  font-size: 16px;
}

.format-content-padding {
  padding: 2%;
}

.floating-div {
  position: fixed;
  bottom: 5%; 
  right: 1%;    
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

</style>
<template>
  <div>
    <div >
      <Table class="format-content" v-if="formatType === 'table'" border stripe :columns="tableColumns" :data="tableData" size="small"></Table>
      <!-- v-else-if -->
      <div class="format-content format-content-padding" v-else v-html="formatContent"></div>
    </div>

    <Tooltip :content="$t('setting')" placement="top" class="floating-div">
      <Button type="primary" shape="circle" icon="md-settings" @click="viwerSetting"></Button>
    </Tooltip>

    <Drawer v-model="settingModal" :mask-closable="false" :mask="false" scrollable draggable width="20%">
      <p style="font-weight:800;font-size:18px">{{ $t('setting') }}</p>
      <br>
      <Form>
        <FormItem :label="$t('field')">
          <Select v-model="showField">
            <Option v-for="item in filedList" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('formatType')">
          <Select v-model="formatType">
            <Option v-for="item in formatTypeList" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Tooltip :content="$t('refreshTips')" placement="bottom" style="margin-right: 1%">
            <Button type="primary" @click="refresh">{{ $t('refresh') }}</Button>
          </Tooltip>
          <Tooltip :content="$t('reloadTips')" placement="bottom">
            <Button type="success" @click="loadData">{{ $t('reload') }}</Button>
          </Tooltip>
        </FormItem>    
      </Form>
    </Drawer>

  </div>
</template>

<script>
import util from '@/libs/util'
import order from '@/api/order'

import { marked } from 'marked'
import Prism from 'prismjs'

// 加载语言高亮支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup' 
import 'prismjs/components/prism-bash' 

 
// Prism 主题样式 solarizedlight okaidia funky dark coy twilight tomorrow
import 'prismjs/themes/prism-tomorrow.css'


export default {
  name: 'execDetailViewer',
  data() {
    return {
      formatType: 'markedown',
      showField: 'stdout',
      formatTypeList: ['markedown','table','html'],
      filedList: ['stdout','stderr'],
      originContent: '',
      originContentFull: {},
      formatContent: '',
      settingModal: false,
      tableColumns: [],
      tableData: [],
      logID: '',
    }
  },
  methods: {
    resetFormatContent() {
      this.formatContent = ''
      this.tableColumns = []
      this.tableData = []
    },
    markdownFormat(originContent) {
      console.log('markdown')
      const renderer = new marked.Renderer()
      let html = marked(originContent, { renderer })
      console.log('formatContent\n'+html)
      this.formatContent = html
      this.$nextTick(() => {
        Prism.highlightAll()
      })
    },
    tableFormat(originContent) {
      // 处理如数据库查询的输出，以“\n”换行，“\t”分隔列
      console.log('table')
      let lineSpliter = '\n'
      let columnSpliter = '\t'
      let allLines = originContent.split(lineSpliter)
      allLines[0].split(columnSpliter).forEach((item,i) => {
        this.tableColumns.push({'title':item, 'key':item, 'sortable': true, 'resizable': true, 'width':0})
      })
      // 使用屏幕宽度平均
      let columnWidth = screen.width/this.tableColumns.length
      this.tableColumns.forEach((item,i) => {
        item['width'] = columnWidth
      })

      allLines.slice(1).forEach((line,i) => {
        let lineFormat = {}
        line.split(columnSpliter).forEach((lineColumn,j) => {
          lineFormat[this.tableColumns[j].key] = lineColumn
        })
        this.tableData.push(lineFormat)
      })

      console.log('formatContent')
      console.log(this.tableColumns)
      console.log(this.tableData)
    },
    contentFormat(originContentFull,showField,formatType) {
      let originContent = originContentFull[showField]
      console.log('originContent\n'+originContent) 
      this.resetFormatContent()
      if (formatType === 'markedown' ){
        this.markdownFormat(originContent)
      } else if (formatType === 'table') {
        this.tableFormat(originContent)
      } else if (formatType === 'html') {
        this.formatContent = originContent
      } else {
        this.$Message.error(this.$t('notImplement')+' '+formatType)
      }
      
    },
    viwerSetting() {
      this.settingModal = true
    },
    refresh() {
      this.contentFormat(this.originContentFull,this.showField,this.formatType)
    },
    loadData() {
      order.exedetail(this.logID)
        .then(res => {
          if (res.data['status'] > 0) {
            console.log(this.showField)
            console.log(this.formatType)
            console.log(res.data)
            this.originContentFull = res.data['exedetail']
            this.$Message.info(this.$t('loadSuccess'))
            this.contentFormat(this.originContentFull,this.showField,this.formatType)
          } else {
            this.$Message.error(res.data['msg'])
          }
        })
        .catch(error => {
          util.notice(this, error, 'error')
        })
    },
  },
  mounted () {
    let urlParams = util.parseUrlParams(window.location)
    this.logID = urlParams['logID']

    if (urlParams['showField'] != undefined) {
      this.showField = urlParams['showField']
    }
    if (urlParams['formatType'] != undefined) {
      this.formatType = urlParams['formatType']
    }
    this.loadData()
    
  }
}
</script>

