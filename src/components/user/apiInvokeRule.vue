<template>
  <Card>
    <template #title>
      <Button type="info" icon="md-add" shape="circle" size="small" @click="addInvokeRule"></Button>
    </template>
    
    <div>
      <Table border :columns="invokeRuleColumns" :data="invokeRuleData" stripe>
        <template #path="{ row, index }"> 
          <Tag v-for="i in row.path"> {{ i }} </Tag>
        </template>
        <template #method="{ row, index }"> 
          <Tag v-for="i in row.method"> {{ i }} </Tag>
        </template>
        <template #source="{ row, index }"> 
          <Tag v-for="i in row.source"> {{ i }} </Tag>
        </template>

        <template #operation="{ row, index }">  
          <div>
            <Button type="success" style="margin-right: 50px" size="small" @click="detailInvokeRule(row)">{{ $t('detail') }}</Button>
            <Button type="error" size="small" @click="deleteInvokeRule(row)">{{ $t('delete') }}</Button>
          </div>
        </template>
      </Table>
    </div>
    <br>
    <Page :total="pagenumber" @on-change="refreshpage" :page-size="pagesize" ref="total" :model-value="currentPage" show-elevator show-total></Page>
  </Card>

  <Modal v-model="switchInvokeRule" footer-hide width="50%">
    <template #header>          
      <p>
        <span>{{ switchInvokeRuleTitle }}</span>
      </p>
    </template>

    <Form ref="invokeRuleForm" :label-width="150" :model="formValue"  :rules="formValidate">
      <FormItem v-for="i in Object.keys(formLabel)" :prop="i" :label="formLabel[i]" :key="i">

        <Select v-if="['path'].includes(i)" v-model="formValue[i]" :placeholder="formComment[i]" filterable clearable allow-create multiple>
          <Option v-for="j in formConstrict[i]" 
            :value="j[0]" :label="j[0]" :key="j[0]">
            <span>{{ j[0] }}</span>
            <span style="float:right;margin-right:3%;color:#ccc">{{ j[1] }}</span>
          </Option>
        </Select>

        <Select v-else-if="['method'].includes(i)" v-model="formValue[i]" :placeholder="formComment[i]" clearable multiple>
          <Option v-for="j in ['GET','POST','PUT','DELETE']" :value="j" :key="j">{{ j }}</Option>
        </Select>

        <Select v-else-if="['source'].includes(i)" v-model="formValue[i]" :placeholder="formComment[i]" filterable clearable allow-create multiple>
          <Option v-for="j in formConstrict[i]" :value="j[0]" :label="j[0]" :key="j[0]">
            <span>{{ j[0] }}</span>
            <span style="float:right;margin-right:3%;color:#ccc">{{ j[1] }}</span>
          </Option>
        </Select>

        <Input v-else v-model="formValue[i]" :placeholder="formComment[i]"></Input>
      </FormItem>

      <FormItem>
        <div style="float: right"> 
          <Button style="margin-right: 5px" @click="switchTokenDetail=!switchTokenDetail"> {{ $t('cancel') }} </Button>
          <Button v-if="isAdd" type="primary" @click="createInvokeRule()">{{ $t('create') }}</Button>
          <Button v-else type="primary" @click="modifyInvokeRule()">{{ $t('update') }}</Button>
        </div> 
      </FormItem>
    </Form>
  </Modal>

</template>


