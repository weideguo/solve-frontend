<template>
  <Form :ref="formRef" :label-width="realLabelwidth" :model="formItem" :rules="formValidate">
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


<script>
import util from '@/libs/util'
// import VueI18n from 'vue-i18n'

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
      default: ''
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
      realLabelwidth: 0,
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
      currentKey: "",    // 当前触发的key名
    }
  },
  methods: {
    openChange(k) {
      this.currentKey = k
    },
    pushItem(val) {
      if ( this.formConstrict[this.currentKey] != undefined && Array.isArray(this.formConstrict[this.currentKey][0])) {
        this.formConstrict[this.currentKey].push([val,this.$t('new')])
      } else {
        this.formConstrict[this.currentKey].push(val)
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
      // this.$emit('buttonOperation', this.formItem)
      this.$emit('buttonOperation', this.getFormItem())
    },
    updateFormdata() {
      let formdataCopy = util.dictDeepCopy(this.formdata)
      // 
      formdataCopy.forEach((item,i) => {
        if ( ( ['multiselect','dynamicmultiselect'].includes(item['type']) ) && ( (typeof item['value']) != 'object') ){
          // 列表在后端存储时以两个空格分隔
          // item['value'] = item['value'].split('  ')  
          // 后端存储时以字符串转换，因而从后端获取时应该先进行转换
          try {
            // "\"aaa\" \"bbb\""  ===> "[\"aaa\",\"bbb\"]" ===> ["aaa","bbb"]
            item['value'] = JSON.parse("["+item['value'].replace(new RegExp("\" \"","gm"),"\",\"")+"]")
          } catch(err) {
            // console.log("parse error"+item['value'])
            console.log("parse error")
            console.log(item)
            item['value'] = []
          }
          // console.log(item['constrict'])
        }
        if ( ['dynamicselect','dynamicmultiselect'].includes(item['type']) ) {
          // 动态选择要在 constrict 中添加不存在的value
          // console.log(item['constrict'])
          // console.log(item['value'])
          if ( item['constrict'] == undefined ) {
            item['constrict'] = []  
          } 

          let tmpItemValues = item['value']
          if ( !Array.isArray(item['value']) ) {
            // "aaa" -> ["aaa"]
            tmpItemValues = []
            tmpItemValues.push(item['value'])
          } 
          if ( Array.isArray(item['constrict'][0])) {
            // constrict = [["111","说明1"],["222","说明2"]]
            //
            let tmpItemConstrict = []
            item['constrict'].forEach((constrictItem,i) => {
              tmpItemConstrict.push(constrictItem[0])
            })

            tmpItemValues.forEach((valueItem,i) => {
              if ( !tmpItemConstrict.includes(valueItem) ) {
                item['constrict'].push([valueItem,this.$t('new')])
              }
            })

          } else {
            // constrict = ["111","222"]
            item['constrict'] = util.listCombine(item['constrict'],tmpItemValues)
          }

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
      // 根据表单label的字符串弹性设置表单label长度，每个字符占8px
      this.realLabelwidth = this.labelwidth
      this.formKey.forEach((keyItem,i) => {
          if (this.realLabelwidth < keyItem.length*8) {
              this.realLabelwidth = keyItem.length*8
          }
      })
    },
    checkValidate() {
      // console.log(this.formItem)
      let f
      this.$refs[this.formRef].validate((valid) => {
        f = valid
      })
      return f
    },
    getFormItem() {
      function p (s) {
        return s < 10 ? '0' + s : s;
      }
      for( let k in this.formItem) {
        // 为时间类型是格式转换
        if ( this.formItem[k] instanceof Date) {
          let d=this.formItem[k]
          let date = (d.getFullYear()) + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
          this.formItem[k] = date
        }
      }
      // console.log(this.formItem)
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
    _buttonName () {
      if (this.buttonName) {
        return this.buttonName
      }
      return this.$t('save')
    }
  },
  mounted () {
    this.updateFormdata()
  }
}
</script>


