<style>
html {
  overflow-x: scroll !important; /* 始终显示水平滚动条 */
}

.format-content {
  line-height: 1.6;
  font-size: 16px;
  white-space: pre-wrap; 
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

.ivu-table-cell {
  white-space: pre-wrap;
}

</style>
<template>
  <div>
    <div >
      <Table class="format-content" v-if="['mysql-table','pg-table','ansible-result','crontab-result'].includes(formatType)" border stripe :columns="tableColumns" :data="tableData" size="small"></Table>
      <div class="format-content format-content-padding" v-else-if="formatType === 'txt'">{{formatContent}}</div>
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
      formatType: 'txt',
      showField: 'stdout',
      formatTypeList: ['txt','markedown','mysql-table','pg-table','html','ansible-result','crontab-result'],
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
    tableFormatx(originContent, lineSpliter, columnSpliter) {
      // 处理如数据库查询的输出，以“\n”换行，“\t”分隔列
      console.log('table')
      let allLines = originContent.split(lineSpliter)
      allLines[0].split(columnSpliter).forEach((item,i) => {
        this.tableColumns.push({'title':item, 'key':item, 'sortable': true, 'resizable': true, 'width':0})
      })
      // 使用屏幕宽度平均
      let columnWidth = (screen.width-1)/this.tableColumns.length
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
    tableFormat(originContent, lineSpliter, columnSpliter, skipLineRegexps, tableColumnNames) {
      // 处理如数据库查询的输出，以“\n”换行，“\t”分隔列
      console.log('table')
      let allLines = originContent.split(lineSpliter)
      let contentLines = allLines
      if (tableColumnNames.length === 0) {
        tableColumnNames = allLines[0].split(columnSpliter)
        contentLines = allLines.slice(1)
      }
      
      tableColumnNames.forEach((item,i) => {
        this.tableColumns.push({'title':item, 'key':item, 'sortable': true, 'resizable': true, 'width':0})
      })
      // 使用屏幕宽度平均
      let columnWidth = (screen.width-1)/this.tableColumns.length
      this.tableColumns.forEach((item,i) => {
        item['width'] = columnWidth
      })

      contentLines.forEach((line,i) => {
        let skip = false
        for (let [i, r] of skipLineRegexps.entries()) {
          if (r.test(line.trim())) {
            skip = true
            break
          }
        }
        if (!skip) {
          let lineFormat = {}
          line.split(columnSpliter).forEach((lineColumn,j) => {
            lineFormat[this.tableColumns[j].key] = lineColumn
          })
          this.tableData.push(lineFormat)
        }
      })

      console.log('formatContent')
      console.log(this.tableColumns)
      console.log(this.tableData)
    },
    text2tableFormat(originContent, tableColumnNames, lineSpliter, lineFormatRegexp) {
      console.log('text2table')
      this.tableData = []
      this.tableColumns = [{'title':'id', 'key':'id', 'sortable': true, 'resizable': true, 'width':150}]
      tableColumnNames.forEach((k,i) => {
        this.tableColumns.push({'title': k, 'key':k , 'sortable': true, 'resizable': true, 'width':150})
      })
      delete this.tableColumns[this.tableColumns.length-1].width
      
      let lineRaws = originContent.split(lineSpliter)
      let lineFormats = lineRaws.map(lineRaw => {
        let match = lineRaw.trim().match(lineFormatRegexp)
        if (match) {
          return match.slice(1)
        } else {
          return [...Array(tableColumnNames.length-1).fill(''),lineRaw]
        }
      })
      lineFormats.forEach((lineFormat,i) => {
        let _lineFormat = {'id': i}
        lineFormat.forEach((lineColumn,j) => {
          _lineFormat[this.tableColumns[j+1].key] = lineColumn
        })
        console.log(_lineFormat)
        console.log(11111111111111)
        this.tableData.push(_lineFormat)
      })
      console.log(this.tableData)
    },
    ansibleResultFormat(originContent) {
      console.log('ansible-result')
      this.tableColumns = [
        {'title':'id', 'key':'id', 'sortable': true, 'resizable': true, 'width':150},
        {'title':'host', 'key':'host', 'sortable': true, 'resizable': true, 'width':150},
        {'title':'status', 'key':'status', 'sortable': true, 'resizable': true, 'width':150},
        {'title':'return code', 'key':'returnCode', 'sortable': true, 'resizable': true, 'width':150},
        {'title':'ouput', 'key':'ouput', 'resizable': true },
      ]
      let lineSpliter = /(?=^.* \| .* \| rc=\d+ >>\n)/gm
      let lineFormatRegexp = /^(.+?)\s*\|\s*(.+?)\s*\|\s*rc=(\d+)\s*>>\n([\s\S]+)$/ 
      let hostResultRaws = originContent.split(lineSpliter)
      let hostResults = hostResultRaws.map(hostResultRaw => {
        let match = hostResultRaw.trim().match(lineFormatRegexp)
        if (match) {
          return match.slice(1)
        } else {
          return ['','','',hostResultRaw]
        }
      })
      hostResults.forEach((hostResult,i) => {
        this.tableData.push({
          'id': i, 
          'host':hostResult[0], 
          'status':hostResult[1], 
          'returnCode':hostResult[2], 
          'ouput':hostResult[3]
        })
      })
      console.log(this.tableData)
    },
    crontabResultFormat(originContent) {
      console.log('crontab-result')
      this.tableColumns = [
        {'title':'id', 'key':'id', 'sortable': true, 'resizable': true, 'width':100},
        {'title':'minute', 'key':'minute', 'sortable': true, 'resizable': true, 'width':100},
        {'title':'hour', 'key':'hour', 'sortable': true, 'resizable': true, 'width':100},
        {'title':'day', 'key':'day', 'sortable': true, 'resizable': true, 'width':100},
        {'title':'month', 'key':'month', 'sortable': true, 'resizable': true, 'width':100},
        {'title':'week', 'key':'week', 'sortable': true, 'resizable': true, 'width':100},
        {'title':'command', 'key':'command', 'resizable': true },
      ]
      let lineSpliter = '\n'
      // 按照正则分隔成6部分
      let lineFormatRegexp = /^([^#]+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+)$/ 
      let crontabResultRaws = originContent.split(lineSpliter)
      let crontabResults = crontabResultRaws.map(crontabResultRaw => {
          let match = crontabResultRaw.trim().match(lineFormatRegexp)
          if (match) {
            return match.slice(1)
          } else {
            return ['','','','','',crontabResultRaw]
          }
      })
      crontabResults.forEach((crontabResult,i) => {
        this.tableData.push({
          'id': i, 
          'minute':crontabResult[0], 
          'hour':crontabResult[1], 
          'day':crontabResult[2], 
          'month':crontabResult[3], 
          'week':crontabResult[4], 
          'command':crontabResult[5]
        })
        console.log(this.tableData)
      })
    },
    contentFormat(originContentFull,showField,formatType) {
      let originContent = originContentFull[showField]
      console.log('originContent\n'+originContent) 
      this.resetFormatContent()
      if (formatType === 'markedown' ){
        this.markdownFormat(originContent)
      } else if (formatType === 'mysql-table') {
        this.tableFormat(originContent, '\n', '\t', [], [])
      } else if (formatType === 'pg-table') {
        this.tableFormat(originContent, '\n', '|', [/^-+(?:\+-+)+$/,/^\(\d+\srows\)$/], [])
      } else if (formatType === 'ansible-result') {
        let tableColumnNames = ['host','status','return','ouput']
        let lineSpliter = /(?=^.* \| .* \| rc=\d+ >>\n)/gm
        let lineFormatRegexp = /^(.+?)\s*\|\s*(.+?)\s*\|\s*rc=(\d+)\s*>>\n([\s\S]+)$/ 
        this.text2tableFormat(originContent, tableColumnNames, lineSpliter, lineFormatRegexp)
      } else if (formatType === 'crontab-result') {
        let tableColumnNames = ['minute','hour','day','month','week','command']
        let lineSpliter =  '\n'
        let lineFormatRegexp = /^([^#]+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+)$/
        this.text2tableFormat(originContent, tableColumnNames, lineSpliter, lineFormatRegexp)
      } else if (formatType === 'html') {
        this.formatContent = originContent
      } else if (formatType === 'txt') {
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

