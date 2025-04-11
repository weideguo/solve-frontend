<template>
  <div>
    <Row>
      <Card>
        <div slot="title">
          <Tooltip :content="$t('modifySelectedInfo')" placement="bottom-start">
            <Button type="info" icon="md-list" @click.native="switchFormInfo=true" ></Button>
          </Tooltip>
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()" style="margin-left: 0.2vw">{{ $t('addTemplate') }}</Button>
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
      <safe-form ref="mytest" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formSubmit" @secondClick="openswitch = false"
        :primaryButtonName="isAdd? $t('add') : $t('update') ">
      </safe-form>
      <div slot="footer">
      </div>

    </Modal>

    <Modal v-model="switchFormInfo" width="50%" @on-cancel="cancelFormInfo">
      <p slot="header">
        <span>{{ $t('modifyTips') }}</span>
      </p>
       <Form :label-width="80">
        <FormItem label="target_type">
          <Select v-model="targetType" filterable multiple allow-create @on-create="putTargetType">
            <Option v-for="item in targetTypeTmp" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="job_type">
          <Select v-model="jobType" filterable multiple allow-create @on-create="putJobType">
            <Option v-for="item in jobTypeTmp" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
       </Form> 
       <div slot="footer">
        <Button type="primary" @click="cancelFormInfo">{{ $t('cancel') }}</Button>
        <Button @click="commitFormInfo">{{ $t('commit') }}</Button>
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
        jobType: [],
        targetType: [],
        openswitch: false,
        formItem: [],
        formItemOrigin: [
          {key: 'name', label: 'name', comment: this.$t('templateName')},
          {key: 'target_type', label: 'target_type', comment: this.$t('targetType'), select: []},
          {key: 'playbook', label: 'playbook', comment: 'playbook'},
          {key: 'job_type', label: 'job_type', comment: this.$t('jobType'), select: []},
          {key: 'comment', label: 'comment', comment: this.$t('comment')},
        ],
        formItemValidate: {
          name: [
            {
              required: true,
              message: this.$t('inputTemplateNameTips'),
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
              message: this.$t('selectTargetTypeTips'),
              trigger: 'blur'
            }
          ],
          playbook: [
            {
              required: true,
              message: this.$t('inputPlaybookTips'),
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
              message: this.$t('selectJobTypeTips'),
              trigger: 'blur'
            }
          ],
          comment: [
            {
              required: true,
              message: this.$t('inputCommentTips'),
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
            // filters: [{label: 'all', value: 'all'}],
            filters: [], 
            filterMethod (value, row) { return row.target_type === value }
          },
          {
            title: 'type',
            key: 'job_type',
            align: 'center',
            width: 100,
            sortable: true,
            filters: [], 
            filterMethod (value, row) { return row.job_type === value }
          },
          {
            title: 'playbook',
            key: 'playbook',
            tooltip: true,
            sortable: true,
            minWidth: 300
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
            title: this.$t('operation'),
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
                }, this.$t('createJob'))
              ])
            }
          },
          {
            title: this.$t('detail'),
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
                }, this.$t('detail'))
                ])
              return x
            }
          },
          {
            title: this.$t('delete'),
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
                }, this.$t('delete'))
              ])
            }
          }
        ],
        tableData: [],
        pagesize: 16,
        pageNumber: 1,
        currentPage: 1,
        pageSizeOpts: [10,20,40,80,100,200],
        filter: '',
        jobTypeTmp: [],
        targetTypeTmp: [],
        // deleteConfirm: false,
        // delname: ''
      }
    },
    methods: {
      cancelFormInfo () {
        this.switchFormInfo = false
        this.jobType = util.dictDeepCopy(this.jobTypeOld)
        this.jobTypeTmp = util.dictDeepCopy(this.jobTypeOld)
        this.targetType = util.dictDeepCopy(this.targetTypeOld)
        this.targetTypeTmp = util.dictDeepCopy(this.targetTypeOld)
      },
      putJobType (val) {
        this.jobTypeTmp.push(val)
      },
      putTargetType (val) {
        this.targetTypeTmp.push(val)
      },
      getJobTypes () {
        // axios.get(`${this.baseurl}/config/?key=job_types`)
        vconfig.getKey('job_types')
          .then(res => {
            this.jobTypeOld=util.dictDeepCopy(res.data['data'])
            this.jobTypeTmp=util.dictDeepCopy(res.data['data'])
            this.jobType=util.dictDeepCopy(res.data['data'])
            this.formItemOrigin.forEach((item, i) => {
              if(item.key === 'job_type') {
                item.select = res.data['data']
              }
            })
            this.columns.forEach((item, i) => {
              if(item.key === 'job_type') {     
                item.filters = []
                for ( let t of res.data['data'] ) { 
                  item.filters.push({label: t, value: t}) 
                }
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
            this.targetTypeOld = util.dictDeepCopy(res.data['data'])
            this.targetTypeTmp = util.dictDeepCopy(res.data['data'])
            this.targetType = util.dictDeepCopy(res.data['data'])
            this.formItemOrigin.forEach((item, i) => {
              if(item.key === 'target_type') {
                item['select'] = res.data['data']
              }
            })
            this.columns.forEach((item, i) => {
              if(item.key === 'target_type') {   
                item.filters = []
                for ( let t of res.data['data'] ) { 
                  item.filters.push({label: t, value: t}) 
                }
              }
            })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      commitFormInfo (){
        this.switchFormInfo = false
        // console.log(this.jobType , this.jobTypeOld)
        if ( this.jobType != this.jobTypeOld) {
          // axios.post(`${this.baseurl}/config/?key=job_types&type=set`, this.job_type.split(','))
          // vconfig.postKey('job_types',this.job_type.split(','),'set')
          vconfig.postKey('job_types',this.jobType,'set')
            .then(res => {
              if (res.data['status'] >= 1) {
                util.notice(this, 'job_types '+this.$t('modifySuccess'), 'success')
                this.getJobTypes()
              } else {
                util.notice(this, `job_types ${res.data['msg']}`, 'warning')
              }
            }).catch(error => {
              util.notice(this, error, 'error')
            })  
        }
        if ( this.targetType != this.targetTypeOld) {
          // axios.post(`${this.baseurl}/config/?key=target_types&type=set`, this.target_type.split(','))
          // vconfig.postKey('target_types',this.target_type.split(','),'set')
          vconfig.postKey('target_types',this.targetType,'set')
            .then(res => {
              if (res.data['status'] >= 1) {
                util.notice(this, 'target types '+this.$t('modifySuccess'), 'success')
                this.getTargetTypes()
              } else {
                util.notice(this, `target types ${res.data['msg']}`, 'warning')
              }
            }).catch(error => {
              util.notice(this, error, 'error')
            })
        }
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
        this.modelTitle = this.$t('templateDetail')
      },
      targetinfoAdd () {
        this.openswitch = true
        this.formItem = this.formItemOrigin
        this.isAdd = true
        this.modelTitle = this.$t('addTemplate')
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
      getCurrentPageNew (pagesize) {
        this.pagesize=pagesize
        this.getCurrentPage(1)
      },
      getCurrentPage (vl) {
        this.filter = this.$route.name + ':*'
        if (!vl) {
          vl = sessionStorage.getItem('tmplexecCurrentpage')
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem('tmplexecCurrentpage', vl)
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
      delTarget (d) {
        this.delname = d
        // this.deleteConfirm=true
        this.$Modal.confirm({'title': this.$t('confirmDelete')+` ${this.delname} ？`,'onOk': this.realDelTarget, 'okText':this.$t('delete'), 'cancelText': this.$t('cancel') , 'width': '700px'});
      },
      realDelTarget () {
        // this.deleteConfirm=false
        let d = this.delname
        // axios.get(`${this.baseurl}/executionInfo/del?target=${t}`)
        exec.delExecutionInfo(d)
          .then(res => {
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${d} `+this.$t('deleteSuccess'), 'success')
            } else if (res.data['status'] === 0) {
              util.notice(this, `${d} `+this.$t('deleteFailed'), 'error')
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
