<template>
  <div>
    <Card style="width: 100%">
      <template #title>
        <Tooltip :content="$t('modifySelectedInfo')" placement="bottom-start">
          <Button type="info" icon="md-list" @click.native="switchTmplType=true" ></Button>
        </Tooltip>
        <Button type="info" icon="md-add" @click.native="targetinfoAdd()" style="margin-left: 0.2vw">{{ $t('addTemplate') }}</Button>

      </template>
      <Table border :columns="columns" :data="tableData" @on-row-dblclick="targetinfoDetail" stripe size="small">
        <template #operation="{ row, index }">
          <Button type="info" size="small" style="margin-right: 50px" @click="generateJob(row)">{{ $t('createJob') }}</Button>
          <Button type="success" size="small" style="margin-right: 50px" @click="targetinfoDetail(row)">{{ $t('detail') }}</Button>
          <Button type="error" size="small" @click="delTarget(row)">{{ $t('delete') }}</Button>
        </template>
      </Table>
      <br>
      <Page :total="pageNumber" @on-change="getCurrentPage" :model-value="currentPage" :page-size="pagesize" @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
    </Card>
    
    <Modal v-model="switchTmplDetail" footer-hide width="800">
      <template #header>
        <p>
          <span>{{modelTitle}}</span>
        </p>
      </template>
      <safe-form ref="tmplDetail" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formSubmit" @secondClick="switchTmplDetail = false"
        :primaryButtonName="isAdd? $t('add') : $t('update') ">
      </safe-form>
    </Modal>

    <Modal v-model="switchTmplType" width="50%" @on-cancel="cancelFormInfo">
      <template #header>
        <p>
          <span>{{ $t('modifyTips') }}</span>
        </p>
      </template>
      <Form :label-width="80">
        <FormItem label="target_type">
          <Select v-model="targetType" filterable multiple allow-create @on-create="putTargetType">
            <Option v-for="item in targetTypeTmp" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="job_type">
          <Select v-model="jobType" filterable multiple allow-create @on-create="putJobType">
            <Option v-for="item in jobTypeTmp" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
      </Form> 
      <template #footer>
        <Button type="primary" @click="cancelFormInfo">{{ $t('cancel') }}</Button>
        <Button @click="commitFormInfo">{{ $t('commit') }}</Button>
      </template>
    </Modal>
    
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useAppStore } from '@/store'
  import exec from '@/api/exec'
  import vconfig from '@/api/config'
  import util from '@/libs/util'
  import config from '@/config/config'
  import safeForm from '@/components/common/safeForm.vue'
  
  const appStore = useAppStore()
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  // 表格与分页状态
  const tableData = ref([])
  const pagesize = ref(16)
  const pageNumber = ref(1)
  const currentPage = ref(1)
  const pageSizeOpts = ref([10, 20, 40, 80, 100, 200])
  
  // 表单与模态框状态
  const switchTmplType = ref(false)
  const switchTmplDetail = ref(false)
  const modelTitle = ref('')
  const isAdd = ref(true)
  const name_o = ref('')
  
  // 下拉选项数据
  const jobType = ref([])
  const targetType = ref([])
  const jobTypeTmp = ref([])
  const targetTypeTmp = ref([])
  const jobTypeOld = ref([])
  const targetTypeOld = ref([])
  
  // 表格列定义
  const columns = ref([
    { title: 'name', key: 'name_s', width: 250, sortable: true },
    { 
      title: 'target_type', 
      key: 'target_type', 
      align: 'center', 
      width: 150, 
      sortable: true,
      filters: [], 
      filterMethod (value, row) { return row.target_type === value } 
    },
    { 
      title: 'type', 
      key: 'job_type', 
      align: 'center', 
      width: 100, 
      sortable: true,
      filters: [], 
      filterMethod (value, row) { return row.job_type === value } 
    },
    { title: 'playbook', key: 'playbook', tooltip: true, sortable: true, minWidth: 300 },
    { title: 'comment', key: 'comment', width: 250, tooltip: true, sortable: true },
    { 
      title: t('operation'), 
      slot: 'operation', 
      align: 'center', 
      width: 450 
    }
  ])
  
  // 表单字段定义 (原始模板)
  const formItemOrigin = reactive([
    { key: 'name', label: 'name', comment: t('templateName') },
    { key: 'target_type', label: 'target_type', comment: t('targetType'), select: [] },
    { key: 'playbook', label: 'playbook', comment: 'playbook' },
    { key: 'job_type', label: 'job_type', comment: t('jobType'), select: [] },
    { key: 'comment', label: 'comment', comment: t('comment') }
  ])
  
  const formItem = ref([])
  const formItemValidate = reactive({
    name: [
      { required: true, message: t('inputTemplateNameTips'), trigger: 'blur' },
      { validator: util.validatorGenerator(), trigger: 'blur' }
    ],
    target_type: [
      { required: true, message: t('selectTargetTypeTips'), trigger: 'blur' }
    ],
    playbook: [
      { required: true, message: t('inputPlaybookTips'), trigger: 'blur' },
      { validator: util.validatorGenerator(), trigger: 'blur' }
    ],
    job_type: [
      { required: true, message: t('selectJobTypeTips'), trigger: 'blur' }
    ],
    comment: [
      { required: true, message: t('inputCommentTips'), trigger: 'blur' }
    ]
  })
  
  
  // 初始化获取数据
  const initGetData = () => {
    getJobTypes()
    getTargetTypes()
    getCurrentPage()
  }
  
  const cancelFormInfo = () => {
    switchTmplType.value = false
    jobType.value = util.dictDeepCopy(jobTypeOld.value)
    jobTypeTmp.value = util.dictDeepCopy(jobTypeOld.value)
    targetType.value = util.dictDeepCopy(targetTypeOld.value)
    targetTypeTmp.value = util.dictDeepCopy(targetTypeOld.value)
  }
  
  const putJobType = (val) => {
    jobTypeTmp.value.push(val)
  }
  
  const putTargetType = (val) => {
    targetTypeTmp.value.push(val)
  }
        
  // 获取任务类型
  const getJobTypes = async () => {
    try {
      const res = await vconfig.getKey('job_types')
      const data = res.data['data']
      
      jobTypeOld.value = util.dictDeepCopy(data)
      jobTypeTmp.value = util.dictDeepCopy(data)
      jobType.value = util.dictDeepCopy(data)
      
      // 更新表单选项
      formItemOrigin.forEach(item => {
        if (item.key === 'job_type') {
          item.select = data
        }
      })
      
      // 更新表格筛选器
      columns.value.forEach(col => {
        if (col.key === 'job_type') {
          col.filters = data.map(t => ({ label: t, value: t }))
        }
      })
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  // 获取目标类型
  const getTargetTypes = async () => {
    try {
      const res = await vconfig.getKey('target_types')
      const data = res.data['data']
      
      targetTypeOld.value = util.dictDeepCopy(data)
      targetTypeTmp.value = util.dictDeepCopy(data)
      targetType.value = util.dictDeepCopy(data)
      
      formItemOrigin.forEach(item => {
        if (item.key === 'target_type') {
          item.select = data
        }
      })
      
      columns.value.forEach(col => {
        if (col.key === 'target_type') {
          col.filters = data.map(t => ({ label: t, value: t }))
        }
      })
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  // 提交表单信息 (保存配置)
  const commitFormInfo = async () => {
    switchTmplType.value = false
    
    let updateJobTypes = false
    let updateTargetTypes = false
  
    // 比较并更新 jobType
    if (JSON.stringify(jobType.value) !== JSON.stringify(jobTypeOld.value)) {
      try {
        const res = await vconfig.postKey('job_types', jobType.value, 'set')
        if (res.data['status'] >= 1) {
          util.notice(proxy, 'job_types ' + t('modifySuccess'), 'success')
          updateJobTypes = true
        } else {
          util.notice(proxy, `job_types ${res.data['msg']}`, 'warning')
        }
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
    }
  
    // 比较并更新 targetType
    if (JSON.stringify(targetType.value) !== JSON.stringify(targetTypeOld.value)) {
      try {
        const res = await vconfig.postKey('target_types', targetType.value, 'set')
        if (res.data['status'] >= 1) {
          util.notice(proxy, 'target types ' + t('modifySuccess'), 'success')
          updateTargetTypes = true
        } else {
          util.notice(proxy, `target types ${res.data['msg']}`, 'warning')
        }
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
    }
  
    // 如果有更新，重新拉取数据以同步 UI
    if (updateJobTypes) {
        getJobTypes()
    }
    if (updateTargetTypes) {
        getTargetTypes()
    }
  }
  
  // 表格行操作：详情
  const targetinfoDetail = (row) => {
    const info = util.dictDeepCopy(row)
    info['name'] = info['name_s']
    name_o.value = row['name']
    
    formItem.value = util.dictDeepCopy(formItemOrigin)
    formItem.value.forEach(item => {
      item['value'] = info[item['key']]
    })
    
    switchTmplDetail.value = true
    isAdd.value = false
    modelTitle.value = t('templateDetail')
  }
  
  // 新增模板
  const targetinfoAdd = () => {
    switchTmplDetail.value = true
    formItem.value = formItemOrigin
    isAdd.value = true
    modelTitle.value = t('addTemplate')
  }
  
  // 表单提交
  const formSubmit = (data) => {
    const formInfo = util.dictDeepCopy(data)
    formInfo['name'] = route.name + ':' + formInfo['name']
    if (!isAdd.value) {
      formInfo['name_o'] = name_o.value
    }
    addTarget(formInfo)
    switchTmplDetail.value = false
  }
  
  // 生成任务
  const generateJob = (row) => {    
    const tmplInfo = { ...row }
    //const tmplInfo = util.dictDeepCopy(row)
    tmplInfo['tmpl'] = tmplInfo['name']
    tmplInfo['name'] = tmplInfo['name_s']
    tmplInfo['target'] = ''
    
    const x = ['name_s', 'target_type', 'playbook', 'job_type', '_index', '_rowKey']
    x.forEach(key => delete tmplInfo[key])

    router.push({ 
      name: 'execDetail', 
      query: { row: JSON.stringify(tmplInfo), tag: 'add' } 
    })
    appStore.setTagBreadBeforeOpen('execDetail')
  }
  
  // 分页处理
  const getCurrentPageNew = (size) => {
    pagesize.value = size
    getCurrentPage(1)
  }
  
  const getCurrentPage = async (page) => {
    if (!page) {
      page = sessionStorage.getItem('tmplexecCurrentpage') || 1
    }
    currentPage.value = parseInt(page)
    sessionStorage.setItem('tmplexecCurrentpage', page)
  
    const filter = route.name + ':*'
    
    try {
      const res = await exec.getExecutionInfo(filter, page, pagesize.value, 'name')
      if (res.data['data'].length === 0 && parseInt(page) > 1 ) {
        getCurrentPage(parseInt(page)-1)
        return
      }
      tableData.value = res.data.data
      tableData.value.forEach(item => {
        item['name_s'] = item['name'].split('tmpl:')[1]
      })
      pageNumber.value = parseInt(res.data['page'])
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  // 删除操作
  const delTarget = (d) => {
    proxy.$Modal.confirm({
      'title': t('confirmDelete') + ` ${d.name} ?`,
      'onOk': () => { realDelTarget(d.name) },
      'okText': t('delete'),
      'cancelText': t('cancel'),
      'width': '700px'
    })
  }
  
  const realDelTarget = async (dName) => {
    try {
      const res = await exec.delExecutionInfo(dName)
      if (res.data['status'] === 1) {
        getCurrentPage()
        util.notice(proxy, `${dName} ${t('deleteSuccess')}`, 'success')
      } else if (res.data['status'] === 0) {
        util.notice(proxy, `${dName} ${t('deleteFailed')}`, 'error')
      }
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  const addTarget = async (info) => {
    try {
      const res = await exec.postExecutionInfo(info)
      const addName = info['name'].split('tmpl:')[1]
      if (res.data['status'] >= 1) {
        util.notice(proxy, `${addName} ${res.data['msg']}`, 'success')
      } else {
        util.notice(proxy, `${addName} ${res.data['msg']}`, 'warning')
      }
      getCurrentPage()
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  initGetData()
  
</script>
