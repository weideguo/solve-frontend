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
          <Button type="dashed" long @click="handleReset()" >{{ $t('reset') }}</Button>
        </Col>
      </Row>
    </div>
    <div :style="{height: buttonDivHeight}"> 
      <div :style="{'float': 'right', 'margin-top': buttonMarginTop}"> 
        <Button style="margin-right: 5px" @click="secondClick()">{{_secondButtonName}}</Button>
        <Button type="primary" @click="primaryClick()">{{_primaryButtonName}}</Button>
      </div>
    </div>
  </Form>
</template>

<script setup>
  import { ref, reactive, computed, watch, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import util from '@/libs/util'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const props = defineProps({
    formdata: {
      type: Array,
      default: () => []
    },
    formvalidate: {
      type: Object,
      default: () => ({})
    },
    dynamicData: {
      type: Object,
      default: () => ({})
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
    }
  })
  
  const emit = defineEmits(['primaryClick', 'secondClick'])
  
  const realLabelwidth = ref(0)
  const formValue = ref({})
  const formSelect = ref({})
  const formComment = ref({})
  const formLabel = ref({})
  const formDynamic = ref([])
  
  // 表单
  const safeform = ref(null)
  
  const formKey = computed(() => {
    return util.dictKeys(formValue.value)
  })
  
  const allValue = computed(() => {
    let info = util.dict2arry(formValue.value, 'key', 'value')
    return util.arry2dict(util.listCombine(info, formDynamic.value), 'key', 'value')
  })
  
  const _primaryButtonName = computed(() => {
    if (props.primaryButtonName) {
      return props.primaryButtonName
    }
    return t('confirm')
  })
  
  const _secondButtonName = computed(() => {
    if (props.secondButtonName) {
      return props.secondButtonName
    }
    return t('cancel')
  })
  
  const _inputFieldTips = computed(() => {
    if (props.inputFieldTips) {
      return props.inputFieldTips
    }
    return t('inputFieldTips')
  })
  
  const _inputValueTips = computed(() => {
    if (props.inputValueTips) {
      return props.inputValueTips
    }
    return t('inputValueTips')
  })
  
  const primaryClick = () => {
    if (props.formdata.length !== 0) {
      safeform.value.validate((valid) => {
        let spaceStr = util.isDictNoSpace(allValue.value)
        if (spaceStr !== '') {
          proxy.$Message.error(t('form.checkErr') + " :[" + spaceStr + "]")
        } else {
          if (valid) {
            proxy.$Message.success(t('commitBegin'))
            emit('primaryClick', allValue.value)
            handleReset()            
          } else {
            proxy.$Message.error(t('form.checkErr'))
          } 
        }
      })  
    } else {
      proxy.$Message.success(t('commitBegin'))
      emit('primaryClick', allValue.value)
      handleReset()
    }
  }
  
  const secondClick = () => {
    if (props.secondCheck) {
      safeform.value.validate((valid) => {
        if (valid) {
          emit('secondClick', this.allValue)
          handleReset()
        } else {
          peoxy.$Message.error(this.$t('form.checkErr'))
        }
      })
    } else {
      emit('secondClick', allValue.value)
      handleReset()
    }
  }
  
  const handleReset = () => {
    safeform.value.resetFields()
    formDynamic.value = util.dict2arry(props.dynamicData, 'key', 'value')
  }
  
  const handleRemove = (index) => {
    formDynamic.value.splice(index, 1)
  }
  
  const handleAdd = () => {
    formDynamic.value.push({ key: '', value: '' })
  }
  
  watch(() => props.formdata, (val, oldval) => {
    formValue.value = util.arry2dict(val, 'key', 'value')
    formSelect.value = util.arry2dict(val, 'key', 'select')
    formComment.value = util.arry2dict(val, 'key', 'comment')
    formLabel.value = util.arry2dict(val, 'key', 'label')
    // 根据表单label的字符串弹性设置表单label长度，每个字符占8px
    realLabelwidth.value = props.labelwidth
    util.dictKeys(formValue.value).forEach((item, i) => {
      if (realLabelwidth.value < item.length * 8) {
        realLabelwidth.value = item.length * 8
      }
    })
  }, { deep: true })
  
  watch(() => props.dynamicData, (val, oldval) => {
    formDynamic.value = util.dict2arry(val, 'key', 'value')
  })
</script>