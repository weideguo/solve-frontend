<template>
  <div>
    <Card style="width: 100%">
      <template #title>
        <p>{{title}}</p>
        <br><br>
        <Tooltip :content="$t('showPlaybook')" placement="bottom-start">
          <Button type="primary" shape="circle" icon="md-book" ghost @click.native="playbookDetial()"></Button>
        </Tooltip>
        <Tooltip :content="$t('save')" placement="bottom" style="margin-left: 20px">
          <Button type="primary" shape="circle" icon="md-cloud-upload" ghost @click.native="commit()"></Button>
        </Tooltip>
      </template>
      <Form :label-width="100" ref="formExecutionSetting" 
        :model="formItem.reduce((acc, cur) => {
                  acc[cur.key] = cur.value
                  return acc
                }, {})"
        :rules="ruleExecutionSetting">
        <FormItem label="target_type" prop="target_type" >
          <Input v-model="target_type" disabled></Input> 
        </FormItem>
        <FormItem v-for="(item, i) in formItem" :key="i" :label="item.key" :prop="item.key">
          <Input v-if="item.key === 'target'" v-model="item.value" @click.native="clusterAdd()"></Input>
          <Select v-else-if="item.key === 'tmpl'" v-model="item.value" filterable>
            <Option v-for="i in tmplList" :value="i" :key="i">{{ i }}</Option>
          </Select>
          <Input v-else v-model="item.value" clearable></Input>
          
        </FormItem>
        
      </Form>
      <Button type="primary" style="margin-left: 50%" @click.native="commit()">{{ $t('save') }}</Button>
    </Card>

    <Modal v-model="openswitchAdd" @on-ok="commitinfoAdd" :ok-text="$t('confirm')" width="800"  :title="$t('executeTarget')">
      <Tree :data="treeData" show-checkbox ref="mytree"></Tree>
    </Modal>
    
  </div>
</template>

<script setup>
  import { ref, reactive, computed, watch, getCurrentInstance, onMounted, onBeforeMount } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import exec from '@/api/exec'
  import target from '@/api/target'
  import util from '@/libs/util'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  const router = useRouter()
  const route = useRoute()
  
  const target_type = ref('')
  const openswitchAdd = ref(false)
  const fromData = ref({})
  const formItem = ref([])
  const formItemSort = ['name', 'tmpl', 'target', 'comment']
  const treeData = ref([])
  const tmplList = ref([])
  const title = ref('')
  const playbook = ref('')
  const name_o = ref('')
  const ruleExecutionSetting = reactive({
    name: [
      { required: true, message: 'name' + t('shouldNotEmpty') }
    ],
  })
  
  const info = computed(() => {
    let x = util.arry2dict(formItem.value, 'key', 'value')
    x['name'] = 'exec:' + x['name']
    return x
  })
  
  const tmpl = computed(() => {
    return util.arry2dict(formItem.value, 'key', 'value')['tmpl']
  })
  
  const playbookDetial = () => {
    let name = info.value['name'].split('exec:')[1]
    let path = router.resolve({ path: '/playbook', query: { playbook: playbook.value, title: name } }).href
    console.log(path)
    window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
  }
  
  const commit = () => {
    if (util.existSpace(info.value['name'])) {
      proxy.$Message.error('name' + t('shouldNoSpaceLR'))
    } else if (info.value['name'] === 'exec:') {
      proxy.$Message.error('name' + t('shouldNotEmpty'))
    } else if (info.value['target'] != '' && info.value['target'].search(new RegExp(target_type.value.replaceAll('.', '\\.').replaceAll('*', '.*').replaceAll('?', '.'))) != 0) {
      proxy.$Message.error(t('templateNotMatchTips'))
    } else {
      if (info.value['target']) {
        info.value['number'] = info.value['target'].split(',').length
      } else {
        info.value['number'] = 0
      }
      proxy.$Message.success(t('commitBegin'))
      info.value['name_o'] = name_o.value
      console.log(info.value)
      addinfo(info.value)
    }
  }
  
  // 添加信息
  const addinfo = (info) => {
    try {
      exec.postExecutionInfo(info)
        .then(res => {
          if (res.data['status'] >= 1) {
            util.notice(proxy, `${info['name']} ${res.data['msg']}`, 'success')
          } else {
            util.notice(proxy, res.data['msg'], 'warning')
          }
        }).catch(error => {
          util.notice(proxy, error, 'error')
        })
    } catch (err) {
      util.notice(proxy, err, 'error')
    }
  }
  
  
  const getCurrentPage = () => {
    let tag = ''
    console.log(route.query['row'])
    if (route.query['row']) {
      fromData.value = JSON.parse(route.query['row'])
      tag = route.query['tag']
      sessionStorage.setItem('exe_data', route.query['row'])
      sessionStorage.setItem('exe_data_is_add', route.query['tag'])
    } else {
      fromData.value = JSON.parse(sessionStorage.getItem('exe_data'))
      tag = sessionStorage.getItem('exe_data_is_add')
    }
    try {
      let x = ['_index', '_rowKey', 'number']
      x.forEach((item, i) => {
        delete fromData.value[item]
      })
    } finally {
      formItem.value = util.dict2arry(fromData.value, 'key', 'value', formItemSort)
    }
    
    console.log(formItem.value)
    console.log(tag)
    if (tag === 'add') {
      name_o.value = ''
      title.value = t('addJob')
    } else {
      title.value = t('modifyJob')
      formItem.value.forEach((item, i) => {
        if (item['key'] === 'name') {
          name_o.value = 'exec:' + item['value']
        }
      })
    }
  }
  
  const clusterAdd = () => {
    console.log(target_type.value)
    if (target_type.value != '') {
      openswitchAdd.value = !openswitchAdd.value
      let formdata = util.arry2dict(formItem.value, 'key', 'value')
      let selectedItem = (formdata['target']).split(',')
      target.getNameList(`${target_type.value}*`)
        .then(res => {
          treeData.value = []
          treeData.value.push(util.formateTreeData(res.data['data'], selectedItem))
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      proxy.$Message.error(t('setTemplateTips'))
    }
  }
  
  const commitinfoAdd = () => {
    let checkedleaf = util.getCheckedLeaf(treeData.value)
    formItem.value.forEach((item) => {
      if (item.key === 'target') {
        item.value = checkedleaf.toString()
      }
    })
  }
  
  const reflashTmpl = () => {
    exec.getNameList('tmpl*')
      .then(res => {
        tmplList.value = res.data['data']
      }).catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  watch(tmpl, (val, oldval) => {
    if (info.value['tmpl'] === '' || info.value['tmpl'] === undefined) {
      target_type.value = ''
    } else {
      exec.getExecutionInfo(`${info.value['tmpl']}`)
        .then(res => {
          try {
            let r = res.data['data'][0]
            target_type.value = r['target_type']
            playbook.value = r['playbook']
          } catch (err) {
            console.error(err)
            util.notice(proxy, t('getTemplateFailedTips'), 'warning')
          }
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    }
  }, { immediate: true })
  
  
  onBeforeMount(() => {
    reflashTmpl()
  })
  
  onMounted(() => {
    getCurrentPage()
  })
</script>
