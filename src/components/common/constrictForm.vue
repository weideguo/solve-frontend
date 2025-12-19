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
      formConstrictOrigin: {},
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
    addDynamicValue (itemValue,itemConstrict) {
      // 在 constrict 中添加不存在的value
      // console.log(item['constrict'])
      // console.log(item['value'])
      if ( itemValue == undefined ) {
        itemValue = []  
      } 

      let tmpItemValues = itemValue
      if ( !Array.isArray(itemValue) ) {
        // "aaa" -> ["aaa"]
        tmpItemValues = []
        tmpItemValues.push(itemValue)
      } 
      if ( Array.isArray(itemConstrict[0])) {
        // constrict = [["111","说明1"],["222","说明2"]]
        //
        let tmpItemConstrict = []
        itemConstrict.forEach((constrictItem,i) => {
          tmpItemConstrict.push(constrictItem[0])
        })

        tmpItemValues.forEach((valueItem,i) => {
          if ( !tmpItemConstrict.includes(valueItem) ) {
            itemConstrict.push([valueItem,this.$t('new')])
          }
        })

      } else {
        // constrict = ["111","222"]
        itemConstrict = util.listCombine(itemConstrict,tmpItemValues)
      }
      return itemConstrict
    },
    httpParamsReplace(httpParams, valueFull) {
      // 对于 {{aaa}} 的变量，替换为值
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
        // 存在未替换的变量 {{ xxx }}
        let k = value.match(/\{\{\s*(\w+)\s*\}\}/g)
        if (k) {
          return k
        }
      }
    },
    selectConstrictUpdate (keyItem) {
      // 通过http请求获取可选值
      let itemConstrictCopy = util.dictDeepCopy(this.formConstrictOrigin[keyItem])
      console.log(`通过http获取${keyItem}请求参数为:`)
      console.log(itemConstrictCopy)
      this.formType[keyItem] = this.formType[keyItem].split('_')[0]

      this.formConstrict[keyItem] = itemConstrictCopy['options']
      // 先提前设置一次，考虑到http请求可能出现失败
      if ( ['dynamicselect','dynamicmultiselect'].includes(this.formType[keyItem]) ) {
        this.formConstrict[keyItem] = this.addDynamicValue(this.formItem[keyItem],this.formConstrict[keyItem])
        // todo 处理返回的值使得复合多选框
      }

      let url = itemConstrictCopy['url']
      let valuePath = itemConstrictCopy['value_path']
      let commentPath = itemConstrictCopy['comment_path']
      let method = 'GET'
      let headers = itemConstrictCopy['header']
      let params = {
        'method': method,
        'headers': headers,
      }
      if (!url) {
        // todo 替换成支持多语言字符串
        this.$Message.error(keyItem+' '+this.$t(`urlFieldNotInYAML`))  
        throw new Error(keyItem+' '+'yaml配置文件中url字段不存在')
      }
      if ( ('get' in itemConstrictCopy) && (itemConstrictCopy['get'] != null) && (Object.keys(itemConstrictCopy['get']).length > 0 ) ) {
        let k = this.httpParamsReplace(itemConstrictCopy['get'],this.formItem)
        if (k) {
          console.log('不能发起http请求，存在未替换的变量'+' '+k) 
          this.$Message.error(this.$t(`renderParamsExist`)+' '+k) 
          return 
        }
        const urlTmp = new URL(url);
        const searchParams = new URLSearchParams(urlTmp.search);
        for (const [key, value] of Object.entries(itemConstrictCopy['get'])) {
          searchParams.set(key, value)
        }
        urlTmp.search = searchParams.toString();
        url = urlTmp.toString();
      }

      if ( ('post' in itemConstrictCopy)){
        params['method'] = 'POST'
        params['body'] = '{}'
        if ((itemConstrictCopy['post'] != null) && (Object.keys(itemConstrictCopy['post']).length > 0 )) {
          let k = this.httpParamsReplace(itemConstrictCopy['post'],this.formItem)
          if (k) {
            console.log('不能发起http请求，存在未替换的变量'+' '+k) 
            this.$Message.error(this.$t(`renderParamsExist`)+' '+k) 
            return 
          }
          params['body'] = JSON.stringify(itemConstrictCopy['post'])
        }
      }
      console.log(url,params)
      fetch(url,params)
        .then(res => {
          if (!res.ok) {
            throw new Error('发起http请求报错')
          }
          return res.json()
        }).then(json => {
          console.log(`通过http获取${keyItem}值为:`)
          console.log(json)
          let selectValue = util.getJsonSubElementByKeyPath(json,valuePath)

          let selectComment = null
          if (commentPath) {
            selectComment = util.getJsonSubElementByKeyPath(json,commentPath)
          }
          
          if (selectValue && Array.isArray(selectValue) && selectValue.length > 0) {
            this.formConstrict[keyItem] = selectValue
            if (selectComment && Array.isArray(selectComment) && selectComment.length > 0) {
              this.formConstrict[keyItem] = selectValue.map((item, index) => [item, selectComment[index]])
            }
          }
          // 通过http请求获取到可选值后，再根据已有值重新设置可选值
          if ( ['dynamicselect','dynamicmultiselect'].includes(this.formType[keyItem]) ) {
            this.formConstrict[keyItem] = this.addDynamicValue(this.formItem[keyItem],this.formConstrict[keyItem])
          }
          this.$Message.info(this.$t('updateSelectConstrinctSuccess')+' '+keyItem)
        }).catch(error => {
          this.$Message.error(keyItem+' '+this.$t(`httpRequestError`))   
          console.error(keyItem+'\n'+error);
        })      
    },
    updateFormdata() {
      let formdataCopy = util.dictDeepCopy(this.formdata)
      // 
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
          item['constrict'] = this.addDynamicValue(item['value'],item['constrict'])
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
      this.formConstrictOrigin = util.arry2dict(formdataCopy,'key','constrict')
      this.formKey = util.dictKeys(this.formItem) 
      // 根据表单label的字符串弹性设置表单label长度，每个字符占8px
      this.realLabelwidth = this.labelwidth
      console.log(formdataCopy)
      
      this.formKey.forEach((keyItem,i) => {
        if (this.realLabelwidth < keyItem.length*8) {
          this.realLabelwidth = keyItem.length*8
        }

        if ( ['select_by_http','multiselect_by_http','dynamicselect_by_http','dynamicmultiselect_by_http']
          .includes(this.formType[keyItem]) ) {
          this.selectConstrictUpdate(keyItem)
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
    },
    loadSessionConstrict(k) {
      console.log('通过http获取select的值: '+ k)
      console.log(this.formItem )
      console.log(this.formComment )
      console.log(this.formType )
      console.log(this.formConstrict )
      this.selectConstrictUpdate(k)
    },
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


