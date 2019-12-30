<template>
  <div>
    <Row>
      <Card>
        <div slot="title">
          <Tooltip content="修改选择信息">
            <Button type="info" icon="md-list" @click.native="switchFormInfo=true" ></Button>
          </Tooltip>
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()" >增加任务模板</Button>
        </div>
        
        <Row>
          <Col span="24">
            <Table border :columns="columns" :data="tableData" @on-row-dblclick="targetinfoDetail" stripe size="small"></Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :current="currentPage" :page-size="pagesize" @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
      </Card>
    </Row>
    
    <Modal v-model="openswitch" width="800">
      <p slot="header">
        <span>{{modelTitle}}</span>
      </p>
      <safe-form ref="mytest" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formSubmit" @secondClick="openswitch = false"></safe-form>
      <div slot="footer">
      </div>

    </Modal>

    <Modal v-model="switchFormInfo" width="50%">
      <p slot="header">
        <span>修改以下可选项信息</span>
      </p>
       <Form :label-width="80">
        <FormItem label="target_type">
          <Input v-model="target_type" placeholder="请输入可选的可执行对象类型，以“,”分隔" />
        </FormItem>
        <FormItem label="job_type">
          <Input v-model="job_type" placeholder="请输入可选的任务类型，以“,”分隔"/>
        </FormItem>
       </Form> 
       <div slot="footer">
        <Button type="primary" @click="switchFormInfo=false">取消</Button>
        <Button @click="commitFormInfo">提交</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  //
  // import axios from 'axios'
  import exec from '@/api/exec'
  import vconfig from '@/api/config'
  import util from '@/libs/util'
  import config from '@/config/config'
  import safeForm from '@/components/common/safeForm.vue'

  export default {
    components: {
      safeForm
    },
    data () {
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        modelTitle: '',
        switchFormInfo: false,
        job_type: '',
        target_type: '',
        openswitch: false,
        formItem: [],
        formItemOrigin: [
          {key: 'name', label: 'name', comment: '模板名'},
          {key: 'target_type', label: 'target_type', comment: '任务的执行对象类型', select: []},
          {key: 'playbook', label: 'playbook', comment: 'playbook'},
          {key: 'job_type', label: 'job_type', comment: '任务的类型', select: []},
          {key: 'comment', label: 'comment', comment: '简要说明'},
        ],
        formItemValidate: {
          name: [
            {
              required: true,
              message: '请输入模板名',
              trigger: 'blur'
            },
            {
              validator: util.validatorGenerator(),
              trigger: 'blur'
            }
          ],
          target_type: [
            {
              required: true,
              message: '请选择任务的执行对象',
              trigger: 'blur'
            }
          ],
          playbook: [
            {
              required: true,
              message: '请输入playbook',
              trigger: 'blur'
            },
            {
              validator: util.validatorGenerator(),
              trigger: 'blur'
            }
          ],
          job_type: [
            {
              required: true,
              message: '请选择任务的类型',
              trigger: 'blur'
            }
          ],
          comment: [
            {
              required: true,
              message: '请输入简要说明',
              trigger: 'blur'
            }
          ],
        },
        columns: [
          {
            title: 'name',
            key: 'name_s',
            width: 250,
            sortable: true
          },
          {
            title: 'target_type',
            key: 'target_type',
            align: 'center',
            width: 150,
            sortable: true,
            filters: [{label: 'all', value: 'all'}, {label: 'host', value: 'host'}, {label: 'server', value: 'server'}, {label: 'cluster', value: 'cluster'}, {label: 'container', value: 'container'}],
            filterMethod (value, row) {
              if (value === 'all') {
                return true
              } else {
                return row.target_type === value
              }
            }
          },
          {
            title: 'type',
            key: 'job_type',
            align: 'center',
            width: 100,
            sortable: true
          },
          {
            title: 'playbook',
            key: 'playbook',
            tooltip: true,
            sortable: true,
            // sortType: 'desc',
          },
          {
            title: 'comment',
            key: 'comment',
            width: 250,
            tooltip: true,
            sortable: true
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 150,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    type: 'info'
                  },
                  on: {
                    click: () => {
                      this.generateJob(params);
                    }
                  }
                }, '生成任务')
              ])
            }
          },
          {
            title: '详细',
            key: 'action',
            align: 'center',
            width: 150,
            render: (h, params) => {
              let x;
              x = h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    type: 'success'
                  },
                  on: {
                    click: () => {
                      this.targetinfoDetail(params.row)
                    }
                  }
                }, '详细')
                ])
              return x
            }
          },
          {
            title: '删除',
            key: 'action',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    type: 'error'
                  },
                  on: {
                    click: () => {
                      this.delTarget(params.row.name)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        tableData: [],
        pagesize: 16,
        pageNumber: 1,
        currentPage: 1,
        pageSizeOpts: [10,20,40,80,100,200],
        filter: ''
      }
    },
    methods: {
      getJobTypes () {
        // axios.get(`${this.baseurl}/config/?key=job_types`)
        vconfig.getKey('job_types')
          .then(res => {
            let job_types_list = util.dictDeepCopy(res.data['data'])
            this.job_type = ''
            job_types_list.forEach((item, i) => {
              this.job_type = this.job_type+','+item
            })
            this.job_type=this.job_type.slice(1)
            this.job_type_old=this.job_type
            this.formItemOrigin.forEach((item, i) => {
              if(item.key === 'job_type') {
                item.select = res.data['data']
              }
            })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      getTargetTypes () {
        // axios.get(`${this.baseurl}/config/?key=target_types`)
        vconfig.getKey('target_types')
          .then(res => {
            let target_types_list = util.dictDeepCopy(res.data['data'])
            this.target_type = ''
            target_types_list.forEach((item, i) => {
              this.target_type = this.target_type+','+item
            })
            this.target_type=this.target_type.slice(1)
            this.target_type_old=this.target_type
            this.formItemOrigin.forEach((item, i) => {
              if(item.key === 'target_type') {
                item['select'] = res.data['data']
              }
            })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      targetinfoDetail (params) {
        let info = util.dictDeepCopy(params)
        info['name'] = info['name_s']
        this.name_o = params['name']
        this.formItem = util.dictDeepCopy(this.formItemOrigin)
        this.formItem.forEach((item,i) => {
          item['value'] = info[item['key']]
        })
        this.openswitch = true
        this.isAdd = false
        this.modelTitle = '任务模板详细'
      },
      targetinfoAdd () {
        this.openswitch = true
        this.formItem = this.formItemOrigin
        this.isAdd = true
        this.modelTitle = '增加任务模板'
      },
      formSubmit(data) {
        let formInfo = util.dictDeepCopy(data)
        formInfo['name'] = this.$route.name + ':' + formInfo['name']
        if (!this.isAdd) {
          formInfo['name_o'] = this.name_o 
        }
        this.addTarget(formInfo)
        this.openswitch = false
      },
      generateJob (params) {
        let tmplInfo = params.row;
        tmplInfo['tmpl'] = tmplInfo['name']
        tmplInfo['name'] = tmplInfo['name_s']
        tmplInfo['target'] = ''
        let x = ['name_s','target_type','playbook','job_type']
        x.forEach((item,i) => {
          delete tmplInfo[item]
        })
        util.openPageEx(this, 'execDetail', {row: tmplInfo, tag: 'add'})
      },
      commitFormInfo (){
        this.switchFormInfo = false
        if ( this.job_type != this.job_type_old) {
          // axios.post(`${this.baseurl}/config/?key=job_types&type=set`, this.job_type.split(','))
          vconfig.postKey('job_types',this.job_type.split(','),'set')
            .then(res => {
              if (res.data['status'] >= 1) {
                util.notice(this, 'job_types 更改成功', 'success')
                this.getJobTypes()
              } else {
                util.notice(this, `job_types ${res.data['msg']}`, 'warning')
              }
            }).catch(error => {
              util.notice(this, error, 'error')
            })  
        }
        if ( this.target_type != this.target_type_old) {
          // axios.post(`${this.baseurl}/config/?key=target_types&type=set`, this.target_type.split(','))
          vconfig.postKey('target_types',this.target_type.split(','),'set')
            .then(res => {
              if (res.data['status'] >= 1) {
                util.notice(this, 'target_types 更改成功', 'success')
                this.getTargetTypes()
              } else {
                util.notice(this, `target_types ${res.data['msg']}`, 'warning')
              }
            }).catch(error => {
              util.notice(this, error, 'error')
            })
        }
      },
      getCurrentPageNew (pagesize) {
        this.pagesize=pagesize
        this.getCurrentPage(1)
      },
      getCurrentPage (vl) {
        this.filter = this.$route.name + ':*'
        if (!vl) {
          vl = sessionStorage.getItem('tmplexec_currentpage')
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem('tmplexec_currentpage', vl)
        // axios.get(`${this.baseurl}/executionInfo/get?filter=${this.filter}&page=${vl}&pagesize=${this.pagesize}&orderby=name`)
        exec.getExecutionInfo(this.filter,vl,this.pagesize,'name')
          .then(res => {
            this.tableData = res.data.data;
            this.tableData.forEach((item) => {
              item['name_s'] = item['name'].split('tmpl:')[1]
            })
            this.pageNumber = parseInt(res.data['page'])
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      delTarget (t) {
        this.delname = t
        this.$Modal.confirm({'title': `确认删除 ${this.delname} ？`,'onOk': this.realDelTarget, 'cancelText': '取消', 'width': '700px'})
      },
      realDelTarget () {
        let t = this.delname
        // axios.get(`${this.baseurl}/executionInfo/del?target=${t}`)
        exec.delExecutionInfo(t)
          .then(res => {
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${t} 删除成功`, 'success')
            } else if (res.data['status'] === 0) {
              util.notice(this, `${t} 删除失败`, 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      addTarget (info) {
        // axios.post(`${this.baseurl}/executionInfo/`, info)
        exec.postExecutionInfo(info)
          .then(res => {
            this.addName = info['name'].split('tmpl:')[1]
            if (res.data['status'] >= 1) {
              util.notice(this, `${this.addName} ${res.data['msg']}`, 'success')
            } else {
              util.notice(this, `${this.addName} ${res.data['msg']}`, 'warning')
            }
            this.getCurrentPage();
          }).catch(error => {
            util.notice(this, error, 'error')
          });
      },
    },
    watch: {
      '$route': function () {
        this.getCurrentPage();
      }
    },
    mounted () {
      this.getCurrentPage()
    },
    created () {
      this.getJobTypes()
      this.getTargetTypes()
    }
  }
</script>
