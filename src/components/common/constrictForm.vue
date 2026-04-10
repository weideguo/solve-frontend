<template>
  <Form ref="constrictForm" :label-width="realLabelwidth" :model="formItem" :rules="formValidate">
    <p v-if="JSON.stringify(formItem) === '{}'" style="text-align: center">{{nullInfo}}</p>
    <div v-else>
      
      <FormItem v-for="k in formKey" :prop="k" :key="k" :label="k">
        <Select v-if="formType[k] === 'select'" v-model="formItem[k]" :placeholder="formComment[k]" filterable clearable>
          <template v-if="Array.isArray(formConstrict[k][0])">
            <Option v-for="j in formConstrict[k]" :value="j[0]" :label="j[0]" :key="JSON.stringify(j[0])">   
              <span>{{ j[0] }}</span>
              <span style="float:right;color:#ccc">{{ j[1] }}</span>
            </Option>
          </template>
          <template v-else>
            <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
          </template>
        </Select>
        <Select v-else-if="formType[k] === 'multiselect'" v-model="formItem[k]" :placeholder="formComment[k]" filterable multiple>
          <template v-if="Array.isArray(formConstrict[k][0])">
            <Option v-for="j in formConstrict[k]" :value="j[0]" :label="j[0]" :key="JSON.stringify(j[0])">   
              <span>{{ j[0] }}</span>
              <span style="float:right;margin-right:3%;color:#ccc">{{ j[1] }}</span>
            </Option>
          </template>
          <template v-else>
            <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
          </template>
        </Select>
        <Select v-else-if="formType[k] === 'dynamicselect'" v-model="formItem[k]" :placeholder="formComment[k]" filterable clearable allow-create @on-open-change="openChange(k)" @on-create="pushItem">
          <template v-if="Array.isArray(formConstrict[k][0])">
            <Option v-for="j in formConstrict[k]" :value="j[0]" :label="j[0]" :key="JSON.stringify(j[0])">   
              <span>{{ j[0] }}</span>
              <span style="float:right;color:#ccc">{{ j[1] }}</span>
            </Option>
          </template>
          <template v-else>
            <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
          </template>
        </Select>
        <Select v-else-if="formType[k] === 'dynamicmultiselect'" v-model="formItem[k]" :placeholder="formComment[k]" multiple filterable allow-create  @on-open-change="openChange(k)" @on-create="pushItem">
          <template v-if="Array.isArray(formConstrict[k][0])">
            <Option v-for="j in formConstrict[k]" :value="j[0]" :label="j[0]" :key="JSON.stringify(j[0])">   
              <span>{{ j[0] }}</span>
              <span style="float:right;margin-right:3%;color:#ccc">{{ j[1] }}</span>
            </Option>
          </template>
          <template v-else>
            <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
          </template>
        </Select>
        <div v-else-if="formType[k] === 'upload'" >
          <Input v-model="formItem[k]" type="text" :placeholder="formComment[k]" clearable style="width: 80%"></Input>
          <Upload style="float: right;" :show-upload-list="false" :action="uploadUrl" :headers='myheader' :on-success="uploadSuccess(formItem,k)" ref="upload">
            <Button icon="ios-cloud-upload-outline">{{ $t('selectFile') }}</Button>
          </Upload>
          <div style="clear:both"></div>
        </div>

        <div v-else-if="['select_by_http_delay','multiselect_by_http_delay','dynamicselect_by_http_delay','dynamicmultiselect_by_http_delay'].includes(formType[k])" >
          <Input v-model="formItem[k]" type="text" :placeholder="formComment[k]" clearable style="width: 85%"></Input>
          <Tooltip style="float: right;" :content="$t('getSelectConstrict')" placement="right">
            <Button type="primary" shape="circle" icon="md-refresh" @click="loadSessionConstrict(k)"></Button>
          </Tooltip>
          <div style="clear:both"></div>
        </div>

        <DatePicker v-else-if="formType[k] === 'datetime'" v-model="formItem[k]" format="yyyy-MM-dd HH:mm:ss" type="datetime" :placeholder="formComment[k]" ></DatePicker>
        <Input v-else v-model="formItem[k]" type="textarea" :autosize="true" :placeholder="formComment[k]" clearable></Input>
      </FormItem>

      <div style="float:right;" >
        <Tooltip :content="buttonTooltip" placement="bottom">
          <Button @click="buttonOperation" type="primary" ghost>{{_buttonName}}</Button>
        </Tooltip>
      </div>
      <div  style="clear:both"></div>
    </div>   
  </Form>
</template>


