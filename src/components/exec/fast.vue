<template>
  <Card>
    <Form ref="fastForm" :model="formItem" :rules="formItemValidate" :label-width="80">
        <FormItem :label="$t('spliter')">
          <Row>
            <Col span="3">
              <FormItem>
                <Select v-model="formItem.spliter" filterable allow-create @on-create="pushItem">
                  <Option v-for="item in spliterList" :value="item" :key="item">{{ item }}</Option>
                </Select>
              </FormItem>
            </Col>    
            <Col span="14">    
              <FormItem :label="$t('executeType')">
                <Switch v-model="formItem.parallel" size="large">
                  <template #open>
                    <span>{{ $t('parallel') }}</span>
                  </template>
                  <template #close>
                    <span>{{ $t('serial') }}</span>
                  </template>
                </Switch>
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem>
                <Input v-model="formItem.comment" :placeholder="$t('inputCommentTips')" clearable />
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem :label="$t('config')" prop="exeinfo">
            <Input v-model="formItem.exeinfo" type="textarea" :autosize="{minRows: 15}" :placeholder="exeinfoDemo"></Input>
        </FormItem>
        <FormItem label="playbook" prop="playbook">
            <Input v-model="formItem.playbook" type="textarea" :autosize="{minRows: 14}" :placeholder="playbookDemo"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="commit">{{ $t('run') }}</Button>
            <Button style="margin-left: 8px" @click="reset">{{ $t('reset') }}</Button>
            <Button style="margin-left: 8px" @click="save">{{ $t('save') }}</Button>
            <div id="btn" class="ivu-btn ivu-btn-default" style="margin-left:8px; width: 60px; line-height: 2.2;" @click="readClick">
              <span>{{ $t('read') }}</span>
              <input ref='inputFile' style="display: none" type="file" id="uploadFile" @change="read" :name="$t('read')"/>
            </div>
        </FormItem>
    </Form>

    <Modal v-model="commitConfirm" width="30%" :closable="false">
      <p style="color:#f60;">
        <font size="5">
        <Icon type="md-help-circle" size=30></Icon>
        {{ $t('commitTips') }}
        </font>
      </p>
      <div style="margin-top: 20px; margin-left: 20px">
        <span style="color: #515a6e">{{ $t('debugRun') }} </span><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <Switch v-model="debugRun" size="large">
          <template #open>
            <span>debug</span>
          </template>
          <template #close>
            <span></span>
          </template>
        </Switch>
      </div>
      <template #footer>
        <Button type="text" @click="commitConfirm=false">{{ $t('cancel') }}</Button>
        <Button type="primary" @click="realCommit" >{{ $t('commit') }}</Button>
      </template>
    </Modal>

  </Card>
</template>


<script setup>
  import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
  import util from '@/libs/util'
  import exec from '@/api/exec'
  import { useI18n } from 'vue-i18n'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()

  const debugRun = ref(false)
  const commitConfirm = ref(false)
  
  const formItem = reactive({
    spliter: '|',
    parallel: true,
    comment: '',
    exeinfo: '',
    playbook: ''
  })
  
  const originFormItem = reactive({ ...formItem })
  
  const spliterList = ref(['|', '#', ':::', '*'])
  const exeinfoDemo = ref(t('exeinfoDemo'))
  const playbookDemo = ref(t('playbookDemo'))
  
  
  const fastForm = ref(null)
  const inputFile = ref(null)
  
  
  const playbookCheck = (rule, value, callback) => {
    let v = value.split('\n')
    for (var i = 0; i < v.length; i++) {
      // 跳过以"#"开头的注释行
      let reg = new RegExp('^( )*?#.*( )*$')
      if (v[i].search(reg) >= 0) {
        continue
      }
      // 跳过所有以空行
      let reg0 = new RegExp('^( )*$')
      if (v[i].search(reg0) >= 0) {
        continue
      }
      // console.log("X"+v[i]+"X")
      // 非空以及非注释的第一行应该如下 
      // [10.0.0.1]
      let reg2 = new RegExp('^( )*(\\u005B).*?(\\u005D)( )*$')
      if (v[i].search(reg2) >= 0) {
        callback()
        return
      } else {
        callback(new Error(t('playbookFistLineTips'))) 
        return
      }
    }
    callback(new Error(t('playbookNotEmptyTips'))) 
  }
  
  // 表单验证规则
  const formItemValidate = reactive({
    exeinfo: [
      {
        required: true,
        message: t('inputConfigTips'),
        trigger: 'blur'
      },
    ],
    playbook: [
      {
        required: true,
        message: t('inputPlaybookTips'),
        trigger: 'blur'
      },
      {
        validator: playbookCheck,
        trigger: 'blur'
      }
    ],
  })
  
  
  const pushItem = (k) => {
    spliterList.value.push(k)
  }
  
  const reset = () => {
    sessionStorage.removeItem("fastInfo")
    Object.assign(formItem, util.dictDeepCopy(originFormItem))
  }
  
  const commit = () => {
    sessionStorage.setItem("fastInfo", JSON.stringify(formItem))
    
    fastForm.value.validate((valid) => {
      if (valid) {
        commitConfirm.value = true
      } else {
        commitConfirm.value = false
        proxy.$Message.error(t('changeTips'))
      }
    })
  }
  
  const realCommit = () => {
    let debug = debugRun.value ? 1 : 0
    commitConfirm.value = false
    
    exec.postFastExecution(formItem, debug)
      .then(res => {
        if (res.data['status'] > 0) {
          util.notice(proxy, t('fastJobBegin'), 'info')
          let path = `/orderInfo?workid=${res.data['data']}`
          window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const save = () => {
    // 修复 replaceAll 兼容性问题，使用正则全局替换
    let timeStr = util.formatDate((new Date().getTime()) / 1000)
      .replace(/-/g, '')
      .replace(/:/g, '')
      .replace(/ /g, '_')
      
    let filename = `fast_${timeStr}.txt`
    util.write(util.formatDict(formItem), filename)
  }
  
  const read = (e) => {
    //let fileElement = document.getElementById('uploadFile')
    let fileElement = inputFile.value
    let file = fileElement.files[0]
  
    util.read(file, ['text/plain', 'text/x-sh']).then(res => {
      Object.assign(formItem, util.parseString2Dict(res, ['parallel']))
      fileElement.value = ''
    }).catch(err => {
      proxy.$Message.error(err)
    })
  }
  
  const readClick = () => {
    inputFile.value.click()
  }
  
  onMounted(() => {
    let fastInfo = sessionStorage.getItem('fastInfo')
    if (fastInfo != null) {
      const parsedInfo = JSON.parse(fastInfo)
      Object.assign(formItem, parsedInfo)
    }
  })
</script>
