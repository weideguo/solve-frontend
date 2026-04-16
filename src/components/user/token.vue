<template>
  <Card>
    <template #title>
      <Button type="info" icon="md-add" shape="circle" size="small" @click="generateToken" style="margin-right: 20px"></Button>
      <Button type="info" icon="md-refresh" shape="circle" size="small" @click="refreshpage"></Button>
    </template>
    
    <div>
      <Table border :columns="tokencolumns" :data="tokendata" stripe>
        <template #token="{ row, index }">  
          <span style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"> {{ row.token }} </span>
        </template>

        <template #is_validate="{ row, index }">  
          <Tag v-if="row.is_validate != 'No'" color="primary"> Yes </Tag>
          <Tag v-else color="error"> No </Tag>
        </template>

        <template #invoke_rule_ids="{ row, index }">  
          <Tag v-for="i in row.invoke_rule_ids"> {{ i }} </Tag>
        </template>

        <template #operation="{ row, index }">  
          <div>
            <Button type="success" style="margin-right: 50px" size="small" @click="detailToken(row)">{{ $t('detail') }}</Button>
            <Button type="error" size="small" @click="deleteToken(row)">{{ $t('delete') }}</Button>
          </div>
        </template>
      </Table>
    </div>
    <br>
    <Page :total="pagenumber" @on-change="refreshpage" :page-size="pagesize" ref="total" :model-value="currentPage" @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
  </Card>

  <Modal v-model="switchTokenDetail" footer-hide width="50%">
    <template #header>          
      <p>
        <span>{{ currentToken }}</span>
      </p>
    </template>
    
    <Form ref="tokenForm" :label-width="150" :model="formValue"  :rules="formValidate">
      <FormItem v-for="i in Object.keys(formLabel)" :prop="i" :label="formLabel[i]" :key="i">
        <Input v-if="readonlyKey.includes(i)" v-model="formValue[i]" disabled ></Input>

        <DatePicker v-else-if="datatimeKey.includes(i)" v-model="formValue[i]" format="yyyy-MM-dd HH:mm:ss" type="datetime" :placeholder="formComment[i]" ></DatePicker>
        
        <Select v-else-if="typeof(formSelect[i]) === 'object'" v-model="formValue[i]" :placeholder="formComment[i]" 
          clearable :multiple="multipleKey.includes(i)" >
          <Option v-for="j in formSelect[i]" :value="j" :key="j">{{ j }}</Option>
        </Select>
        
        <Input v-else v-model="formValue[i]" :placeholder="formComment[i]" clearable></Input>

      </FormItem> 
      <FormItem>
        <div style="float: right"> 
          <Button style="margin-right: 5px" @click="switchTokenDetail=!switchTokenDetail"> {{ $t('cancel') }} </Button>
          <Button type="primary" @click="modifyToken()">{{ $t('update') }}</Button>
        </div> 
      </FormItem>
    </Form>

  </Modal>

</template>