<script setup>
  //
  import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import token from '@/api/token'
  import util from '@/libs/util'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  const route = useRoute()
  

  const currentPage = ref(1)
  const pagesize = ref(13)
  const pagenumber = ref(1)
  const invokeRuleColumns = ref([
    { title: 'id', key: 'id', sortable: true, width: 70 },
    { title: t('http path'), slot: 'path', sortable: true, minWidth: 100},
    { title: t('http method'), slot: 'method', sortable: true, minWidth: 50 },
    { title: t('http source ip'), slot: 'source', sortable: true, minWidth: 100 },
    { title: t('http query params'), key: 'params', sortable: true, minWidth: 100 },
    { title: t('http body'), key: 'body', tooltip: true, sortable: true, minWidth: 100 },
    { title: t('operation'), slot: 'operation', width: 200, align: 'center' }
  ])
  const invokeRuleData = reactive([])
  const switchInvokeRule = ref(false)
  const switchInvokeRuleTitle = ref('')
  const isAdd = ref(false)
  
  // 表单相关
  const formValue = reactive({})
  const formLabel = reactive({
    'path':t('http path'),
    'method':t('http method'),
    'source':t('http source ip'),
    'params':t('http query params'),
    'body':t('http body'),
  })
  const formComment = reactive({
    'path':t('httpPathTips'),
    'method':t('http method'),
    'source':t('httpSourceIpTips'),
    'params': t('httpParamsTips')+' [{"a":"a.*","b":"b.*"},{"a":"A.*","b":"A.*"}]',
    'body': t('httpBodyTips'),
  })

  const httpParameterConstrictCheck = (rule, value, callback) => {
    if (value ==='' || value === null ) {
      callback()
      return
    }
    try {
      const cs = JSON.parse(value)
      if (!Array.isArray(cs)) {
        callback(new Error(t('format error')))
        return
      }
      cs.forEach((item) => {
        if (!(typeof item === 'object' && item !== null && !Array.isArray(item))){
          callback(new Error(t('format error')))
          return
        }
      })

      callback()
    } catch (error) {
      callback(new Error(t('parse to json failed'))) 
      console.log(t('parse to json failed'))
      console.log(value, error)
    }
  }

  const listNotEmptyCheck = (rule, value, callback) => {
    if (!Array.isArray(value)) {
      callback(new Error(t('must be list')))
      return
    }
    if (!value.length) {
      callback(new Error(t('should not empty')))
      return
    }
    callback()
  }

  const formValidate = reactive({
    path: [{validator: listNotEmptyCheck, trigger: 'blur'}],
    method: [{validator: listNotEmptyCheck, trigger: 'blur'}],
    source: [{validator: listNotEmptyCheck, trigger: 'blur'}],
    params: [{validator: httpParameterConstrictCheck, trigger: 'blur'}],
    body: [{validator: httpParameterConstrictCheck, trigger: 'blur'}],
  })

  const formConstrict = reactive({})

  const invokeRuleForm = ref(null)

  const formValueOrigin = {
    'path':'',
    'method':'',
    'source':'',
    'params':'',
    'body':'',
  }
  const formConstrictOrigin = {
    'path': [['.*',t('all path')],['/api/.*','/api '+t('all sub path')],['/api/v1/.*','/api/v1 '+t('all sub path')]],
    'source': [['127.0.0.1','127.0.0.1'],['localhost','localhost'],['.*',t('allow all ip')]],
  }


  const addInvokeRule = () => {
    console.log("add rule")
    isAdd.value = true
    switchInvokeRule.value = true
    switchInvokeRuleTitle.value = t('invoke rule create')
    Object.assign(formValue,util.dictDeepCopy(formValueOrigin))
    Object.assign(formConstrict,util.dictDeepCopy(formConstrictOrigin))
  }

  const createInvokeRule = async () => {
    console.log(formValue)
    let formValueFormat = {}
    formValueFormat['path'] = JSON.stringify(formValue['path'])
    formValueFormat['method'] = JSON.stringify(formValue['method'])
    formValueFormat['source'] = JSON.stringify(formValue['source'])

    formValueFormat['params'] = formValue['params']
    formValueFormat['body'] = formValue['body']
    
    let valid = await invokeRuleForm.value.validate()
    if (valid) {
      try {
        const res = await token.createInvokeRule(formValueFormat)
        if ( res.data['status'] > 0 ) {
          util.notice(proxy, `${t('create invoke rule success')}`, 'success')
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
      switchInvokeRule.value = false
      refreshpage()
    }
  }

  let currentRuleId = ''

  const detailInvokeRule = (row) => {
    console.log(row)
    console.log("detail rule")
    formValue.path = row.path
    formValue.method = row.method
    formValue.source = row.source
    formValue.params = row.params
    formValue.body = row.body
    
    // <Select>为动态时需要额外设置可选项
    Object.assign(formConstrict,util.dictDeepCopy(formConstrictOrigin))
    for (const k of ['path','source']) {
      row[k].forEach((item) => {
        // 过滤已经存在的
        if (!formConstrict[k].map(item => item[0]).includes(item)) {
          formConstrict[k].push([item,item])
        }
      })      
    }

    currentRuleId = row.id
    isAdd.value = false
    switchInvokeRule.value = true
    switchInvokeRuleTitle.value = `ID: ${currentRuleId} `+t('invoke rule detail')

  }

  const modifyInvokeRule = async () => {
    console.log(formValue, currentRuleId)
    let formValueFormat = {}
    formValueFormat['id'] = parseInt(currentRuleId)
    formValueFormat['path'] = JSON.stringify(formValue['path'])
    formValueFormat['method'] = JSON.stringify(formValue['method'])
    formValueFormat['source'] = JSON.stringify(formValue['source'])

    formValueFormat['params'] = formValue['params']
    formValueFormat['body'] = formValue['body']

    let valid = await invokeRuleForm.value.validate()
    if (valid) {
      try {
        const res = await token.updateInvokeRule(formValueFormat)
        if ( res.data['status'] > 0 ) {
          util.notice(proxy, `ID: ${currentRuleId} ${t('update invoke rule success')}`, 'success')
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
      switchInvokeRule.value = false
      refreshpage()
    }
  }

  const deleteInvokeRule = (row)=> {
    proxy.$Modal.confirm({
      'title': t('confirm delete invoke rule') + `: ${row.id} ?`,
      'onOk': () => { realDeleteInvokeRule(row) },
      'okText': t('delete'),
      'cancelText': t('cancel'),
      'width': '700px'
    })
  }
  
  const realDeleteInvokeRule = async (row)=> { 
    try {
      console.log(row)
      const params = {'id': row.id}
      const res = await token.deleteInvokeRule(params)
      if (res.data['status'] > 0 ) {
        util.notice(proxy, `${row.id} ${t('deleteSuccess')}`, 'success')
        refreshpage()
      } else if (res.data['status'] === 0 ) { 
        util.notice(proxy, `${row.id} ${t('not delete')}`, 'info')
      } else {
        util.notice(proxy, `${res.data['msg']}`, 'error')
      }

    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
    
  const refreshpage = async (page) => {
    const filter = route.name
    if (!page) {
      page = sessionStorage.getItem(`${filter}Currentpage`) || 1
    }
    currentPage.value = parseInt(page)
    sessionStorage.setItem(`${filter}Currentpage`, page)

    try {
      const res = await token.getInvokeRule(page, pagesize.value)
      if (res.data['status'] > 0) {
        pagenumber.value = parseInt(res.data['page'])

        invokeRuleData.length = 0
        res.data['data'].forEach((item) => {
          for ( const k of ['path','method','source'] ) {
            item[k] = JSON.parse(item[k])
          }
          invokeRuleData.push(item)
        })
        
      } else {
        util.notice(proxy, res.data['msg'], 'error')
      }

    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  
  onMounted(() => {
    refreshpage()
  })
</script>
