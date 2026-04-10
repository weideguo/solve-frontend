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

<script setup>
  //
  import { ref, reactive, onMounted, nextTick, getCurrentInstance } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
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
  
  const route = useRoute()
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const formatType = ref('txt')
  const formatTypeList = ref(['txt','markdown','mysql-table','pg-table','html','ansible-result','crontab-result','common-table','text2table'])
  const tableFormatList = ref(['mysql-table','pg-table','ansible-result','crontab-result','common-table','text2table'])
  const tableColumnNamesGenerateFormatList = ref(['mysql-table','common-table','text2table'])
  const showField = ref('stdout')
  const filedList = ref(['stdout','stderr'])
  const originContent = ref('')
  const originContentFull = ref({})
  const formatContent = ref('')
  const settingModal = ref(false)
  const tableColumns = ref([])
  const tableData = ref([])
  const logID = ref('')
  const lineSpliter = ref('\\n')
  const columnSpliter = ref('\\s+')
  const lineFormatRegexp = ref('^([\\s\\S]*)$')
  const tableColumnNamesGenerate = ref(1)
  
  const resetFormatContent = () => {
    formatContent.value = ''
    tableColumns.value = []
    tableData.value = []
  }
  
  const markdownFormat = (content) => {
    console.log('markdown')
    const renderer = new marked.Renderer()
    let html = marked(content, { renderer })
    console.log('formatContent\n'+html)
    formatContent.value = html
    nextTick(() => {
      Prism.highlightAll()
    })
  }
  
  // 处理如数据库查询的输出，如以“\n”换行，“\t”分隔列
  const tableFormat = (content, lineSplit, colSplit, skipRegexps, colNames, colNamesGenerate) => {
    console.log('table')
    tableData.value = []
    let allLines = content.split(lineSplit)
    let contentLines = allLines
    
    let currentColNames = []
    if (colNames.length === 0) {
      let tableColumnNamesRaw = allLines[0].split(colSplit)
      if (colNamesGenerate) {
        currentColNames = tableColumnNamesRaw
        contentLines = allLines.slice(1)
      } else {
        // 生成_1 _2 _3 ...当成字段名
        tableColumnNamesRaw.forEach((h,i) => {
          currentColNames.push('_'+(i+1))
        })
        contentLines = allLines
      }
    } else {
      currentColNames = colNames
    }
  
    currentColNames.forEach((item,i) => {
      tableColumns.value.push({'title':item, 'key':item, 'sortable': true, 'resizable': true, 'width':0})
    })
  
    contentLines.forEach((line,i) => {
      let skip = false
      for (let [i, r] of skipRegexps.entries()) {
        if (r.test(line.trim())) {
          skip = true
          break
        }
      }
      if (!skip) {
        let lineFormat = {}
        line.split(colSplit).forEach((lineColumn,j) => {
          // 对于行分割后可能多出列的情况，添加多出的列名
          if ( j >= tableColumns.value.length ) {
            tableColumns.value.push({'title':'_'+(j+1), 'key':'_'+(j+1), 'sortable': true, 'resizable': true, 'width':0})
          }
          lineFormat[tableColumns.value[j].key] = lineColumn
        })
        tableData.value.push(lineFormat)
      }
    })
  
    let columnWidth = (screen.width-1)/tableColumns.value.length
    tableColumns.value.forEach((item,i) => {
      item['width'] = columnWidth
    })
    
    console.log('formatContent')
    console.log(tableColumns.value)
    console.log(tableData.value)
  }
  
  // 行需要以正则指定如何分割成列
  const text2tableFormat = (content, lineSplit, lineRegex, colNames, colNamesGenerate) => {
    console.log('text2table')
    let allLines = content.split(lineSplit)
    let contentLines = allLines
    let currentColNames = []
  
    if (colNames.length === 0) {
      // 通过匹配一行判断有多少个字段，如果都不匹配，则设置只有一个字段
      let tableColumnNamesRaw = []
      for (let [i, line] of allLines.entries()) {
        let match = line.trim().match(lineRegex)
        if (match) {
          tableColumnNamesRaw = match.slice(1)
          break
        } 
      }
      if (tableColumnNamesRaw.length === 0){
        tableColumnNamesRaw = ['_1']
      }
  
      if (colNamesGenerate) {
        currentColNames = tableColumnNamesRaw
        contentLines = allLines.slice(1)
      } else {
        tableColumnNamesRaw.forEach((h,i) => {
          currentColNames.push('_'+(i+1))
        })
        contentLines = allLines
      }
    } else {
      currentColNames = colNames
    }
  
    tableData.value = []
    tableColumns.value = [{'title':'#id', 'key':'#id', 'sortable': true, 'resizable': true, 'width':150}]
    currentColNames.forEach((k,i) => {
      tableColumns.value.push({'title': k, 'key':k , 'sortable': true, 'resizable': true, 'width':150})
    })
    delete tableColumns.value[tableColumns.value.length-1].width
  
    let lineLists = contentLines.map(lineRaw => {
      let match = lineRaw.trim().match(lineRegex)
      if (match) {
        return match.slice(1)
      } else {
        return [...Array(currentColNames.length-1).fill(''),lineRaw]
      }
    })
    lineLists.forEach((lineList,i) => {
      let lineFormat = {'#id': i}
      lineList.forEach((lineColumn,j) => {
        lineFormat[tableColumns.value[j+1].key] = lineColumn
      })
      tableData.value.push(lineFormat)
    })
  }
  
  const contentFormat = (contentFull, field, type) => {
    let content = contentFull[field]
    console.log('originContent\n'+content) 
    resetFormatContent()
    
    if (type === 'markdown' ){
      markdownFormat(content)
    } else if (type === 'mysql-table') {
      tableFormat(content, '\n', '\t', [], [], tableColumnNamesGenerate.value)
    } else if (type === 'pg-table') {
      tableFormat(content, '\n', '|', [/^-+(?:\+-+)+$/,/^\(\d+\srows\)$/], [], 1)
    } else if (type === 'ansible-result') {
      let colNames = ['host','status','return','ouput']
      let lineSplit = /(?=^.* \| .* \| rc=\d+ >>\n)/m
      let lineRegex = /^(.+?)\s*\|\s*(.+?)\s*\|\s*rc=(\d+)\s*>>\n([\s\S]+)$/ 
      text2tableFormat(content, lineSplit, lineRegex, colNames, 0)
    } else if (type === 'crontab-result') {
      let colNames = ['minute','hour','day','month','week','command']
      let lineSplit = '\n'
      let lineRegex = /^([^#]+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+(.+)$/
      text2tableFormat(content, lineSplit, lineRegex, colNames, 0)
    } else if (type === 'common-table') {
      tableFormat(content, new RegExp(lineSpliter.value, 'm'), new RegExp(columnSpliter.value), [], [], tableColumnNamesGenerate.value)
    } else if (type === 'text2table') {
      text2tableFormat(content, new RegExp(lineSpliter.value, 'm'), new RegExp(lineFormatRegexp.value), [], tableColumnNamesGenerate.value)
    } else if (type === 'html') {
      formatContent.value = content
    } else if (type === 'txt') {
      formatContent.value = content
    } else {
      peoxy.$Message.error(t('notImplement')+' '+formatType)
    }
  }
  
  const viwerSetting = () => {
    settingModal.value = true
  }
  
  const refresh = () => {
    contentFormat(originContentFull.value, showField.value, formatType.value)
  }
  
  const loadData = () => {
    order.exedetail(logID.value)
      .then(res => {
        if (res.data['status'] > 0) {
          console.log(showField)
          console.log(formatType)
          console.log(res.data)
          originContentFull.value = res.data['exedetail']
          proxy.$Message.info(t('loadSuccess'))
          contentFormat(originContentFull.value, showField.value, formatType.value)
        } else {
          proxy.$Message.error(res.data['msg'])
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  onMounted(() => {
    const urlParams = util.parseUrlParams(window.location)
    logID.value = urlParams['logID']
  
    if (urlParams['showField'] != undefined) {
      showField.value = urlParams['showField']
    }
    if (urlParams['formatType'] != undefined) {
      formatType.value = urlParams['formatType']
    }
    loadData()
  })
</script>