<script setup>
  //
  import { ref, reactive, watch, onMounted, computed, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import util from '@/libs/util'
  
  const { proxy } = getCurrentInstance()
  const { t } = useI18n()
  
  const props = defineProps({
    nullInfo: String,
    formdata: {
      type: Array,
      default: () => []
    },
    buttonTooltip: {
      type: String,
      default: ''
    },
    buttonName: {
      type: String,
      default: ''
    },
    labelwidth: {
      type: Number,
      default: 100
    }
  })
  
  const emit = defineEmits(['buttonOperation'])
  
  const realLabelwidth = ref(0)
  const formItem = reactive({})
  const formComment = reactive({})
  const formType = reactive({})
  const formValidate = reactive({})
  const formConstrict = reactive({})
  const formConstrictOrigin = reactive({})
  const formKey = ref([])
  const myheader = { 'Authorization': sessionStorage.getItem('jwt') }
  const baseurl = sessionStorage.getItem('baseurl')
  const currentKey = ref("")
  
  const constrictForm = ref(null)
  
  const uploadUrl = computed(() => {
    let d = new Date()
    return baseurl + '/file/?path=' + d.getFullYear() + formatTimeSegment(d.getMonth() + 1) + formatTimeSegment(d.getDate()) + '/' + d.valueOf()
  })
  
  const _buttonName = computed(() => {
    return props.buttonName || t('save')
  })
  
  
  const formatTimeSegment = (s) => s < 10 ? '0' + s : s
  
  const getFormItem = () => {
    for (let k in formItem) {
      if (formItem[k] instanceof Date) {
        let d = formItem[k]
        formItem[k] = `${d.getFullYear()}-${formatTimeSegment(d.getMonth() + 1)}-${formatTimeSegment(d.getDate())} ${formatTimeSegment(d.getHours())}:${formatTimeSegment(d.getMinutes())}:${formatTimeSegment(d.getSeconds())}`
      }
    }
    return formItem
  }
  
  const buttonOperation = () => {
    emit('buttonOperation', getFormItem())
  }
  
  const openChange = (k) => {
    currentKey.value = k
  }
  
  const pushItem = (val) => {
    if (formConstrict[currentKey.value] && Array.isArray(formConstrict[currentKey.value][0])) {
      formConstrict[currentKey.value].push([val, t('new')])
    } else {
      formConstrict[currentKey.value].push(val)
    }
  }
  
  const uploadSuccess = (formItemParam, k) => {
    return (f) => {
      formItemParam[k] = f.file
      util.notice(proxy, f.msg, 'info')
    }
  }
  
  const addDynamicValue = (itemValue, itemConstrict) => {
    let tmpItemValues = itemValue
    if (!itemValue) {
      tmpItemValues = []
    } else if (!Array.isArray(itemValue)) {
      tmpItemValues = [itemValue]
    }
  
    if (Array.isArray(itemConstrict[0])) {
      const tmpItemConstrict = itemConstrict.map(item => item[0])
      tmpItemValues.forEach(valueItem => {
        if (!tmpItemConstrict.includes(valueItem)) {
          itemConstrict.push([valueItem, t('new')])
        }
      })
    } else {
      itemConstrict = util.listCombine(itemConstrict, tmpItemValues)
    }
    return itemConstrict
  }
  
  const httpParamsReplace = (httpParams, valueFull) => {
    console.log('http请求参数进行变量替换')
    console.log('完整的值:')
    console.log(valueFull)
    console.log('原始请求参数:')
    console.log(httpParams)
    
    for (const [key, value] of Object.entries(httpParams)) {
      httpParams[key] = util.render(value, valueFull)
    }
    console.log('变量替换后请求参数:')
    console.log(httpParams)
    console.log('http请求参数进行变量替换结束')
  
    for (const [key, value] of Object.entries(httpParams)) {
      const k = value.match(/\{\{\s*(\w+)\s*\}\}/g)
      if (k) return k
    }
  }
  
  const selectConstrictUpdate = async (keyItem) => {
    const itemConstrictCopy = util.dictDeepCopy(formConstrictOrigin[keyItem])
    console.log(`通过http获取${keyItem}请求参数为:`, itemConstrictCopy)
    
    formType[keyItem] = formType[keyItem].split('_')[0]
    formConstrict[keyItem] = itemConstrictCopy['options'] || []
  
    if (['dynamicselect', 'dynamicmultiselect'].includes(formType[keyItem])) {
      formConstrict[keyItem] = addDynamicValue(formItem[keyItem], formConstrict[keyItem])
    }
  
    let url = itemConstrictCopy['url']
    const valuePath = itemConstrictCopy['value_path']
    const commentPath = itemConstrictCopy['comment_path']
    let params = { headers: itemConstrictCopy['header'] || {} }
  
    if (!url) {
      console.error(`${keyItem} ${t('urlFieldNotInYAML')}`)
      throw new Error(`${keyItem} yaml配置文件中url字段不存在`)
    }
  
    // 处理 GET 参数
    if (itemConstrictCopy.get && Object.keys(itemConstrictCopy.get).length > 0) {
      const missingVars = httpParamsReplace(itemConstrictCopy.get, formItem)
      if (missingVars) {
        console.warn('存在未替换的变量', missingVars)
        proxy.$Message.error(t(`renderParamsExist`)+' '+k) 
        return
      }
      const urlObj = new URL(url)
      Object.entries(itemConstrictCopy.get).forEach(([k, v]) => urlObj.searchParams.set(k, v))
      url = urlObj.toString()
      params.method = 'GET'
    }
  
    // 处理 POST 参数
    if (itemConstrictCopy.post) {
      params.method = 'POST'
      if (Object.keys(itemConstrictCopy.post).length > 0) {
        const missingVars = httpParamsReplace(itemConstrictCopy.post, formItem)
        if (missingVars) {
          console.log('不能发起http请求，存在未替换的变量', missingVars) 
          proxy.$Message.error(t(`renderParamsExist`)+' '+k) 
          return
        }
        params.body = JSON.stringify(itemConstrictCopy.post)
      }
    }
  
    try {
      const res = await fetch(url, params)
      if (!res.ok) throw new Error('发起http请求报错')
      const json = await res.json()
      
      console.log(`通过http获取${keyItem}值为:`, json)
      let selectValue = util.getJsonSubElementByKeyPath(json, valuePath)
      let selectComment = commentPath ? util.getJsonSubElementByKeyPath(json, commentPath) : null
  
      if (selectValue && Array.isArray(selectValue) && selectValue.length > 0) {
        formConstrict[keyItem] = selectValue
        if (selectComment && Array.isArray(selectComment) && selectComment.length > 0) {
          formConstrict[keyItem] = selectValue.map((item, index) => [item, selectComment[index]])
        }
      }
  
      if (['dynamicselect', 'dynamicmultiselect'].includes(formType[keyItem])) {
        formConstrict[keyItem] = addDynamicValue(formItem[keyItem], formConstrict[keyItem])
      }
      proxy.$Message.info(t('updateSelectConstrinctSuccess')+' '+keyItem)
    } catch (error) {
      console.error(keyItem, error)
      proxy.Message.error(keyItem+' '+t(`httpRequestError`))   
    }
  }
  
  const updateFormdata = () => {
    const formdataCopy = util.dictDeepCopy(props.formdata)
    
    formdataCopy.forEach((item,i) => {
      if ( ( ['multiselect','dynamicmultiselect','multiselect_by_http','dynamicmultiselect_by_http'].includes(item['type']) ) && ( (typeof item['value']) != 'object') ){
        // 列表在后端存储时以两个空格分隔
        // item['value'] = item['value'].split('  ')  
        // 后端存储时以字符串转换，因而从后端获取时应该先进行转换
        try {
          // '"aaa" "bbb"'  ===> '["aaa","bbb"]' ===> ["aaa","bbb"]
          item['value'] = JSON.parse('['+item['value'].replace(new RegExp('" "','gm'),'","')+']')
        } catch(err) {
          // console.log("parse error"+item['value'])
          console.log('parse error')
          console.log(item)
          item['value'] = []
        }
        // console.log(item['constrict'])
      }
      if ( ['dynamicselect','dynamicmultiselect'].includes(item['type']) ) {
        // 动态选择要在 constrict 中添加不存在的value
        item['constrict'] = addDynamicValue(item['value'],item['constrict'])
      }
      if ( Array.isArray(item["constrict"]) ) {
        // [] 数字的值转成字符串
        let x=[]
        item['constrict'].forEach((constrictItem,i) => {
          if(Number.isFinite(constrictItem)){
            x.push(String(constrictItem))
          } else {
            x.push(constrictItem)
          }
        })
        item['constrict'] = x
      }
      formValidate[item['key']] = [
        {
          validator: util.validatorGenerator(item['constrict']),
          trigger: 'blur'
        }
      ]
    })
    
    Object.assign(formItem, util.arry2dict(formdataCopy, 'key', 'value'))
    Object.assign(formComment, util.arry2dict(formdataCopy, 'key', 'comment'))
    Object.assign(formType, util.arry2dict(formdataCopy, 'key', 'type'))
    Object.assign(formConstrict, util.arry2dict(formdataCopy, 'key', 'constrict'))
    Object.assign(formConstrictOrigin, util.arry2dict(formdataCopy, 'key', 'constrict'))
    
    formKey.value = util.dictKeys(formItem)
    realLabelwidth.value = props.labelwidth
  
    formKey.value.forEach((keyItem) => {
      if (realLabelwidth.value < keyItem.length * 8) {
        realLabelwidth.value = keyItem.length * 8
      }
      if (['select_by_http', 'multiselect_by_http', 'dynamicselect_by_http', 'dynamicmultiselect_by_http'].includes(formType[keyItem])) {
        selectConstrictUpdate(keyItem)
      }
    })
  }
  
  const checkValidate = async () => {
    const valid = await constrictForm.value.validate()
    return valid
  }
  
  const loadSessionConstrict = (k) => {
    console.log('通过http获取select的值:', k, formItem, formComment, formType, formConstrict)
    selectConstrictUpdate(k)
  }
  
  
  onMounted(() => {
    updateFormdata()
  })
  
  watch(() => props.formdata, (newVal, oldVal) => {
    updateFormdata()
  }, { deep: true })
  
  defineExpose({
    getFormItem,
    checkValidate
  })

</script>