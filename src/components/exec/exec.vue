<template>
  <div>
    <Card>
      <Table border stripe :columns="columns" :data="tableData" size="small" @on-row-dblclick="quickShow">
        <template #action="{ row, index }">
          <Button type="info" size="small" style="margin-right: 50px" @click="execJob(row)">{{ $t('run') }}</Button>
          <Button type="success" size="small" style="margin-right: 50px" @click="targetinfoDetail(row)">{{ $t('setting') }}</Button>
          <Button type="error" size="small" @click="delTarget(row)">{{ $t('delete') }}</Button>
        </template>
      </Table>
      <br>
      <Page :total="pageNumber" @on-change="getCurrentPage" :model-value="currentPage" :page-size="pagesize"  @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
    </Card>
    
    
    <Modal v-model="switchSubTargetSelect"  width="800"  :title="$t('executeSubTarget')">
      <Tree :data="subTargetTreeData" ref="subTargetTree" show-checkbox></Tree>
      
      <template #footer>
        <Button type="primary" @click="subTargetSelect"> {{ $t('confirm') }} </Button>
      </template>
    </Modal>

    <Modal v-model="switchTargetSelect"  width="800"  :title="$t('executeTarget')">
      <Tree :data="targetTreeData" ref="targetTree" show-checkbox></Tree>
      
      <template #footer>
        <Button type="primary" @click="targetSelect"> {{ $t('confirm') }} </Button>
      </template>
    </Modal>

    <Modal v-model="switchExecutionInfo" @on-cancel="current = 0" scrollable :mask-closable="false" width="50%">

      <div v-if="current === 0">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('executeTarget') }}</b>

          <Button v-if="targetConstict.length === 0 || showTargets.length != 0" type="info" @click="selectTarget">{{ $t('reselect target') }}</Button>
          <br><br>
        </div>
        
        <!-- 设置执行对象字段、创建任务时不选择执行对象，两个都满足时才在运行时构造执行对象 -->
        <Form v-if="targetConstict.length != 0  && showTargets.length === 0" :label-width="100">
          <FormItem v-for="(item, i) in targetConstict" :key="i" :label="item.field">
            
            <Input v-model="item.value" :placeholder="item.comment" @click.native="subTargetAdd(item)" clearable></Input>
          </FormItem>
          
        </Form>
        <div v-else>
          <p v-for="item in showTargets" :key="item">{{item}}</p>
        </div>
        
      </div>

      <div v-else-if="current === 1">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('sessionParamsSetting') }}</b>
          <br><br>
        </div>
        <constrict-form ref="varsForm" :formdata="sessionFull" :nullInfo="$t('noSessionNeed')" :buttonTooltip="$t('saveSessionTips')" @buttonOperation="saveSession"></constrict-form>
      </div>
      
      <div v-else-if="current === 2">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('confirmRun') }}</b>
          <br><br>
        </div>
        <Table border stripe :columns="columnsInfo" :data="dataDetailInfo" :show-header="false" :no-data-text="$t('templateInfoFailed')"></Table>
      </div>
      
      <br>
      <Steps :current="current">
        <Step :title="$t('executeTarget')"></Step>
        <Step :title="$t('paramsSetting')"></Step>
        <Step :title="$t('confirmRun')"></Step>
      </Steps>
      
      <template #footer>
        <Button v-if="current != 0" @click="previous">{{ $t('previousStep') }}</Button>
        <Button v-if="current != 2" type="primary" @click="next">{{ $t('nextStep') }}</Button>
        <Button v-if="current === 2" type="primary" @click="commit">{{ $t('run') }}</Button>
        <Button v-if="current === 2" type="info" @click="debugRun">{{ $t('debugRun') }}</Button>
        <!--Button v-if="current === 2 && debugAble" type="info" @click="debugRun">{{ $t('debugRun') }}</Button-->
      </template>
    </Modal>

    <!--双击行时的弹框显示-->
    <Modal v-model="openshow" footer-hide width="50%">
      <template #header>
        <p>
          {{showTitle}}
        </p>
      </template>
      <Tabs value="target">
        <TabPane :label="$t('executeTarget')" name="target">
          <div>
            <p v-if="showTargets.length === 0" align="center">{{ $t('executeTargetEmpty') }}</p>
            <p v-else v-for="item in showTargets" :key="item">{{item}}</p>
          </div>
        </TabPane>
        <TabPane :label="$t('templateDetail')" name="tmpl">
          <Table border stripe :columns="columnsInfo" :data="tmplInfo" :show-header="false" :no-data-text="$t('templateInfoFailed')"></Table>
        </TabPane>
        <TabPane label="playbook" name="playbook">
          <Input v-model="playbookContent" type="textarea" :autosize="{minRows: 10,maxRows: 20}" placeholder="playbook is loading" readonly />
        </TabPane>
      </Tabs>
    </Modal>

  </div>
