<template>
  <Card>
    <Form ref="fastForm" :model="formItem" :rules="formItemValidate" :label-width="80">

        <FormItem label="分隔符" >
          <Select v-model="formItem.spliter" filterable allow-create @on-create="pushItem">
                <Option v-for="item in spliterList" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="执行方式">
          <i-switch v-model="formItem.parallel" size="large">
            <span slot="open">并行</span>
            <span slot="close">串行</span>
          </i-switch>
        </FormItem>
        <FormItem label="配置信息" prop="exeinfo">
            <Input v-model="formItem.exeinfo" type="textarea" :autosize="{minRows: 15}" :placeholder="exeinfoDemo"></Input>
        </FormItem>
        <FormItem label="playbook" prop="playbook">
            <Input v-model="formItem.playbook" type="textarea" :autosize="{minRows: 10}" :placeholder="playbookDemo"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="commit">执行</Button>
            <Button style="margin-left: 8px" @click="reset">重置</Button>
        </FormItem>
    </Form>
  </Card>
</template>


<script>
  // 
  import util from '@/libs/util'
  import exec from '@/api/exec'

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
              message: '请输入配置信息',
              trigger: 'blur'
            },
          ],
          playbook: [
            {
              required: true,
              message: '请输入playbook',
              trigger: 'blur'
            },
            {
              validator: this.playbookCheckGenerator(),
              trigger: 'blur'
            }
          ],
        },
        exeinfoDemo: 
                     '# 每一行通过分割符分割后当成一个对象使用playbook执行       \n'+
                     '# 样例如：                                              \n'+
                     '10.0.0.1  |  whoami  |  pwd                            \n'+
                     '10.0.0.2  |  who     |  date                            \n'+
                     '10.0.0.3  |  date    |  who                              ',
        playbookDemo: 
                      '# 使用方式跟普通的playbook类似                                      \n'+
                      '# 不同之处为使用 _1 _2 _3 ... 接受单行配置信息分割后的对应参数         \n'+
                      '# 样例如：                                                          \n'+
                      '[{{_1}}]                                                           \n'+
                      'echo {{_2}}                                                        \n'+
                      'echo {{_3}}                                                          ',
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
              this.$Modal.confirm({'title': '确认执行？','onOk': this.realCommit, 'cancelText': '取消'})
            } else {
              this.$Message.error('请按照提示更改输入项')
            }
        })
      },
      realCommit() {
        // console.log(this.formItem)
        exec.postFastExecution(this.formItem)
          .then(res => {
            if (res.data['status'] > 0) {
              util.notice(this, '开始执行快速任务', 'info')
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
              callback(new Error('非空以及非注释的第一行应该为跳转语句 [XXX]'))
            }
            // 只对非空以及非注释的第一行判断
            break
          }
          callback(new Error('不能都为注释或者空行'))
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
