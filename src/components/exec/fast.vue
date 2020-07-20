<template>
  <Card>
    <Form ref="fastForm" :model="formItem" :rules="formItemValidate" :label-width="80">

        <FormItem :label="$t('spliter') " >
          <Select v-model="formItem.spliter" filterable allow-create @on-create="pushItem">
                <Option v-for="item in spliterList" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('executeType')">
          <i-switch v-model="formItem.parallel" size="large">
            <span slot="open">{{ $t('parallel') }}</span>
            <span slot="close">{{ $t('serial') }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('config')" prop="exeinfo">
            <Input v-model="formItem.exeinfo" type="textarea" :autosize="{minRows: 15}" :placeholder="exeinfoDemo"></Input>
        </FormItem>
        <FormItem label="playbook" prop="playbook">
            <Input v-model="formItem.playbook" type="textarea" :autosize="{minRows: 10}" :placeholder="playbookDemo"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="commit">{{ $t('run') }}</Button>
            <Button style="margin-left: 8px" @click="reset">{{ $t('reset') }}</Button>
        </FormItem>
    </Form>

  </Card>
</template>


<script>
  // 
  import util from '@/libs/util'
  import exec from '@/api/exec'
  import VueI18n from 'vue-i18n'

  export default {
    data () {
      return {
        formItem: {
                    spliter: '|',
                    parallel: true,
                    exeinfo: '',
                    playbook: ''
                  },
        originFormItem: {},
        spliterList: ['|','#',':::','*'],
        formItemValidate: {
          exeinfo: [
            {
              required: true,
              message: this.$t('inputConfigTips'),
              trigger: 'blur'
            },
          ],
          playbook: [
            {
              required: true,
              message: this.$t('inputPlaybookTips'),
              trigger: 'blur'
            },
            {
              validator: this.playbookCheckGenerator(),
              trigger: 'blur'
            }
          ],
        },
        // commitConfirm: false,
        exeinfoDemo: this.$t('exeinfoDemo'),
        playbookDemo: this.$t('playbookDemo')
      }
    },
    methods: {
      pushItem (k) {
        this.spliterList.push(k)
        // console.log(k)
      },
      reset () {
        sessionStorage.removeItem("fast_info")
        this.formItem = util.dictDeepCopy(this.originFormItem)
      },
      commit(){
        sessionStorage.setItem("fast_info", JSON.stringify(this.formItem))
        this.$refs['fastForm'].validate((valid) => {
            if (valid) {
              // this.commitConfirm = true
              this.$Modal.confirm({'title': this.$t('commitTips') ,'onOk': this.realCommit, 'okText': this.$t('commit'), 'cancelText': this.$t('cancel')})
            } else {
              // this.commitConfirm = false
              this.$Message.error(this.$t('changeTips'))
            }
        })
      },
      realCommit() {
        // console.log(this.formItem)
        exec.postFastExecution(this.formItem)
          .then(res => {
            if (res.data['status'] > 0) {
              util.notice(this, this.$t('fastJobBegin'), 'info')
              // {"data":"job_2335ce026b4311ea8fd6000c295dd589","status":1}
              util.openPageEx(this, 'orderDetail', {workid: res.data['data']})
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      playbookCheckGenerator () {
        return function(rule, value, callback) {
          let v=value.split('\n')
          for(var i=0;i<v.length;i++){
            // 跳过以"#"开头的注释行
            let reg = new RegExp('^( )*?#.*( )*$')
            if ( v[i].search(reg) >= 0 ) {
              continue
            } 
            // 跳过所有以空行
            let reg0 = new RegExp('^( )*$')
            if ( v[i].search(reg0) >= 0 ) {
              continue
            } 
            // console.log("X"+v[i]+"X")
            // 非空以及非注释的第一行应该如下
            // [10.0.0.1]
            let reg2 = new RegExp('^( )*(\\u005B).*?(\\u005D)( )*$')
            if ( v[i].search(reg2) >= 0 ) {
              callback()
            } else {
              callback(new Error(this.$t('playbookFistLineTips')))
            }
            // 只对非空以及非注释的第一行判断
            break
          }
          callback(new Error(this.$t('playbookNotEmptyTips')))
        }
      },
    },
    watch: {
      // '$route': function () {
      //   this.getCurrentPage();
      // }
    },
    mounted () {
      this.originFormItem = util.dictDeepCopy(this.formItem)
      let fast_info = sessionStorage.getItem("fast_info") 
      if (fast_info != null) {
        this.formItem = JSON.parse(fast_info)
      }
    },
    created () {
    }
  }
</script>
