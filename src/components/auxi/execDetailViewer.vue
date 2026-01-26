<style>
html {
  overflow-x: scroll !important; /* 始终显示水平滚动条 */
}

.format-content {
  line-height: 1.6;
  font-size: 16px;
  background:#FFFFFF;
}

.format-content-padding {
  padding: 2%;
  white-space: pre-wrap; 
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
  white-space: pre-line;
}

/* 用于markdown格式表格的美化 */
.markdown-body table {
  width: 100%;
}

.markdown-body table,
.markdown-body th,
.markdown-body td {
  border: 1px solid #ccc;
  border-collapse: collapse;
  padding: 8px;
}

.markdown-body tr:nth-child(2n) {
  background-color: #f6f8fa;
}
</style>
<template>
  <div>
    <div >
      <Table class="format-content" v-if="tableFormatList.includes(formatType)" border stripe :columns="tableColumns" :data="tableData" size="small"></Table>
      <div class="format-content format-content-padding markdown-body" v-else-if="['markdown'].includes(formatType)" v-html="formatContent"></div>
      <div class="format-content format-content-padding" v-else-if="['html'].includes(formatType)" v-html="formatContent"></div>
      <div class="format-content format-content-padding" v-else>{{formatContent}}</div>
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
        <FormItem v-if="['common-table','text2table'].includes(formatType)" :label="$t('lineSpliter')">
          <Input v-model="lineSpliter" type="textarea" :autosize="true" :placeholder="$t('lineSpliterComment')" clearable></Input>
        </FormItem>
        <FormItem v-if="formatType === 'common-table'" :label="$t('columnSpliter')">
          <Input v-model="columnSpliter" type="textarea" :autosize="true" :placeholder="$t('columnSpliterComment')" clearable></Input>
        </FormItem>
        <FormItem v-if="formatType === 'text2table'" :label="$t('lineFormatRegexp')">
          <Input v-model="lineFormatRegexp" type="textarea" :autosize="true" :placeholder="$t('lineFormatRegexpComment')" clearable></Input>
        </FormItem>

        <FormItem v-if="tableColumnNamesGenerateFormatList.includes(formatType)" :label="$t('tableColumnNamesGenerate')">
          <Select v-model="tableColumnNamesGenerate">
            <Option v-for="item in [1,0]" :value="item" :key="item">{{ item }}</Option>
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
      formatTypeList: ['txt','markdown','mysql-table','pg-table','html','ansible-result','crontab-result','common-table','text2table'],
      tableFormatList: ['mysql-table','pg-table','ansible-result','crontab-result','common-table','text2table'],
      tableColumnNamesGenerateFormatList: ['mysql-table','common-table','text2table'],
      showField: 'stdout',
      filedList: ['stdout','stderr'],
      originContent: '',
      originContentFull: {},
      formatContent: '',
      settingModal: false,
      tableColumns: [],
      tableData: [],
      logID: '',
      lineSpliter: '\\n',
      columnSpliter: '\\s+',
      lineFormatRegexp: '^([\\s\\S]*)$',
      tableColumnNamesGenerate: 1,
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
    tableFormat(originContent, lineSpliter, columnSpliter, skipLineRegexps, tableColumnNames, tableColumnNamesGenerate) {
      // 处理如数据库查询的输出，如以“\n”换行，“\t”分隔列
      console.log('table')
      this.tableData = []
      let allLines = originContent.split(lineSpliter)
      let contentLines = allLines
      if (tableColumnNames.length === 0) {
        let tableColumnNamesRaw = allLines[0].split(columnSpliter)
        if (tableColumnNamesGenerate) {
          tableColumnNames = tableColumnNamesRaw
          contentLines = allLines.slice(1)
        } else {
          // 生成_1 _2 _3 ...当成字段名
          tableColumnNamesRaw.forEach((h,i) => {
            tableColumnNames.push('_'+(i+1))
          })
          contentLines = allLines
        }
      }      
      tableColumnNames.forEach((item,i) => {
        this.tableColumns.push({'title':item, 'key':item, 'sortable': true, 'resizable': true, 'width':0})
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
            // 对于行分割后可能多出列的情况，添加多出的列名
            if ( j >= this.tableColumns.length ) {
              this.tableColumns.push({'title':'_'+(j+1), 'key':'_'+(j+1), 'sortable': true, 'resizable': true, 'width':0})
            }
            lineFormat[this.tableColumns[j].key] = lineColumn
          })
          this.tableData.push(lineFormat)
        }
      })

      // 使用屏幕宽度平均
      let columnWidth = (screen.width-1)/this.tableColumns.length
      this.tableColumns.forEach((item,i) => {
        item['width'] = columnWidth
      })

      console.log('formatContent')
      console.log(this.tableColumns)
      console.log(this.tableData)
    },
    text2tableFormat(originContent, lineSpliter, lineFormatRegexp, tableColumnNames, tableColumnNamesGenerate) {
      // 行需要以正则指定如何分割成列
      console.log('text2table')
      let allLines = originContent.split(lineSpliter)
      let contentLines = allLines
      if (tableColumnNames.length === 0) {
        // 通过匹配一行判断有多少个字段，如果都不匹配，则设置只有一个字段
        let tableColumnNamesRaw =[]
        for (let [i, line] of allLines.entries()) {
          let match = line.trim().match(lineFormatRegexp)
          if (match) {
            tableColumnNamesRaw = match.slice(1)
            break
          } 
        }
        if (tableColumnNamesRaw.length ===0 ){
          tableColumnNamesRaw = ['_1']
        }

        if (tableColumnNamesGenerate) {
          tableColumnNames = tableColumnNamesRaw
          contentLines = allLines.slice(1)
        } else {
          // 生成_1 _2 _3 ...当成字段名
          tableColumnNamesRaw.forEach((h,i) => {
            tableColumnNames.push('_'+(i+1))
          })
          contentLines = allLines
        }
      } 

      this.tableData = []
      this.tableColumns = [{'title':'#id', 'key':'#id', 'sortable': true, 'resizable': true, 'width':150}]
      tableColumnNames.forEach((k,i) => {
        this.tableColumns.push({'title': k, 'key':k , 'sortable': true, 'resizable': true, 'width':150})
      })
      delete this.tableColumns[this.tableColumns.length-1].width

      let lineLists = contentLines.map(lineRaw => {
        let match = lineRaw.trim().match(lineFormatRegexp)
        if (match) {
          return match.slice(1)
        } else {
          return [...Array(tableColumnNames.length-1).fill(''),lineRaw]
        }
      })
      lineLists.forEach((lineList,i) => {
        let lineFormat = {'#id': i}
        lineList.forEach((lineColumn,j) => {
          lineFormat[this.tableColumns[j+1].key] = lineColumn
        })
        this.tableData.push(lineFormat)
      })
      console.log(this.tableData)
    },
    contentFormat(originContentFull,showField,formatType) {
      let originContent = originContentFull[showField]
      console.log('originContent\n'+originContent) 
      this.resetFormatContent()
      if (formatType === 'markdown' ){
        this.markdownFormat(originContent)
      } else if (formatType === 'mysql-table') {
        this.tableFormat(originContent, '\n', '\t', [], [], this.tableColumnNamesGenerate)
      } else if (formatType === 'pg-table') {
        this.tableFormat(originContent, '\n', '|', [/^-+(?:\+-+)+$/,/^\(\d+\srows\)$/], [], 1)
      } else if (formatType === 'ansible-result') {
        let tableColumnNames = ['host','status','return','ouput']
        // 分割成行的正则不能以分组的形式
        // m multi-line 多行
        let lineSpliter = /(?=^.* \| .* \| rc=\d+ >>\n)/m
        let lineFormatRegexp = /^(.+?)\s*\|\s*(.+?)\s*\|\s*rc=(\d+)\s*>>\n([\s\S]+)$/ 
        this.text2tableFormat(originContent,  lineSpliter, lineFormatRegexp, tableColumnNames,0)
      } else if (formatType === 'crontab-result') {
        let tableColumnNames = ['minute','hour','day','month','week','command']
        let lineSpliter =  '\n'
        let lineFormatRegexp = /^([^#]+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+)$/
        this.text2tableFormat(originContent, lineSpliter, lineFormatRegexp, tableColumnNames, 0)
      } else if (formatType === 'common-table') {
        console.log(new RegExp(this.lineSpliter, 'm'))
        console.log(new RegExp(this.columnSpliter))
        this.tableFormat(originContent, new RegExp(this.lineSpliter, 'm'), new RegExp(this.columnSpliter), [], [], this.tableColumnNamesGenerate)
      } else if (formatType === 'text2table') {
        console.log(new RegExp(this.lineSpliter, 'm'))
        console.log(new RegExp(this.lineFormatRegexp))
        this.text2tableFormat(originContent,  new RegExp(this.lineSpliter, 'm'), new RegExp(this.lineFormatRegexp), [], this.tableColumnNamesGenerate)
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

