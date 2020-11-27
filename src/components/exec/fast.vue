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
                <i-switch v-model="formItem.parallel" size="large">
                  <span slot="open">{{ $t('parallel') }}</span>
                  <span slot="close">{{ $t('serial') }}</span>
                </i-switch>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem>
                <Input v-model="formItem.comment" :placeholder="$t('inputCommentTips')" clearable />
              </FormItem>
            </Col>   
            <Col span="1">    
              <FormItem>
                <i-switch v-model="debugRun" size="large">
                  <span slot="open">debug</span>
                  <span slot="close"></span>
                </i-switch>
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

  </Card>
</template>


<script>
  // 
  import util from '@/libs/util'
  import exec from '@/api/exec'
  // import VueI18n from 'vue-i18n'

  export default {
    data () {
      return {
        debugRun: false,
        formItem: {
                    spliter: '|',
                    parallel: true,
                    comment: '',
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
        let debug=0
        if (this.debugRun) {
          debug=1
        }
        exec.postFastExecution(this.formItem,debug)
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
      save () {
        let filename = 'fast_'+util.formatDate((new Date().getTime()) / 1000).replaceAll('-','').replaceAll(':','').replaceAll(' ','_')+'.txt'
        util.write(util.formatDict(this.formItem), filename)
        // console.log('save done')
      },
      read (e) {
        let fileElement =document.getElementById('uploadFile')
        let file = fileElement.files[0]
        // console.log(file)
        util.read(file,['text/plain','text/x-sh']).then(res => {
          // console.log(res)
          this.formItem = util.parseString2Dict(res,['parallel'])
          // console.log(this.formItem)
          // console.log( util.parseString2Dict(res,['parallel']) )
          fileElement.value=""
        }).catch(err => {
          // console.log(err)
          this.$Message.error(err)
        })
      },
      readClick () {
        // console.log("yes click")
        this.$refs['inputFile'].click()
      }
    },
    watch: {
      // '$route': function () {
      //   this.getCurrentPage();
      // }
    },
    mounted () {
      this.originFormItem = util.dictDeepCopy(this.formItem)
      let fast_info = sessionStorage.getItem('fast_info') 
      if (fast_info != null) {
        this.formItem = JSON.parse(fast_info)
      }
    },
    created () {
    }
  }
</script>