</template>

<script setup>
  //
  import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAppStore } from '@/store'
  import exec from '@/api/exec'
  import util from '@/libs/util'
  import file from '@/api/file'
  import target from '@/api/target'
  import constrictForm from '@/components/common/constrictForm.vue'
  
  //
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  const router = useRouter()
  const appStore = useAppStore()
  
  // Step 流程控制
  const current = ref(0)
  const openshow = ref(false)
  const showTitle = ref('')
  const showTargets = ref([])
  
  // 表单与模态框
  const switchExecutionInfo = ref(false)
  const formItem = ref({})
  const formComment = ref({})
  const formType = ref({})
  const formConstrict = ref({})
  const formKey = ref([])
  const formValidate = ref({})
  const openinfo = ref({})
  const openinfo_s = ref('')
  const execInfo = ref({})
  
  // 数据列表与表格
  const tmplInfo = ref([])
  const playbook = ref('')
  const playbookContent = ref('')
  const dataDetailInfo = ref([])
  const tmplInfoSort = ['name','target_type','playbook','job_type','comment']
  const dataDetailInfoSort = ['name','name_s','tmpl','number','target','comment']
  
  // UI Columns
  const columnsInfo = ref([
    { key: 'key', align: 'center', width: 150 },
    { key: 'value' }
  ])
  const columns = ref([
    { title: 'name', key: 'name_s', width: 300, sortable: true },
    { title: t('executeTargetNum'), key: 'number', align: 'center', width: 150, sortable: true },
    { title: t('template'), key: 'tmpl', width: 300, sortable: true },
    { title: t('comment'), key: 'comment', tooltip: true, sortable: true, minWidth: 300 },
    { title: t('operation'), slot: 'action', align: 'center', width: 450 }
  ])
  
  // 分页
  const tableData = ref([])
  const pagesize = ref(16)
  const pageNumber = ref(1)
  const currentPage = ref(1)
  const pageSizeOpts = ref([10,20,40,80,100,200])
  
  // 业务逻辑状态
  const filter = ref('')
  const sessionFull = ref([])
  const sessionInfo = ref([])
  const debugAble = ref(false)
  const opentarget = ref('')
  const targetConstict = ref([])
  const execExtraInfo = ref({})
  const switchSubTargetSelect = ref(false)
  const subTargetTreeData = ref([])
  const targetInfoOld = ref('')
  const shouldTagetCommit = ref(true)
  const targetName = ref('')
  const errFlag = ref(false)
  const debugList = ref([])
  
  const activeTargetConstict = ref({})
  const subTargetType = ref('')

  const switchTargetSelect = ref(false)
  const targetTreeData = ref([])
  const targetType = ref('') 
  
  const varsForm = ref(null)
  
  
  // Step 1: 上一步
  const previous = () => {
    if (current.value) {
      current.value -= 1
    }
  }
  
  // Step 2: 下一步
  const next = async () => {
    if (current.value === 0) {
      if (targetConstict.value.length && !showTargets.value.length) {
        // 如果需要构造对象，第一个tab点击下一步时，先保存对象
        let targetInfo = {}
        targetConstict.value.forEach((k, i) => {
          targetInfo[k['field']] = k['value']
        })
  
        if (shouldTagetCommit.value || targetInfoOld.value != JSON.stringify(targetInfo)) {
          targetInfoOld.value = JSON.stringify(targetInfo)
          targetName.value = 'container_auto_' 
                             + util.formatTimestamp((new Date().getTime()) / 1000)
                                .replace(/-/g, '').replace(/:/g, '').replace(/ /g, '_') 
                             + '_' + Math.round(Math.random() * 10000)
          targetInfo['name'] = targetName.value
  
          // 校验必填
          for (const [key, value] of Object.entries(targetInfo)) {
            if (value === undefined || value === null || value === '') {
              util.notice(proxy, key + t('shouldNotEmpty'), 'error')
              return
            }
          }
  
          try {
            const res = await target.addTarget(targetInfo)
            if (res.data['status'] < 1) {
              util.notice(proxy, `${res.data['msg']}`, 'warning')
            } else {
              shouldTagetCommit.value = false
              current.value += 1
              execExtraInfo.value = { 'number': 1, 'target': targetName.value }
            }
          } catch (error) {
            util.notice(proxy, error, 'error')
          }
        } else {
          current.value += 1
        }
      } else if (showTargets.value.length) {
        targetName.valule = showTargets.value.join(',')
        execExtraInfo.value = {'number': showTargets.value.length, 'target': targetName.value }
        current.value += 1
      } else {
        proxy.$Message.error(t('select at least one target'))
      }
      // 处理 select_field_key 类型的 Session 变量
      let targetNameForSession = targetName.value
      if (showTargets.value.length != 0) {
        targetNameForSession = showTargets.value[0]
      }

      if ( !targetNameForSession ) {
        return
      }
  
      sessionFull.value.forEach((sessionItem) => {
        if (sessionItem['type'] === 'select_field_key' || sessionItem['_type'] === 'select_field_key') {
          sessionItem['_type'] = 'select_field_key'
          sessionItem['type'] = 'select'
          if (!sessionItem.hasOwnProperty('constrict')) {
            proxy.$Message.error(t('select_field_key_SessionVarConstrictFieldMustExist'))
            return
          }
          if (!sessionItem.hasOwnProperty('_constrict')) {
            sessionItem['_constrict'] = sessionItem['constrict']
          }
  
          sessionItem['constrict'] = []
          setTimeout(async () => {
            try {
              const res = await target.getTargetDetail(targetNameForSession, sessionItem['_constrict'])
              if (res.data['status'] > 0) {
                if (res.data['status'] === 1) {
                  sessionItem['constrict'] = Object.keys(res.data['data'])
                } else {
                  console.log(res.data)
                  util.notice(proxy, targetNameForSession + ' ' + sessionItem['constrict'] + ' \n' + t('fieldOfTargetNotAnObject'), 'error')
                }
              } else {
                util.notice(proxy, targetNameForSession + res.data['msg'], 'error')
              }
            } catch (error) {
              util.notice(proxy, error, 'error')
            }
          }, 500)
        }
      })
    } else if (current.value === 1) {
      if (errFlag.value) {
        proxy.$Message.error(t('getPlaybookFailedTips'))
      } else if (JSON.stringify(formItem.value) === '{}') {
        current.value += 1
        summary(execExtraInfo.value)
      } else {
        // 获取表单数据
        sessionInfo.value = varsForm.value.getFormItem()
        sessionFull.value.forEach((item) => {
          item['value'] = sessionInfo.value[item['key']]
        })

        if (await varsForm.value.checkValidate()) {
          current.value += 1
          summary(execExtraInfo.value)
        } else {
          proxy.$Message.error(t('form.checkErr'))
        }
      }
    } else {
      current.value += 1
    }
  }
  
  // 保存 Session
  const saveSession = async (data) => {
    try {
      await exec.postSession(`${openinfo.value['name']}`, data)
      util.notice(proxy, t('sessionSaveSuccess'), 'info')
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  // 摘要生成
  const summary = (extraInfo) => {
    let rowinfo = util.dictDeepCopy(openinfo.value)
    for (let k in extraInfo) {
      rowinfo[k] = extraInfo[k]
    }
    try {
      delete rowinfo._index
      delete rowinfo._rowKey
    } finally {
      dataDetailInfo.value = util.dict2arry(rowinfo, 'key', 'value', dataDetailInfoSort)
    }
  }
  
  // 快速展示
  const quickShow = async (params, index) => {
    openshow.value = !openshow.value
    showTitle.value = params['name'].split('exec:')[1]
    showTargets.value = []
    if (params['target'] != '') {
      showTargets.value = params['target'].split(',')
    }
    tmplInfo.value = []
    playbookContent.value = ''
    try {
      let res = await exec.getExecutionInfo(`${params['tmpl']}`)
      
      let r = res.data['data'][0]
      playbook.value = r['playbook']
      tmplInfo.value = util.dict2arry(r, 'key', 'value', tmplInfoSort.value)
      try {
        let res2 = await file.getFileContent(playbook.value)
        if (res2.data['status'] > 0) {
          playbookContent.value = res2.data['content']
        } else {
          util.notice(proxy, res2.data['msg'], 'error')
        }
      } catch (error) {
        util.notice(proxy, error, 'error') 
      }
    } catch (error) {
      console.error(error)
      proxy.$Message.error(t('getTemplateFailedTips'))
    }
    
  }
  
  // 执行任务 (Exec Job)
  const execJob = async (row) => {
    showTargets.value = []
    if (row['target'] != '') {
      showTargets.value = row['target'].split(',')
    }
    openinfo.value = row
    openinfo_s.value = row['name_s']
  
    try {
      const res = await exec.getSession(`${row['name']}`)
      sessionFull.value = res.data['session']
      debugList.value = res.data['pause']
      targetConstict.value = res.data['target_constrict']
      targetType.value = res.data['target_type']
      
      if (!(debugList.value instanceof Object)) {
        debugList.value = [debugList.value]
      }
  
      formItem.value = util.arry2dict(sessionFull.value)
      errFlag.value = false
  
      switchExecutionInfo.value = !switchExecutionInfo.value
      if (targetConstict.value.length && !parseInt(row['number'])) {
        shouldTagetCommit.value = true
      }
    } catch (error) {
      errFlag.value = true
      formItem.value = {}
      formKey.value = []
      proxy.$Message.error(t('getSessionFailedTips'))
    }
  }
  
  const subTargetAdd = async (targetConstict) => {
    // 根据传入的constrict 显示选择树
    activeTargetConstict.value = targetConstict
    subTargetType.value = targetConstict['constrict']
    if (subTargetType.value != '') {
      switchSubTargetSelect.value = true
      let selectedItem = targetConstict['value']? [targetConstict['value']]: []
      try {
        let res = await target.getNameList(`${subTargetType.value}`)
        subTargetTreeData.value = []
        subTargetTreeData.value.push(util.formateTreeData(res.data['data'], selectedItem))
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
    } else {
      console.error(error)
      proxy.$Message.error(t('setTemplateTips'))
    }
  }
  
  const subTargetSelect = () => {
    let checkedleaf = util.getCheckedLeaf(subTargetTreeData.value)
    if (checkedleaf.length === 1) {
      switchSubTargetSelect.value = false
      // 即对subTargetAdd函数的对象的value属性进行赋值
      activeTargetConstict.value['value'] = checkedleaf[0]
    } else {
      proxy.$Message.error(t('onlyOneOndeSelectTips'))
    }
  }
  
  const realCommit = async (debug = 0) => {
    if (errFlag.value) {
      proxy.$Message.error(t('getPlaybookFailedTips'))
    } else {
      if (!debug) {
        debug = debugList.value
      }
      switchExecutionInfo.value = false
      proxy.$Message.info(t('afterCommitTips'))
  
      try {
        const res = await exec.postExecution(openinfo.value['name'], sessionInfo.value, String(debug), targetName.value)
        util.notice(proxy, `${openinfo.value['name_s']} ${t('commitBegin')}`, 'info')
        router.push({ name: 'orderDetail', query: { 'workid': res.data['data'] } })
        appStore.setTagBreadBeforeOpen('orderDetail')
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
    }
  }
  
  const commit = () => {
    realCommit()
  }
  const debugRun = () => {
    realCommit(1)
  }
  
  const targetinfoDetail = (row) => {
    execInfo.value = row
    execInfo.value['name'] = execInfo.value['name_s']
    delete execInfo.value['name_s']
    router.push({ 
      name: 'execDetail', 
      query: { row: JSON.stringify(execInfo.value), tag: 'update' } 
    })
    appStore.setTagBreadBeforeOpen('execDetail')
  }
  
  const getCurrentPageNew = (size) => {
    pagesize.value = size
    getCurrentPage(1)
  }
  
  const getCurrentPage = async (page) => {
    filter.value = router.currentRoute.value.name + ':*'
   
    if (!page) {
      page = sessionStorage.getItem('execCurrentpage') || 1
    }
    currentPage.value = parseInt(page)
    sessionStorage.setItem('execCurrentpage', page)
  
    try {
      const res = await exec.getExecutionInfo(filter.value, page, pagesize.value, 'name')
      if (res.data['data'].length === 0 && parseInt(page) > 1 ) {
        getCurrentPage(parseInt(page)-1)
        return
      } 
      tableData.value = res.data['data']
      tableData.value.forEach((item) => {
        item['name_s'] = item['name'].split('exec:')[1]
      })
      pageNumber.value = parseInt(res.data['page'])
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  // 删除目标
  const delTarget = (d) => {
    let delname = d.name
    proxy.$Modal.confirm({
      'title': t('confirmDelete') + ` ${delname} ?`,
      'onOk': () => { realDelTarget(delname) },
      'okText': t('delete'),
      'cancelText': t('cancel'),
      'width': '700px'
    })
  }
  
  const realDelTarget = async (delname) => {
    try {
      const res = await exec.delExecutionInfo(delname)
      if (res.data['status'] === 1) {
        getCurrentPage()
        util.notice(proxy, `${delname} ${t('deleteSuccess')}`, 'success')
      } else {
        util.notice(proxy, `${delname} ${t('deleteFailed')}`, 'error')
      }
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  const selectTarget = async () => {
    // console.log(showTargets.value,targetType.value)
    switchTargetSelect.value = true
    try {
      let res = await target.getNameList(`${targetType.value}*`)
      targetTreeData.value = []
      targetTreeData.value.push(util.formateTreeData(res.data['data'], showTargets.value))
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }

  const targetSelect = () => {
    let checkedleaf = util.getCheckedLeaf(targetTreeData.value)
    showTargets.value = checkedleaf
    targetName.value = showTargets.value.join(',')
    switchTargetSelect.value = false
  }
  
  onMounted(() => {
    getCurrentPage()
  })

</script>