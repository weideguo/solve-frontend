<template>
  <Form ref="safeform" :label-width="realLabelwidth" :model="formValue"  :rules="formvalidate">
    
      <FormItem v-for="i in formKey" :prop="i" :label="formLabel[i]" :key="i">
        <Select v-if="typeof(formSelect[i]) === 'object'" v-model="formValue[i]" :placeholder="formComment[i]" clearable filterable>
          <Option v-for="j in formSelect[i]" :value="j" :key="j">{{ j }}</Option>
        </Select>
        <Input v-else v-model="formValue[i]" :placeholder="formComment[i]" clearable></Input>
      </FormItem> 

      <div v-if="dynamic">
      <FormItem v-for="(item, index) in formDynamic" :key="index">  
          <Row>
            <Col span="5">
            <Input type="text" v-model="item.key" :placeholder="_inputFieldTips"></Input>
            </Col>
            <Col span="13" offset="1">
            <Input type="text" v-model="item.value" :placeholder="_inputValueTips"></Input>
            </Col>
            <Col span="4" offset="1">
            <!---->
            <Button type="dashed" @click="handleRemove(index)">{{ $t('delete') }}</Button>
            </Col>
          </Row>
        </FormItem>
      <Row>
        <Col span="12">
        <Button type="dashed" long @click="handleAdd" >{{ $t('addField') }}</Button>
        </Col>
        <Col span="12">
        <Button type="dashed" long @click="handleReset('safeform')" >{{ $t('reset') }}</Button>
        </Col>
      </Row>
      </div>
      <div :style="{height: buttonDivHeight}"> 
        <div :style="{'float': 'right', 'margin-top': buttonMarginTop}"> 
          <Button style="margin-right: 5px" @click="secondClick('safeform')">{{_secondButtonName}}</Button>
          <Button type="primary" @click="primaryClick('safeform')">{{_primaryButtonName}}</Button>
        </div>
      </div>
    </Form>
  </Form>
</template>

<script>
import util from '@/libs/util'
// import VueI18n from 'vue-i18n'

export default {
  name: 'safeForm',
  props: {
    formdata: {
      type: Array,
      default: function () {
        return []
      }
    },
    formvalidate: {
      type: Object,
      default: function () {
        return {}
      }
    },
    dynamicData: {
      type: Object,
      default: function () {
        return {}
      }
    },
    labelwidth: Number,
    buttonDivHeight: {
      type: String,
      default: '40px'
    },
    buttonMarginTop: {
      type: String,
      default: '10px'
    },
    dynamic: {
      type: Boolean,
      default: false
    },
    secondButtonName: {
      type: String,
      default: ''
    },
    primaryButtonName: {
      type: String,
      default: ''
    },
    secondCheck: {
      type: Boolean,
      default: false
    },
    inputFieldTips: {
      type: String,
      default: ''
    },
    inputValueTips: {
      type: String,
      default: ''
    },
  },
  data () {
    return {
      realLabelwidth: 0,
      formValue: {},
      formSelect: {},
      formComment: {},
      formLabel: {},
      formDynamic: []
    }
  },
  methods: {
    primaryClick (name) {
      if (this.formdata.length != 0){
        this.$refs[name].validate((valid) => {
          let spaceStr = util.isDictNoSpace(this.allValue)
          if (spaceStr != '') {
            this.$Message.error(this.$t('form.checkErr')+" :["+spaceStr+"]")
          } else {
            if (valid) {
                this.$Message.success(this.$t('commitBegin'))
                this.$emit('primaryClick', this.allValue)
                this.handleReset(name)
            } else {
                this.$Message.error(this.$t('form.checkErr'))
            }              
          }
        })
      } else {
        this.$Message.success(this.$t('commitBegin'))
        this.$emit('primaryClick', this.allValue)
        this.handleReset(name)
      }
    },
    secondClick (name) {
      if (this.secondCheck) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            // this.$Message.success('表单检查通过')
            this.$emit('secondClick', this.allValue)
            this.handleReset(name)
          } else {
            this.$Message.error(this.$t('form.checkErr'))
          }
        })
      } else {
        this.$emit('secondClick', this.allValue)
        // this.$refs[name].resetFields()
        this.handleReset(name)
      }
    },
    handleReset (name) {
      this.$refs[name].resetFields()
      this.formDynamic = util.dict2arry(this.dynamicData, 'key', 'value')
    },
    handleRemove (index) {
      this.formDynamic.splice(index, 1)
    },
    handleAdd () {
      this.formDynamic.push({key: '', value: ''});
    }
  },
  computed: {
    formKey () {
      return util.dictKeys(this.formValue)
    },
    allValue () {
      let info = util.dict2arry(this.formValue, 'key', 'value')
      return util.arry2dict(util.listCombine(info, this.formDynamic), 'key', 'value')
    },
    _primaryButtonName () {
      if(this.primaryButtonName) {
        return this.primaryButtonName
      } 
      return this.$t('confirm')
    },
    _secondButtonName () {
      if(this.secondButtonName) {
        return this.secondButtonName
      } 
      return this.$t('cancel')
    },
    _inputFieldTips () {
      if(this.inputFieldTips) {
        return this.inputFieldTips
      }
      return this.$t('inputFieldTips')
    },
    _inputValueTips () {
      if (this.inputValueTips) {
        return this.inputValueTips
      }
      return this.$t('inputValueTips')
    }
  },
  watch:{
    formdata: {
      handler: function(val,oldval) {
        this.formValue = util.arry2dict(this.formdata, 'key', 'value')
        this.formSelect = util.arry2dict(this.formdata, 'key', 'select')
        this.formComment = util.arry2dict(this.formdata, 'key', 'comment')
        this.formLabel = util.arry2dict(this.formdata, 'key', 'label')
        // 根据表单label的字符串弹性设置表单label长度，每个字符占8px
        this.realLabelwidth = this.labelwidth
        util.dictKeys(this.formValue).forEach((item,i) => {
            if (this.realLabelwidth < item.length*8) {
                this.realLabelwidth = item.length*8
            }
        })
      },
      deep: true
    },
    dynamicData: {
      handler: function(val,oldval) {
        this.formDynamic = util.dict2arry(this.dynamicData, 'key', 'value')
      }
    }
  },
  mounted () {
  }
};
</script>