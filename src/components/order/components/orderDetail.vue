<style lang="css">
  .top {
    padding: 0px;
    background: #2D8CF0;
    color: #fff;
    text-align: center;
    border-radius: 5px;
  }
  .ivu-table-cell {
    white-space: pre-line;
  }
</style>
<template>
  <div>
    <Card style="width: 100%">
      <template #title>
        <Poptip transfer :content="playbook" trigger="hover" placement="bottom-start">
          <p>{{ workid }}</p>
        </Poptip>
        <br>
        <br>
        <Tooltip :content="$t('openNewWindow')" placement="bottom-start">
          <Button type="primary" shape="circle" icon="md-albums" ghost @click.native="orderInfo()"></Button>
        </Tooltip>
        <Tooltip :content="$t('showPlaybook')" placement="bottom-start" style="margin-left: 20px">
          <Button type="primary" shape="circle" icon="md-book" ghost @click.native="playbookDetial()"></Button>
        </Tooltip>
        <Tooltip :content="$t('refresh')" placement="bottom" style="margin-left: 20px">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshCurrentPage()"></Button>
        </Tooltip>
        <Tooltip :content="$t('summary')" placement="bottom" style="margin-left: 20px">
          <Button type="primary" shape="circle" icon="md-bookmarks" ghost @click.native="summary()"></Button>
        </Tooltip>
        <Switch size="large" @on-change="finishFilter" style="margin-left: 50px">
          <template #open>
            <span>{{ $t('filter') }}</span>
          </template>
          <template #close>
            <span>{{ $t('all') }}</span>
          </template>
        </Switch>
        <div style="float:right;margin-right: 50px">
          <b>
          {{ $t('executing') }} <span style="color: #EEB422"> {{sum['executing']}} </span>
          {{ $t('exeFailed') }} <span style="color: #FF0000"> {{sum['fail']}} </span>
          {{ $t('exeSuccess') }} <span style="color: #228B22"> {{sum['done']}} </span>
          {{ $t('currentNum') }} <span style="color: #0000FF">{{targetAmount}}</span>
          {{ $t('allNum') }} <span style="color: #0000FF">{{sum['all']}}</span>
          </b>
        </div>
      </template>
      <Table border stripe :columns="tabcolumns" :data="TableDataNew" @on-row-dblclick="quickShow">
        <template #action="{ row, index }">
          <Button v-if="row.finish === 0" type="warning" size="small" @click="abort(row)">{{ $t('abort') }}</Button>
          <Button v-else-if="row.exe_status === 'done'" type="success" size="small" @click="quickShow(row)">{{ $t('exeSuccess') }}</Button>
          <Button v-else-if="row.exe_status === 'rerun'" loading type="warning" size="small" >{{ $t('reExecuting') }}</Button>
          <div v-else>
            <Button type="warning" style="margin-right: 5px" size="small" @click="quickShow(row)">{{ $t('exeFailed') }}</Button>
            <Button type="error" style="margin-right: 5px" size="small" @click="rerun(row)">{{ $t('rerun') }}</Button>
            <Button type="error" size="small" @click="continueRun(row)">{{ $t('continueRun') }}</Button>
          </div>
        </template>
      </Table>
        
    </Card>

    <BackTop :height="100" :bottom="200">
      <div class="top">
        <Tooltip :content="$t('backTop')" placement="bottom">
          <Icon type="ios-arrow-up" />
        </Tooltip>  
      </div>
    </BackTop>

    <!--日志id列表-->
    <Drawer v-model="modalList" :mask-closable="false" :mask="false" scrollable draggable width="410px">
      <p style="font-weight:800;font-size:18px">{{currentTarget}}</p>
      <br/>
      <Select :placeholder="$t('selectRunTarget')" @on-change="refreshDataDetail" clearable>
        <Option v-for="item in runTargetIdList" :value="item" :key="item">{{ item }}</Option>
      </Select>
      <Table stripe :columns="columnsDetail" :data="dataDetail" @on-row-click="showDetail" :show-header="false"></Table>
    </Drawer>

    <!--命令的详细信息-->
    <Modal v-model="modalDetail" scrollable width="55%">
      <template #header>
        <p>{{detailTitle}}</p>
      </template>
      <div>
        <Table border stripe :columns="columnsDetailInfo" :data="dataDetailInfo" :show-header="false" :no-data-text="$t('noCommandInfo')" @on-select=detailSelect @on-selection-change=detailChange></Table>
        {{selectionKeyStr}}
      </div>
      <template #footer>
        <div v-if="pauseOpt">
          <Tooltip :content="$t('pauseAbort')" placement="top">
            <Button type="warning" shape="circle" icon="md-close" @click.native="pauseAbort"></Button>
          </Tooltip>
          <Tooltip :content="$t('pauseRunAll')" placement="top">
            <Button type="info" shape="circle" icon="md-checkmark" @click.native="pauseRunAll"></Button>
          </Tooltip>
          <Tooltip :content="$t('pauseRunNext')" placement="top">
            <Button type="info" shape="circle" icon="md-fastforward" @click.native="pauseRunNext"></Button>
          </Tooltip>
          <Tooltip :content="$t('prePage')" placement="top">
            <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="showDetailPre"></Button>
          </Tooltip>
          <Tooltip :content="$t('nextPage') " placement="top">
            <Button type="primary" shape="circle" icon="md-arrow-forward" ghost @click.native="showDetailNext"></Button>
          </Tooltip>
          <Tooltip :content="$t('refresh')" placement="top" style="margin-right: 20px">
            <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshDetailInfo"></Button>
          </Tooltip>
        </div>
        <div v-else>
          <Tooltip :content="$t('prePage')" placement="top" style="margin-right: 0.5%">
            <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="showDetailPre"></Button>
          </Tooltip>
          <Tooltip :content="$t('nextPage') " placement="top" style="margin-right: 0.5%">
            <Button type="primary" shape="circle" icon="md-arrow-forward" ghost @click.native="showDetailNext"></Button>
          </Tooltip>
          <Tooltip :content="$t('refresh')" placement="top" style="margin-right: 0.5%">
            <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshDetailInfo"></Button>
          </Tooltip>
          <Tooltip :content="$t('downloadColumn')" placement="top" style="margin-right: 0.5%">
            <Button type="primary" shape="circle" icon="md-arrow-down" ghost @click.native="download"></Button>
          </Tooltip>
          <Tooltip :content="$t('resultFormat')" placement="top" style="margin-right: 1%">
            <Button type="primary" shape="circle" icon="md-list-box" ghost @click.native="resultFormat"></Button>
          </Tooltip>
        </div>
      </template>
    </Modal>

    <Modal v-model="modalSummary" scrollable width="55%">
      <template #header>
        <div style="float:left;margin-top:5px;width:300px;">{{ $t('summaryTitle') }}</div>
        <div>
          <Switch size="large" true-color="#ff4949" false-color="#13ce66" @on-change="summaryFilter">
            <template #open>
              <span>{{ $t('stderr') }}</span>
            </template>
            <template #close>
              <span>{{ $t('stdout') }}</span>
            </template>
          </Switch>
        </div>
      </template>
      <div>
        <Table border stripe :columns="columnsSummaryInfo" :data="summaryInfo" ></Table>
      </div>
      <template #footer>
        <Tooltip :content="$t('refresh')" placement="top" style="margin-right: 20px">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshSummary"></Button>
        </Tooltip>
      </template>
    </Modal>

    <Modal v-model="modalRerun" scrollable width="55%" >
      <template #header>
        <p>{{runTitle}}</p>
      </template>
      <div>
        <Form :label-width="realLabelwidth">
          <Divider>readonly</Divider>
          <FormItem v-for="(item, i) in checkReadonly" :key="item.key" v-bind:label="item.key">
            <Input v-model="item.value" readonly></Input>
          </FormItem>

          <Divider>session</Divider>
          <FormItem v-for="(item, i) in checkSession" :key="item.key" v-bind:label="item.key">
            <Input v-model="item.value"></Input>
          </FormItem>
          <Tooltip :content="$t('sessionTips')" placement="left" style="float:right;margin-right:0px">
            <Button size="large" @click.native="setRerunSession" >{{ $t('saveSession') }}</Button>
          </Tooltip>

          <Divider>global</Divider>
          <Tooltip :content="$t('setGlobalVarsTips')" placement="left" style="float:right;margin-right:0px">
            <Button size="large" @click.native="modalGolbalVars=true" >{{ $t('setGolbalVars') }}</Button>
          </Tooltip>

          <Divider v-if="checkChangable.length > 0">changable</Divider>
          <FormItem v-for="(item, i) in checkChangable" :key="item.key" v-bind:label="item.key">
            <InputNumber v-if="item.key === 'begin_line'" v-model="item.value" :max="parseInt(selectParams.playbook_rownum)" :min="1"></InputNumber>
          </FormItem>
        </Form>
      </div>
      <template #footer>
          <Button type="primary" size="large" @click.native="realRerun">{{ $t('run') }}</Button>
      </template>
    </Modal>

    <Modal v-model="modalSelect" @on-ok="setSelect" scrollable width="55%" >
      <template #header>
        <p>{{ $t('selectTitle') }}  {{selectVar}}</p>
      </template>
      <div>
      <Select v-model="selectValue" :placeholder="$t('selectTips')" multiple filterable>
        <Option v-for="j in selectList" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
      </Select>
      </div>
    </Modal>

    <Modal v-model="modalGolbalVars" footer-hide scrollable width="55%" >
      <template #header>
        <p>
          <span>{{ $t('setGolbalVarsTitle') }}</span>
        </p>
      </template>
      <safe-form ref="formGolbalVars" :labelwidth="100" :dynamicData="globalVars" :dynamic="true" :inputValueTips="$t('inputGlobalVarsTips')"
        @primaryClick="globalVarsCommit" @secondClick="modalGolbalVars=false" >
      </safe-form>
      
    </Modal>

  </div>
