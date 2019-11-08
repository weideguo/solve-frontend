<template>
  <Form ref="safeform" :label-width="labelwidth" :model="formValue"  :rules="formvalidate">
    
      <FormItem v-for="i in formKey" :prop="i" :label="formLabel[i]" :key="i">
        <Select v-if="typeof(formSelect[i]) === 'object'" v-model="formValue[i]" :placeholder="formComment[i]" clearable>
          <Option v-for="j in formSelect[i]" :value="j" :key="j">{{ j }}</Option>
        </Select>
        <Input v-else v-model="formValue[i]" :placeholder="formComment[i]" clearable></Input>
      </FormItem> 

      <div v-if="dynamic">
      <FormItem v-for="(item, index) in formDynamic" :key="index">  
          <Row>
            <Col span="5">
            <Input type="text" v-model="item.key" placeholder="请输入字段名"></Input>
            </Col>
            <Col span="13" offset="1">
            <Input type="text" v-model="item.value" placeholder="请输入值"></Input>
            </Col>
            <Col span="4" offset="1">
            <!---->
            <Button type="dashed" @click="handleRemove(index)">删除</Button>
            </Col>
          </Row>
        </FormItem>
      <Row>
        <Col span="12">
        <Button type="dashed" long @click="handleAdd" >添加字段</Button>
        </Col>
        <Col span="12">
        <Button type="dashed" long @click="handleReset('safeform')" >重置</Button>
        </Col>
      </Row>
      </div>
      <div :style="{height: buttonDivHeight}"> 
        <div :style="{'float': 'right', 'margin-top': buttonMarginTop}"> 
          <Button style="margin-right: 5px" @click="secondClick('safeform')">{{secondButtonName}}</Button>
          <Button type="primary" @click="primaryClick('safeform')">{{primaryButtonName}}</Button>
        </div>
      </div>
    </Form>
  </Form>
</template>

<script>
// import axios from 'axios'
import util from '@/libs/util'
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
      default: '取消'
    },
    primaryButtonName: {
      type: String,
      default: '确定'
    },
    secondCheck: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
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
          if (valid) {
            this.$Message.success('正在提交')
            this.$emit('primaryClick', this.allValue)
            this.handleReset(name)
          } else {
            this.$Message.error('表单检查失败')
          }
        })
      } else {
        this.$Message.success('正在提交')
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
            this.$Message.error('表单检查失败')
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
    }
  },
  watch:{
    formdata: {
      handler: function(val,oldval) {
        this.formValue = util.arry2dict(this.formdata, 'key', 'value')
        this.formSelect = util.arry2dict(this.formdata, 'key', 'select')
        this.formComment = util.arry2dict(this.formdata, 'key', 'comment')
        this.formLabel = util.arry2dict(this.formdata, 'key', 'label')     
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