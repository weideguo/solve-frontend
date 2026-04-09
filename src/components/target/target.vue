<template>
  <div>
    <Card style="width: 100%">
      <template #title style="height: 32px">
        <Tooltip :content="$t('modifyFiled')"  placement="bottom-start">
          <Button type="info" icon="md-list" @click.native="switchFormInfo=true" ></Button>
        </Tooltip>
        <Button type="info" icon="md-add" @click.native="targetinfoAdd()" style="margin-left: 0.2vw">{{filter}}</Button>
        
        <Tooltip :content="$t('showCascade')"  placement="bottom-start" style="margin-left: 0.2vw">
          <Button type="info" icon="md-more" @click.native="showCascade()" ></Button>
        </Tooltip>
        <div style="float:right;margin-right: 0vw">
          <Input v-model="searchWord" @on-search="search()" search enter-button :placeholder="$t('searchTips')" style="width: 350px"/>
        </div>
      </template>
      
      <Table border stripe :columns="columns" :data="tableData" size="small" @on-row-dblclick="targetinfoDetail">
        <template #operation="{ row, index }">
          <Button type="success" size="small" style="margin-right: 50px" @click="targetinfoDetail(row)">{{ $t('detail') }}</Button>
          <Button type="error" size="small" @click="delTarget(row.name)">{{ $t('delete') }}</Button>
        </template>
      </Table>
      <br>
      <Page :total="pageNumber" @on-change="getCurrentPage" :page-size="pagesize" :model-value="currentPage" @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
    </Card>

    <Modal v-model="openswitch" footer-hide width="50%">    
      <template #header> 
        <Button v-if="!isAdd" shape="circle" icon="md-list" @click.native="getTreeNode"></Button>
        <p style="display:inline"><span>{{modelTitle}}</span></p>
      </template>
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :dynamic="true" :formvalidate="formItemValidate" 
        @primaryClick="formCommit" @secondClick="optionOperate" :primaryButtonName="isAdd? $t('add') : $t('update') "
        :secondCheck="!isAdd" :secondButtonName="isAdd? $t('cancel') : $t('copy') " :inputValueTips="$t('inputFieldValueTips')">
      </safe-form>
    </Modal>

    <Modal v-model="cascadeSwitch" footer-hide width="60%"> 
      <template #header>  
        <p>
          <span> {{ $t('selectedPath') }}: {{cascadePath}} </span>
        </p>
      </template>
      <div>
        <Tree :data="cascadeTreeData" @on-select-change="showCascadePath" ref="casCadeTree"></Tree>
      </div>
    </Modal>


    <Modal v-model="treeswitch" footer-hide width="60%"> 
      <template #header>   
        <p>
          <span>{{opentarget}}</span>
          <span style="margin-left:30px;">{{ $t('paramName')  }} {{treeLevel}}</span>
        </p>
      </template>  
      <div>
        <div style="background: #DCDCDC">
          <div style="width:100px;display: inline-block">{{ $t('paramLevel')  }}</div>
          <div style="width:100px;display: inline-block; margin-left:400px">{{ $t('paramValue')  }}</div>
        </div>
        <Tree ref="mytree" :data="targetDataTree" :render="renderContent" @on-select-change="showPath" @on-toggle-expand="showChildren" class="demo-tree-render"></Tree>
      </div>
    </Modal>

    <Modal v-model="switchFormInfo" footer-hide width="50%">          
      <template #header>  
        <span>{{filter}} {{ $t('modifyFiled') }}</span>
      </template>  
      <safe-form ref="formInfo" :labelwidth="100" :dynamicData="formItemInfo" :dynamic="true" :inputValueTips="$t('inputDescValueTips')"
        @primaryClick="formInfoCommit" @secondClick="switchFormInfo=false" >
      </safe-form>
    </Modal>

  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, watch, getCurrentInstance } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import target from '@/api/target'
  import config from '@/api/config'
  import util from '@/libs/util'
  import safeForm from '@/components/common/safeForm.vue'
  
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const searchWord = ref('')
  const username = ref(sessionStorage.getItem('user'))
  const formItem = ref([])
  const constictStr = ref('')
  const constKeyList = ref([])
  const formDynamic = ref([])
  const formItemInfo = ref({})
  const opentarget = ref('')
  const columns = ref([
    { title: 'name', key: 'name', width: 400, sortable: true },
    { title: t('info'), tooltip: true, key: 'info', minWidth: 600 }, // 注意这里
    { title: t('operation'), slot: 'operation', align: 'center', width: 300 }
  ])
  const tableData = ref([])
  const pagesize = ref(16)
  const pageNumber = ref(1)
  const currentPage = ref(1)
  const pageSizeOpts = ref([10, 20, 40, 80, 100, 200])
  const filter = ref('')
  const modelTitle = ref('')
  const openswitch = ref(false)
  const treeswitch = ref(false)
  const switchFormInfo = ref(false)
  const isAdd = ref(true)
  const treeLevel = ref('{{}}')
  const targetDataTree = ref([])
  const cascadeTreeData = ref([])
  const cascadeSwitch = ref(false)
  const cascadePath = ref('')
  const formItemOrigin = ref([])
  
  
  const getFormRules = () => {
    return {
      name: [
        { required: true, message: t('inputTargetNameTips'), trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            const routeName = route.name
            let f = util.validatorGenerator(`^${routeName}((.*\\S$)|$)`)
            f(rule, value, callback)
          }, 
          trigger: 'blur' 
        }
      ]
    }
  }
  const formItemValidate = reactive(getFormRules())
  
  
  const itemSort = computed(() => {
    return util.dictKeys(formItemValidate)
  })
  
  
  const search = (page = 1) => {
    let searchWordVal = ''
    if (searchWord.value) {
      searchWordVal = searchWord.value
    } else {
      searchWordVal = route.name + '*'
    }
    searchWordVal = encodeURIComponent(searchWordVal)
  
    target.getTarget(searchWordVal, page, pagesize.value)
      .then(res => {
        if (res.data['data'].length === 0 && parseInt(page) > 1 ) {
          getCurrentPage(parseInt(page)-1)
          return
        }
        tableData.value = res.data['data']
        tableData.value.forEach((item) => {
          item.info = JSON.stringify(item)
        })
        pageNumber.value = parseInt(res.data['page'])
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const targetinfoDetail = (paramsDict) => {
    openswitch.value = true
    isAdd.value = false
    modelTitle.value = filter.value + ' ' + t('updateInfo')
    opentarget.value = paramsDict['name']
    
    let formItemNew = util.dict2arry(JSON.parse(paramsDict['info']), 'key', 'value', itemSort.value)
    formItemNew.forEach((item, i) => {
      formItemOrigin.value.forEach((item2, i2) => {
        if (item['key'] === item2['key']) {
          item['comment'] = item2['comment']
        }
      })
    })
    formItemNew.forEach((item, i) => {
      item['label'] = item['key']
      if (item['key'] === 'const') {
        item['select'] = constKeyList.value
      }
    })
    formItem.value = formItemNew
  }
  
  const targetinfoAdd = () => {
    openswitch.value = true
    isAdd.value = true
    formItem.value = formItemOrigin.value
    modelTitle.value = filter.value + ' ' + t('addInfo')
  }
  
  const showCascade = () => {
    cascadePath.value = ''
    cascadeTreeData.value = []
    target.getNameList(`${route.name}*`)
      .then(res => {
        cascadeTreeData.value = []
        cascadeTreeData.value.push(util.formateTreeData(res.data['data'], []))
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
    cascadeSwitch.value = true
  }
  
  const showCascadePath = () => {
    cascadePath.value = util.getPathOfSelect(cascadeTreeData.value, '_')
    cascadePath.value = cascadePath.value.slice(2)
  }
  
  const formCommit = (data) => {
    if (!isAdd.value) {
      data['name_o'] = opentarget.value
    }
    openswitch.value = false
    addTarget(data)
  }
  
  const optionOperate = (data) => {
    if (!isAdd.value) {
      console.log('is add')
      if (data['name'] === opentarget.value) {
        proxy.$Message.error(t('nameUniqueTips'))
      } else {
        addTarget(data)
        openswitch.value = false
      }
    } else {
      console.log('is cancel')
      openswitch.value = false
    }
  }
  
  const formInfoCommit = (data) => {
    switchFormInfo.value = false
    config.postKey(`tmpl_${route.name}`, data)
      .then(res => {
        if (res.data['status'] >= 1) {
          util.notice(proxy, t('modifySuccess'), 'success')
          reflashTmpl()
        } else {
          util.notice(proxy, `${res.data['msg']}`, 'warning')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const getCurrentPageNew = (size) => {
    pagesize.value = size
    getCurrentPage(1)
  }
  
  const getCurrentPage = (page) => {
    formDynamic.value = []
    filter.value = route.name
    if (!page) {
      page = sessionStorage.getItem(`${filter.value}Currentpage`) || 1
    }
    currentPage.value = parseInt(page)
    sessionStorage.setItem(`${filter.value}Currentpage`, page)
    search(page)
  }
  
  const delTarget = (targetName) => {
    proxy.$Modal.confirm({
      title: t('confirmDelete') + ` ${t} ？`,
      onOk: () => {
        realDelTarget(targetName)
      },
      okText: t('delete'),
      cancelText: t('cancel'),
      width: '700px'
    })
  }
  
  const realDelTarget = (targetName) => {
    target.delTarget(targetName.replace(new RegExp("#", "g"), "%23"))
      .then(res => {
        if (res.data['status'] === 1) {
          getCurrentPage()
          util.notice(proxy, `${targetName} ` + t('deleteSuccess'), 'success')
        } else {
          util.notice(proxy, `${targetName} ` + t('deleteFailed'), 'error')
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
          if (!info['name']) {
            util.notice(proxy, `${res.data['msg']}`, 'warning')
          } else {
            util.notice(proxy, `${info['name']} ${res.data['msg']}`, 'warning')
          }
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const reflashTmpl = () => {
    config.getKey(`tmpl_${route.name}`)
      .then(res => {
        let keyInfo = {}
        if (res.data['data']) {
          keyInfo = res.data['data']
        }
        // 后端不存在的字段说明时使用排序指定的key当成默认
        itemSort.value.forEach((k, i) => {
          if (!keyInfo[k]) {
            keyInfo[k] = ""
          }
        })
        formItemInfo.value = util.dictDeepCopy(keyInfo)
        formItemOrigin.value = util.dict2arry(keyInfo, 'key', 'comment', itemSort.value)
        formItemOrigin.value.forEach((item, i) => {
          item['label'] = item['key']
          if (item['key'] === 'const') {
            item['select'] = constKeyList.value
          }
        })
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  
    target.getNameList('const*')
      .then(res => {
        constKeyList.value = res.data['data']
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  // --- 树形相关方法 ---
  const showChildren = (currentNode) => {
    currentNode.children = []
    target.getTreeInfo(currentNode.value)
      .then(res => {
        currentNode.children = res.data['data'].sort(util.funcSort('title'))
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const showPath = (selectList, selectCurrent) => {
    treeLevel.value = util.getPathOfSelect(targetDataTree.value, '.')
    treeLevel.value = '{{' + treeLevel.value + '}}'
  }
  
  const getTreeNode = () => {
    treeswitch.value = true
    treeLevel.value = '{{}}'
    targetDataTree.value = []
    target.getTreeInfo(opentarget.value)
      .then(res => {
        targetDataTree.value = res.data['data']
        targetDataTree.value = targetDataTree.value.sort(util.funcSort('title'))
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  // 树的渲染函数
  const renderContent = (h, { root, node, data }) => {
    return h('span', {
      style: {
        display: 'inline-block',
        width: '100%'
      }
    }, [
      h('div', {
        style: {
          width: '400px',
          display: 'inline-block',
        }
      }, [data.title]),
      h('span', {
        style: {
          color: '#F00'
        }
      }, [data.value])
    ])
  }
  
  //reflashTmpl()
  
  watch(
    () => route.name,
    () => {
      searchWord.value = ''
      getCurrentPage()
      reflashTmpl()
    },
    { immediate: true, deep: true }
  )
  
  onMounted(() => {
    //getCurrentPage()
  })
</script>

