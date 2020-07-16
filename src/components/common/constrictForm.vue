<template>
  <Form :ref="formRef" :label-width="labelwidth" :model="formItem" :rules="formValidate">
    <p v-if="JSON.stringify(formItem) === '{}'" style="text-align: center">{{nullInfo}}</p>
    <div v-else>
      
      <FormItem v-for="k in formKey" :prop="k" :key="k" :label="k">
        <Select v-if="formType[k] === 'select'" v-model="formItem[k]" :placeholder="formComment[k]" clearable>
          <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
        </Select>
        <Select v-else-if="formType[k] === 'multiselect'" v-model="formItem[k]" :placeholder="formComment[k]" multiple>
          <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
        </Select>
        <Select v-else-if="formType[k] === 'dynamicselect'" v-model="formItem[k]" :placeholder="formComment[k]" multiple filterable allow-create @on-create="pushItem(k)">
          <Option v-for="j in formConstrict[k]" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
        </Select>
        <div v-else-if="formType[k] === 'upload'" >
          <Input v-model="formItem[k]" type="text" :placeholder="formComment[k]" clearable style="width: 80%"></Input>
          <Upload style="float: right;" :show-upload-list="false" :action="uploadUrl" :headers='myheader' :on-success="uploadSuccess(formItem,k)" ref="upload">
            <Button icon="ios-cloud-upload-outline">{{ $t('selectFile') }}</Button>
          </Upload>
          <div style="clear:both"></div>
        </div>
        <Input v-else v-model="formItem[k]" type="textarea" :autosize="true" :placeholder="formComment[k]" clearable></Input>
      </FormItem>

      <div style="float:right;" >
        <Tooltip :content="buttonTooltip" placement="bottom">
          <Button @click="buttonOperation" type="primary" ghost>{{buttonName}}</Button>
        </Tooltip>
      </div>
      <div  style="clear:both"></div>
    </div>   
  </Form>
</template>


<script>
import util from '@/libs/util'
import VueI18n from 'vue-i18n'

export default {
  name: 'constrictForm',
  props: {
    nullInfo: String,
    formdata: {
      type: Array,
      default: function () {
        return []
      }
    },
    buttonTooltip: {
      type: String,
      default: ''
    },
    buttonName: {
      type: String,
      default: 'save'
    },
    formRef: {
      type: String,
      default: 'constrictForm'
    },
    labelwidth: {
      type: Number,
      default: 100
    }
  },
  data () {
    return {
      formItem: {},
      formComment: {},
      formType: {},
      formConstrict: {},
      formKey: [],
      formValidate: {},
      myheader: {
        'Authorization': sessionStorage.getItem('jwt')
      },
      baseurl: this.$store.getters.sessionGet('baseurl'),
    }
  },
  methods: {
    pushItem(k) {
      return function(val) {
        this.formConstrict[k].push(val)
      }
    },
    uploadSuccess (formItem,k) {
      return function (f) {
        formItem[k]=f.file
        util.notice(this, f.msg, 'info')
      }
    },
    buttonOperation() {
      // console.log(this.formItem)
      this.$emit('buttonOperation', this.formItem)
    },
    updateFormdata() {
      let formdataCopy = util.dictDeepCopy(this.formdata)
      // 
      formdataCopy.forEach((item,i) => {
        if ( (item['type'] === 'multiselect' || item['type'] === 'dynamicselect') && ( (typeof item['value']) != 'object') ){
          // 列表在后端存储时以两个空格分隔
          // item['value'] = item['value'].split('  ')  
          // 后端存储时以字符串转换，因而从后端获取时应该先进行转换
          try{
            // "\"aaa\" \"bbb\""  ===> "[\"aaa\",\"bbb\"]" ===> ["aaa","bbb"]
            item['value'] = JSON.parse("["+item['value'].replace(new RegExp("\" \"","gm"),"\",\"")+"]")
          } catch(err) {
            // console.log("parse error"+item['value'])
            console.log("parse error")
            console.log(item)
            item['value'] = []
          }
          item['constrict']=util.listCombine(item['constrict'],item['value'])
          // console.log(item['constrict'])
        }
        if ( ((typeof item['constrict']) === 'object') && item['constrict'][0] ) {
          // [] 数字的值转成字符串
          let x=[]
          item['constrict'].forEach((item,i) => {
            x.push(String(item))
          })
          item['constrict'] = x
        }
        this.formValidate[item['key']] = [
          {
            validator: util.validatorGenerator(item['constrict']),
            trigger: 'blur'
          }
        ]
      })
      this.formItem = util.arry2dict(formdataCopy,'key','value')
      this.formComment = util.arry2dict(formdataCopy,'key','comment')
      this.formType = util.arry2dict(formdataCopy,'key','type')
      this.formConstrict = util.arry2dict(formdataCopy,'key','constrict')
      this.formKey = util.dictKeys(this.formItem)          
    },
    checkValidate() {
      let f
      this.$refs[this.formRef].validate((valid) => {
        f = valid
      })
      return f
    },
    getFormItem() {
      return this.formItem
    }
  },
  watch:{
    formdata: {
      handler: function(val,oldval) {
        this.updateFormdata()
      },
      deep: true
    }
  },
  computed: {
    uploadUrl () {
      let d = new Date()
      return this.baseurl + '/file/?path=' + d.getFullYear()+''+(d.getMonth()+1)+''+d.getDate()+'/'+d.valueOf()
    },
  },
  mounted () {
    this.updateFormdata()
  }
}
</script>