<script setup>
  //
  import { ref, reactive, onMounted, onBeforeMount, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import token from '@/api/token'
  import user from '@/api/user'
  import util from '@/libs/util'
  import safeForm from '@/components/common/safeForm.vue'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  const route = useRoute()
  

  const currentPage = ref(1)
  const pagesize = ref(13)
  const pageSizeOpts = ref([10, 20, 40, 80, 100, 200])
  const pagenumber = ref(1)
  const tokencolumns = ref([
    { title: 'id', key: 'id', sortable: true, width: 80 },
    { title: 'token', slot: 'token', sortable: true, width: 300 },
    { title: t('map username'), key: 'username', sortable: true, width: 150 },
    { title: t('is validate'), slot: 'is_validate', align: 'center', width: 120, 
      filters: [{ label: 'Yes', value: 'Yes' },{ label: 'No', value: 'No' }], 
      filterMethod (value, row) { return row.is_validate === value } },
    { title: t('expire date'), key: 'expire_date', sortable: true, width: 200 },
    { title: t('max invoke'), key: 'max_invoke', sortable: true, width: 150 },
    { title: t('invoke count'), key: 'invoke_count', sortable: true, width: 150 },
    { title: t('invoke rule ids'), slot: 'invoke_rule_ids', sortable: true, minWidth: 50 },
    { title: t('operation'), slot: 'operation', width: 200, align: 'center' }
  ])
  const tokendata = ref([])
  const switchTokenDetail = ref(false)
  const currentToken = ref('')

  // 表单相关
  const formValue = reactive({})
  const formValidate = reactive({
    is_validate: [
      { required: true, message: t('selectIsValidateTips'), trigger: 'blur' }
    ],
    max_invoke: [
      { validator: util.validatorGenerator('^\\d+$', t('must be number')), trigger: 'blur' },
    ],
  })
  const formComment = reactive({
    'username': t('map username'), 'is_validate': t('is validate'), 'expire_date': t('expireDateTips')
  })
  const formSelect = reactive({
    'is_validate': ['Yes','No'],
    'username': [],            
    'invoke_rule_ids': []      
  })
  const formLabel = ref({
    'id'                   :  t('id'),                  
    'token'                :  t('token'),               
    'username'             :  t('map username'),            
    'is_validate'          :  t('is validate'),         
    'create_date'          :  t('create date'),         
    'expire_date'          :  t('expire date'),         
    'lastest_date'         :  t('lastest date'),        
    'lastest_success_date' :  t('lastest success date'),
    'invoke_rule_ids'      :  t('invoke rule ids'),     
    'max_invoke'           :  t('max invoke'),          
    'invoke_count'         :  t('invoke count'),        
    'invoke_success_count' :  t('invoke success count'),
  })  // 根据这个进行排序
  const readonlyKey = ref(['id','token','create_date','lastest_date','lastest_success_date','invoke_count','invoke_success_count'])
  const multipleKey = ref(['invoke_rule_ids'])
  const datatimeKey = ref(['expire_date'])

  const tokenForm = ref(null)


  const realGenerateToken = async ()=> {
    try {
      const res = await token.generateToken()
      if ( res.data['status'] > 0 ) {
        util.notice(proxy, res.data['token'] +`  ${t('generate token success')}`, 'success')
      } else {
        util.notice(proxy, res.data['msg'], 'error')
      }

    } catch (error) {
      util.notice(proxy, error, 'error')
    }

    refreshpage()
  }

  const generateToken = ()=> {
    proxy.$Modal.confirm({
      'title': t('confirm generate token') +` ?`,
      'onOk': () => { realGenerateToken() },
      'okText': t('generate'),
      'cancelText': t('cancel'),
      'width': '700px'
    })
  }

  const detailToken = (row)=> {
    console.log("detail token")
    console.log(row)
    switchTokenDetail.value = true
    currentToken.value = row.token

    for (const [key, value] of Object.entries(row)) {
      if ( ['_index', '_rowKey'].includes(key) ) {
        continue
      }
      formValue[key] = value
    }

  }

  const modifyToken = async () => {
    let formValueFormat = {}
    console.log(formValue)

    formValueFormat['id'] = parseInt(formValue['id'])
    formValueFormat['username'] = formValue['username']? formValue['username']: ''
    formValueFormat['is_validate'] = formValue['is_validate'] === 'Yes'? 1 : 0
    formValueFormat['max_invoke'] = parseInt(formValue['max_invoke'])
    formValueFormat['expire_date'] = formValue['expire_date']? util.formatDate(formValue['expire_date']) : ''
    formValueFormat['invoke_rule_ids'] = formValue['invoke_rule_ids']? formValue['invoke_rule_ids'].join(',') : ''
    
    let valid = await tokenForm.value.validate()
    if (valid) {
      try {
        const res = await token.updateToken(formValueFormat)
        if ( res.data['status'] > 0 ) {
          util.notice(proxy, formValue['token'] +`\n${t('update token success')}`, 'success')
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      } catch (error) {
        util.notice(proxy, error, 'error')
      }
      switchTokenDetail.value = false
      refreshpage()
    }
  }

  const deleteToken = (row)=> {
    proxy.$Modal.confirm({
      'title': t('confirm delete token') + `: ${row.token} ?`,
      'onOk': () => { realDeleteToken(row) },
      'okText': t('delete'),
      'cancelText': t('cancel'),
      'width': '700px'
    })
  }
  
  const realDeleteToken = async (row)=> { 
    try {
      console.log(row)
      const params = {'token': row.token}
      const res = await token.deleteToken(params)
      if (res.data['status'] > 0 ) {
        util.notice(proxy, `${row.token} ${t('deleteSuccess')}`, 'success')
        refreshpage()
      } else if (res.data['status'] === 0 ) { 
        util.notice(proxy, `${row.token} ${t('not delete')}`, 'info')
      } else {
        util.notice(proxy, `${res.data['msg']}`, 'error')
      }

    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }
  
  const getCurrentPageNew = (size) => {
    pagesize.value = size
    refreshpage(1)
  }

  const refreshpage = async (page) => {
    if (typeof page === 'object') {
      page = 0
    }
    const filter = route.name
    if (!page) {
      page = sessionStorage.getItem(`${filter}Currentpage`) || 1
    }
    currentPage.value = parseInt(page)
    sessionStorage.setItem(`${filter}Currentpage`, page)

    try {
      const res = await token.getToken(page, pagesize.value)
      if (res.data['data'].length === 0 && parseInt(page) > 1 ) {
        refreshpage(parseInt(page)-1)
        return
      }
      // 对数据进行转换
      let tokendataTmp = res.data['data']
      tokendataTmp.forEach((item) => {
        for (const k of ['id','invoke_count','invoke_success_count','max_invoke']) {
          item[k] = String(item[k])
        }

        for (const k of ['create_date','lastest_date','lastest_success_date','expire_date']) {
          if (item[k] === null) {
            item[k] = ''
          } else {
            item[k] = item[k].replace('T',' ')
          }
        }

        item['invoke_rule_ids'] = item['invoke_rule_ids'] ? item['invoke_rule_ids'].split(',') : []
        item['is_validate'] = item['is_validate'] === 0 ? 'No': 'Yes'

      })

      tokendata.value = tokendataTmp
      pagenumber.value = parseInt(res.data['page'])
      util.notice(proxy, t('loadSuccess'), 'info')
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }

  const refreshUsername = async () => {
    try {
      // 武断的认为用户数不超过1000
      const res = await user.getUserinfo(1, 1000)
      if (res.data['status'] > 0) {
        formSelect.username.length = 0
        res.data['data'].forEach(item => {
          formSelect.username.push(item.username)
        })
      } else {
        util.notice(proxy, res.data['msg'], 'error')
      }
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }

  const refreshInvokeRule = async () => {
    try {
      const res = await token.getInvokeRuleIdList()
      if (res.data['status'] > 0) {
        formSelect.invoke_rule_ids.length = 0
        formSelect.invoke_rule_ids = res.data['data'].map(item => String(item))
      } else {
        util.notice(proxy, res.data['msg'], 'error')
      }
    } catch (error) {
      util.notice(proxy, error, 'error')
    }
  }


  onBeforeMount(() => {
    refreshUsername()
    refreshInvokeRule()
  })

  onMounted(() => {
    refreshpage()
  })
</script>