</template>

<script setup>
  import { ref, onMounted, reactive, getCurrentInstance } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import order from '@/api/order'
  import exec from '@/api/exec'
  import util from '@/libs/util'
  import safeForm from '@/components/common/safeForm.vue'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  const route = useRoute()
  const router = useRouter()
  

  const modalRerun = ref(false)
  const modalList = ref(false)
  const modalDetail = ref(false)
  const modalSummary = ref(false)
  const modalSelect = ref(false)
  const modalGolbalVars = ref(false)
  
  const summaryInfo = ref([])
  const columnsSummaryInfo = reactive([
    { key: 'target', align: 'center', width: 440, resizable: true, sortable: true },
    { key: 'last_stdout', sortable: true }
  ])
  
  const dataDetail = ref([])
  const columnsDetail = reactive([
    { key: 'index', align: 'center', width: 60 },
    { align: 'center', key: 'log_id', minWidth: 300 }
  ])
  
  const detailTitle = ref('')
  const dataDetailInfo = ref([])
  const columnsDetailInfo = reactive([
    { type: 'selection', width: 60, align: 'center' },
    { key: 'key', align: 'center', sortType: 'desc', width: 150 },
    { key: 'value' }
  ])
  
  const workid = ref('')
  const playbook = ref('')
  const targetAmount = ref(0)
  
  const sum = reactive({ 'executing': 0, 'done': 0, 'fail': 0, 'all': 0 })
  
  const columnsName = reactive([
    { title: 'exe info', key: 'sql' }
  ])
  
  const tabcolumns = reactive([
    { title: t('executeTarget'), key: 'target', sortable: true, resizable: true, width: 440 },
    { title: t('currentStatus'), key: 'exe_status', align: 'center', sortable: true, width: 130 },
    { title: t('exeRownum'), key: 'exe_rownum', align: 'center', sortable: true, width: 130 },
    { title: t('rownum'), key: 'playbook_rownum', align: 'center', width: 130 },
    { title: t('beginDate'), key: 'begin_date', sortable: true, width: 200 },
    { title: t('endDate'), key: 'end_date', sortable: true, width: 200 },
    { title: t('endure'), key: 'endure', sortable: true, width: 130 },
    { title: t('action'), slot: 'action', align: 'center', minWidth: 300 }
  ])
  
  const TableDataNew = ref([])
  const selectParams = ref({})
  const checkFormItem = ref([])
  const conCheckFormItem = ref([])
  const checkSession = ref([])
  const checkReadonly = ref([])
  const checkChangable = ref([])
  const globalVars = ref({})
  const runTitle = ref('')
  const currentTarget = ref('')
  const finishOnly = ref(false)
  const stdoutSummary = ref(true)
  const newJobId = ref('')
  const pauseOpt = ref(false)
  const selectVar = ref('')
  const selectValue = ref('')
  const selectList = ref([])
  const selectionKey = ref([])
  const selectionKeyStr = ref('')
  const targetId = ref('')
  const runTargetIdList = ref([])
  const realLabelwidth = ref(100)
  const exelist = ref([])
  const pauseTarget = ref('')
  const selectID = ref('')
  const detailIndex = ref(1)
  const logID = ref('')
  const currentTargetId = ref('')
  const currentLogID = ref('')
  
  
  const orderInfo = () => {
    let path = router.resolve({ path: '/orderInfo', query: { workid: workid.value } }).href
    window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
  }
  
  const playbookDetial = () => {
    let path = router.resolve({ path: '/playbook', query: { playbook: playbook.value, title: workid.value } }).href
    window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
  }
  
  const abort = (params) => {
    util.notice(proxy, t('abortTips'), 'info')
    order.abort(params['target_id'])
      .then(res => {
        if (parseFloat(res.data.abort_time)) {
          util.notice(proxy, t('shouldNotAbort') + ' ' + params['target'], 'warning')
        } else {
          util.notice(proxy, t('abort') + ' ' + params['target'], 'success')
        }
        if (finishOnly.value) {
          getCurrentPage(1)
        } else {
          getCurrentPage()
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  let begin_line = 0 
  
  const continueRun = (params, index) => {
    runTitle.value = t('continueExeInfo')
    begin_line = -1
    getRerunInfo(params, params['target_id'])
    newJobId.value = ''
  }
  
  const rerun = (params, index) => {
    runTitle.value = t('rerunInfo')
    begin_line = 0
    getRerunInfo(params, params['target_id'])
    newJobId.value = ''
  }
  
  const getRerunInfo = (params, targetId) => {
    checkSession.value = checkReadonly.value = checkChangable.value = []
    globalVars.value = {}
    modalRerun.value = true
    selectParams.value = params
    currentTargetId.value = targetId
    exec.getRerunInfo(workid.value, selectParams.value['target'], targetId)
      .then(res => {
        if (begin_line === 0) {
          res.data['data']['changable']['begin_line'] = 0
        }
        checkSession.value = util.dict2arry(res.data['data']['session'], 'key', 'value')
        checkReadonly.value = util.dict2arry(res.data['data']['readonly'], 'key', 'value')
        checkChangable.value = util.dict2arry(res.data['data']['changable'], 'key', 'value')
        globalVars.value = res.data['data']['global']
        util.dictKeys(res.data['data']['session']).forEach((item, i) => {
          if (realLabelwidth.value < item.length * 8) {
            realLabelwidth.value = item.length * 8
          }
        })
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const setRerunSession = () => {
    let newSession = util.arry2dict(checkSession.value, 'key', 'value')
    exec.postTempSession(newSession)
      .then(res => {
        if (res.data['status'] >= 1) {
          util.notice(proxy, t('sessionSaveSuccess'), 'info')
          console.log(res.data)
          newJobId.value = res.data['job_id']
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const realRerun = () => {
    let x = util.arry2dict(checkChangable.value, 'key', 'value')
    if (x['begin_line']) {
      begin_line = x['begin_line']
    }
    selectParams.value['exe_status'] = 'rerun'
    modalRerun.value = false
    exec.rerun(workid.value, selectParams.value['target'], selectParams.value['target_id'], begin_line, newJobId.value)
      .then(res => {
        console.log(res.data)
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const realQuickShow = (targetId) => {
    order.exelist(targetId)
      .then(res => {
        pauseTarget.value = ''
        if (res.data['pause']) {
          pauseTarget.value = targetId
        }
        console.log(pauseTarget.value)
        exelist.value = res.data['exelist']
        dataDetail.value = []
        res.data['exelist'].forEach((item, index) => {
          dataDetail.value.push({ 'index': index + 1, 'log_id': item })
        })
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  
  const quickShow = (params, index) => {
    modalList.value = !modalList.value
    if (modalList.value) {
      currentTarget.value = params['target']
      currentTargetId.value = params['target_id']
      runTargetIdList.value = []
      order.runTargetList(workid.value, currentTarget.value)
        .then(res => {
          runTargetIdList.value = res.data['data']
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
      realQuickShow(currentTargetId.value)
    } else {
      currentTargetId.value = ''
    }
  }
  
  const showDetailPre = () => {
    if (detailIndex.value > 1) {
      detailIndex.value = detailIndex.value - 1
    } else {
      proxy.$Message.info(t('noForward'))
    }
    realShowDetail(exelist.value[detailIndex.value - 1], detailIndex.value)
    console.log(exelist.value[detailIndex.value - 1], detailIndex.value)
  }
  
  const showDetailNext = () => {
    realQuickShow(currentTargetId.value)
    if (detailIndex.value < exelist.value.length) {
      detailIndex.value = detailIndex.value + 1
    } else {
      proxy.$Message.info(t('noBackward'))
    }
    realShowDetail(exelist.value[detailIndex.value - 1], detailIndex.value)
  }
  
  const showDetail = (params, index) => {
    realShowDetail(params['log_id'], params['index'])
  }
  
  const realShowDetail = (logID, index) => {
    modalDetail.value = true
    currentLogID.value = logID
    detailIndex.value = index
    detailTitle.value = index + '-------------' + logID
    refreshShowDetail(logID)
  }
  
  const refreshShowDetail = (logID) => {
    selectionKey.value = []
    selectionKeyStr.value = ''
    order.exedetail(logID)
      .then(res => {
        if (res.data['status'] > 0) {
          if (res.data['select']) {
            modalSelect.value = true
            selectVar.value = res.data['select_var']
            selectList.value = res.data['select']
            selectID.value = logID
          }
          pauseOpt.value = false
          if (pauseTarget.value) {
            // 当前执行信息为 {step: "pausing"} 则显示断点执行的操作
            let tmp_exedetail = res.data['exedetail']
            if (tmp_exedetail['step'] === 'pausing') {
              pauseOpt.value = true
            }
          }
          dataDetailInfo.value = util.dict2arry(res.data['exedetail'], 'key', 'value')
        } else {
          proxy.$Message.error(res.data['msg'])
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const setSelect = () => {
    if (selectValue.value.length) {
      order.setSelect(selectID.value, selectValue.value)
        .then(res => {
          util.notice(proxy, t('commitSelectSuccess'), 'success')
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      proxy.$Message.error(t('emptySelectWarn'))
    }
  }
  
  const refreshDetailInfo = () => {
    refreshShowDetail(currentLogID.value)
    util.notice(proxy, t('refreshSuccess'), 'fast')
  }
  
  const refreshCurrentPage = () => {
    try {
      if (finishOnly.value) {
        getCurrentPage(1)
      } else {
        getCurrentPage()
      }
      util.notice(proxy, t('refreshSuccess'), 'fast')
    } catch (err) {
      util.notice(proxy, err, 'error')
    }
  }
  
  const summary = () => {
    modalSummary.value = true
    order.summary(workid.value)
      .then(res => {
        summaryInfo.value = res.data['data']
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const refreshSummary = () => {
    summary()
    util.notice(proxy, t('refreshSuccess'), 'fast')
  }
  
  const finishFilter = () => {
    finishOnly.value = !finishOnly.value
    if (finishOnly.value) {
      getCurrentPage(1)
    } else {
      getCurrentPage()
    }
  }
  
  const summaryFilter = () => {
    stdoutSummary.value = !stdoutSummary.value
    if (stdoutSummary.value) {
      columnsSummaryInfo[1].key = 'last_stdout'
    } else {
      columnsSummaryInfo[1].key = 'last_stderr'
    }
  }
  
  const getCurrentPage = (exclude = '') => {
    if (modalList.value) {
      realQuickShow(currentTargetId.value)
    }
    workid.value = route.query['workid']
    if (workid.value) {
      sessionStorage.setItem('orderListWorkid', workid.value)
    } else {
      workid.value = sessionStorage.getItem('orderListWorkid')
    }
    order.detail(workid.value, exclude)
      .then(res => {
        if (res.data['status'] >= 1) {
          sum.value = res.data['sum']
          TableDataNew.value = res.data['data']
          targetAmount.value = TableDataNew.value.length
          playbook.value = res.data['playbook']
          TableDataNew.value.forEach((item) => {
            if (item['begin_date']) {
              item['begin_date'] = util.formatDate(parseFloat(item['begin_date']))
            }
            if (item['end_date']) {
              item['end_date'] = util.formatDate(parseFloat(item['end_date']))
            }
          })
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const pauseAbort = () => {
    exec.pauseRun(pauseTarget.value, 'abort')
      .then(res => {
        refreshCurrentPage()
        modalDetail.value = false
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const pauseRunAll = () => {
    exec.pauseRun(pauseTarget.value, '-1', workid.value, detailIndex.value)
      .then(res => {
        refreshCurrentPage()
        modalDetail.value = false
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const pauseRunNext = () => {
    exec.pauseRun(pauseTarget.value, '0')
      .then(res => {
        showDetailNext()
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const detailSelect = (selection, row) => {
    selectionKey.value.push(row.key)
  }
  
  const detailChange = (selection) => {
    let realSelectionKey = []
    for (let k of selection) {
      if (k.key) {
        realSelectionKey.push(k.key)
      }
    }
    for (let i in selectionKey.value) {
      if (realSelectionKey.indexOf(selectionKey.value[i]) < 0) {
        selectionKey.value.splice(i, 1)
      }
    }
    selectionKeyStr.value = ''
    for (let k of selectionKey.value) {
      selectionKeyStr.value += ' ' + k
    }
  }
  
  const download = () => {
    if (selectionKey.value.length) {
      order.download(workid.value, detailIndex.value, selectionKey.value)
        .then(res => {
          let blob = new Blob([res.data])
          let filename = decodeURIComponent(res.headers['filename'])
          util.downloadBlob(blob, filename)
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      proxy.$Message.error(t('emptyFieldWarn'))
    }
  }
  
  const resultFormat = () => {
    let path = router.resolve({ path: '/execDetailViewer', query: { logID: currentLogID.value } }).href
    console.log(path)
    window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
  }
  
  const globalVarsCommit = (data) => {
    globalVars.value = data
    exec.postGolbalVars(currentTargetId.value, data)
      .then(res => {
        if (res.data['status'] >= 1) {
          util.notice(proxy, t('globalVarsSaveSuccess'), 'info')
          console.log(res.data)
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const refreshDataDetail = (targetId) => {
    if (targetId == undefined) {
      targetId = runTargetIdList.value[0]
    }
    realQuickShow(targetId)
  }
  
  
  onMounted(() => {
    getCurrentPage()
  })
</script>