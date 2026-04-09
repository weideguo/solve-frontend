<template>
  <div>
    <Row>
      <Card>
        <template #title style="height: 32px">
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()">{{ $t('addHost') }}</Button>
          <Switch size="large" @on-change="onlineFilter" style="margin-left: 50px">
            <template #open>
              <span>{{ $t('connect') }}</span>
            </template>
            <template #close>
              <span>{{ $t('all') }}</span>
            </template>
          </Switch>
          <div style="float:right;margin-right: 0px">
            <Input v-model="searchWord" @on-search="search()" search enter-button :placeholder="$t('searchTips')" style="width: 350px"/>
          </div>
        </template>
        
        <Row>
          <Col span="24">
            <Table border :columns="columns" :data="tableData" @on-row-dblclick="targetinfoDetail" stripe size="small">
              <template #operation="{ row, index }">                
                <Button v-if="row['is_conn'] === 0" type="warning" size="small" @click="createConn(row)">{{ $t('createConnect') }}</Button>
                <Button v-else-if="row['is_conn'] === 1" type="success" size="small" @click="closeConn(row)">{{ $t('closeConnect') }}</Button>
                <Button v-else-if="row['is_conn'] === 2" type="success" loading size="small" >{{ $t('closeConnecting') }}</Button>
                <Button v-else-if="row['is_conn'] === 3" type="warning" loading size="small" >{{ $t('createConnecting') }}</Button>
              </template>
              <template #detail="{ row, index }">
                <Button type="success" size="small" @click="targetinfoDetail(row)">{{ $t('detail') }}</Button>
              </template>
              <template #delete="{ row, index }">
                <Button type="error" size="small" @click="delTarget(row.name)">{{ $t('delete') }}</Button>
              </template>
            </Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :page-size="pageSize" :model-value="currentPage" show-elevator show-total></Page>
      </Card>
    </Row>

    <Modal v-model="openswitch" footer-hide width="50%">
      <template #header>          
        <p>
          <span>{{modelTitle}}</span>
        </p>
      </template>
      
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formCommit" :primaryButtonName="isAdd? $t('add') : $t('update')" @secondClick="optionOperate" :secondCheck="!isAdd" :secondButtonName="isAdd? $t('cancel') : $t('copy')"></safe-form>
    </Modal>
    
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import target from '@/api/target'
  import host from '@/api/host'
  import config from '@/api/config'
  import util from '@/libs/util'
  import safeForm from '@/components/common/safeForm.vue'
  
  const router = useRouter()
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const isOnline = ref(false)
  const searchWord = ref('')
  const formItemValidate = reactive({
    ip: [
      { required: true, message: t('inputIpTips'), trigger: 'blur' },
      { validator: util.validatorGenerator(), trigger: 'blur' },
    ],
    user: [
      { required: true, message: t('inputUserTips'), trigger: 'blur' },
      { validator: util.validatorGenerator(), trigger: 'blur' },
    ],
    ssh_port: [
      { required: true, message: t('inputSshPortTips'), trigger: 'blur' },
      { validator: util.validatorGenerator('^\\d+$', t('portMustBeNum')), trigger: 'blur' },
    ],
    passwd: [
      { validator: util.validatorGenerator('^$|^[^\\s]$|^[^\\s].*[^\\s]$', t('emptyOrNoSpaceLeftRight')), trigger: 'blur' },
    ],
    proxy: [
      { validator: util.validatorGenerator('^$|^[^\\s]$|^[^\\s].*[^\\s]$', t('emptyOrNoSpaceLeftRight')), trigger: 'blur' },
    ]
  })
  
  const formItem = ref([])
  const opentarget = ref('')
  const columns = ref([
    { title: 'name', key: 'name', minWidth: 400, sortable: true },
    { title: 'IP', key: 'ip', width: 400, sortable: true },
    { title: t('sshPort'), key: 'ssh_port', width: 200, sortable: true },
    { title: t('user'), key: 'user', align: 'center', sortable: true, width: 100 },
    { title: t('operation'), slot: 'operation', align: 'center', width: 200 },
    { title: t('detail'), slot: 'detail', align: 'center', width: 200 },
    { title: t('delete'), slot: 'delete', align: 'center', width: 100 },
  ])
  const tableData = ref([])
  const pageSize = ref(16)
  const pageNumber = ref(1)
  const currentPage = ref(1)
  const filter = ref('')
  const openswitch = ref(false)
  const modelTitle = ref('')
  const isAdd = ref(false)
  
  let formItemOrigin = [] // 使用 let 以便在 reflashTmpl 中赋值
  
  
  const itemSort = computed(() => {
    return Object.keys(formItemValidate)
  })
  
  
  const formCommit = (data) => {
    data['name'] = 'realhost_' + data['ip']
    if (!isAdd.value) {
      data['name_o'] = opentarget.value
    }
    console.log(data)
    addTarget(data)
    openswitch.value = false
  }
  
  const optionOperate = (data) => {
    if (!isAdd.value) {
      console.log('is add')
      data['name'] = 'realhost_' + data['ip']
      if (data['name'] === opentarget.value) {
        proxy.$Message.error(t('ipUniqueTips'))
      } else {
        addTarget(data)
        openswitch.value = false
      }
    } else {
      console.log('is cancel')
      openswitch.value = false
    }
    console.log(data)
  }
  
  const onlineFilter = () => {
    isOnline.value = !isOnline.value
    if (isOnline.value) {
      host.getOnlinedetail()
        .then(res => {
          res.data['data'].forEach((item) => {
            item['info'] = util.dictDeepCopy(item)
          })
          tableData.value = res.data['data']
          pageNumber.value = res.data['page']
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      getCurrentPage()
    }
  }
  
  const search = (page = 1) => {
    let searchWordVal = ''
    if (searchWord.value) {
      searchWordVal = searchWord.value
    } else {
      searchWordVal = router.currentRoute.value.name + '*'
    }
    searchWordVal = encodeURIComponent(searchWordVal)
  
    target.getTarget(searchWordVal, page, pageSize.value)
      .then(res => {
        // 处理为空的情况
        if (res.data['data'].length === 0 && parseInt(page) > 1 ) {
          getCurrentPage(parseInt(page)-1)
          return
        }

        return host.getOnline().then(res2 => {
          let onlinehost = []
          res.data['data'].forEach((item) => {
            res2.data['data'].forEach((hostItem) => {
              if (hostItem['is_conn']) {
                onlinehost.push(hostItem['host'])
              }
            })
            if (onlinehost.indexOf(item['ip']) < 0) {
              item['is_conn'] = 0
            } else {
              item['is_conn'] = 1
            }
          })
          tableData.value = res.data['data']
          pageNumber.value = parseInt(res.data['page'])
        })
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const targetinfoDetail = (params) => {
    let info = util.dictDeepCopy(params)
    if (info['name'].search('^' + router.currentRoute.value.name) > -1) {
      openswitch.value = true
      isAdd.value = false
      modelTitle.value = t('updateInfo')
      opentarget.value = info['name']
      const x = ['name', 'is_conn', '_index', '_rowKey']
      x.forEach((item) => {
        delete info[item]
      })
      // 假设 formItemOrigin 已在外部定义或通过其他方式获取
      let formItemNew = util.dictDeepCopy(formItemOrigin)
      formItemNew.forEach((item) => {
        item['value'] = info[item['key']]
      })
      formItem.value = formItemNew
    } else {
      util.notice(proxy, t('notUpdateTips'), 'info')
    }
  }
  
  const targetinfoAdd = () => {
    openswitch.value = true
    isAdd.value = true
    formItem.value = formItemOrigin
    modelTitle.value = t('addInfo')
  }
  
  const getCurrentPage = (page) => {
    filter.value = router.currentRoute.value.name
    if (!page) {
      page = sessionStorage.getItem(`${filter.value}Currentpage`) || 1
    }
    currentPage.value = parseInt(page)
    sessionStorage.setItem(`${filter.value}Currentpage`, page)
    search(page)
  }
  
  const delTarget = (targetName) => {
    proxy.$Modal.confirm({'title': t('confirmDelete')+` ${targetName} ？`,'onOk': () => {realDelTarget(targetName)}, 'okText': t('delete'), 'cancelText': t('cancel') , 'width': '700px'})
  }
  
  const realDelTarget = (targetName) => {
    console.log(targetName)
    target.delTarget(targetName.replace('#', '%23'))
      .then(res => {
        if (res.data['status'] === 1) {
          getCurrentPage()
          util.notice(proxy, `${targetName} `+ t('deleteSuccess'), 'success')
        } else {
          util.notice(proxy, `${targetName} `+ t('deleteFailed'), 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const addTarget = (info) => {
    target.addTarget(info)
      .then(res => {
        if (res.data['status'] >= 1) {
          util.notice(proxy, `${info['name']} ${res.data['msg']}`, 'success')
          getCurrentPage()
        } else {
          util.notice(proxy, `${info['name']} ${res.data['msg']}`, 'warning')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const closeConn = (row) => {
    if (row['ip']) {
      row['is_conn'] = 2
      host.kill(row['ip'])
        .then(res => {
          if (res.data['status'] === 1) {
            row['is_conn'] = 0
            util.notice(proxy, `${row['ip']} ${res.data['msg']}`, 'success')
          } else {
            row['is_conn'] = 1
            util.notice(proxy, `${row['ip']} ${res.data['msg']}`, 'error')
          }
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      proxy.$Message.info(t('notCloseConnectTips'))
    }
  }
  
  const createConn = (row) => {
    if (row['ip']) {
      row['is_conn'] = 3
      host.conn(row['ip'])
        .then(res => {
          if (res.data['status'] === 1) {
            row['is_conn'] = 1
            util.notice(proxy, `${row['ip']} ${res.data['msg']}`, 'success')
          } else {
            row.is_conn = 0
            util.notice(proxy, `${row['ip']} ${res.data['msg']}`, 'error')
          }
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      proxy.$Message.info(t('notCreateConnectTips'))
    }
  }
  
  const reflashTmpl = () => {
    config.getKey(`tmpl_${router.currentRoute.value.name}`)
      .then(res => {
        delete res.data['data']['name']
        let keyInfo = {}
        if (res.data['data']) {
          keyInfo = res.data['data']
        }
        // 后端不存在的字段说明时使用排序指定的key当成默认
        itemSort.value.forEach((k) => {
          if (!keyInfo[k]) {
            keyInfo[k] = ""
          }
        })
        formItemOrigin = util.dict2arry(keyInfo, 'key', 'comment', itemSort.value)
        formItemOrigin.forEach((item) => {
          item['label'] = item['key']
        })
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  
  reflashTmpl()
  
  
  onMounted(() => {
    getCurrentPage()
  })
</script>
