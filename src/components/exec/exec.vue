<template>
  <div>
    <Row>
      <Card>
        <!--p slot="title">
          <Icon type="md-flower"></Icon>
          {{ $t('executeList') }}
        </p-->
        <Row>
          <Col span="24">
            <Table border stripe :columns="columns" :data="tableData" size="small" @on-row-dblclick="quickShow"></Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :current="currentPage" :page-size="pagesize"  @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
      </Card>
    </Row>

    <Modal v-model="openswitch" @on-cancel="current = 0" scrollable :mask-closable="false" width="50%">

      <div v-if="current === 0">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('sessionParamsSetting') }}</b>
          <br><br>
        </div>
        <constrict-form ref="varsForm" :formdata="sessionFull" :nullInfo="$t('noSessionNeed')" :buttonTooltip="$t('savaSessionTips')" @buttonOperation="saveSession"></constrict-form>
      </div>
      
      <div v-else-if="current === 1">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('confirmRun') }}</b>
          <br><br>
        </div>
        <Table border stripe :columns="columnsInfo" :data="dataDetailInfo" :show-header="false" :no-data-text="$t('templateInfoFailed')"></Table>
      </div>
      
      <br>
      <Steps :current="current">
          <Step :title="$t('paramsSetting')"></Step>
          <Step :title="$t('confirmRun')"></Step>
      </Steps>
      
      <div slot="footer">
        <Button v-if="current != 0" @click="previous">{{ $t('previousStep') }}</Button>
        <Button v-if="current === 0" type="primary" @click="next">{{ $t('nextStep') }}</Button>
        <Button v-if="current === 1" type="primary" @click="commit">{{ $t('run') }}</Button>
        <Button v-if="current === 1" type="info" @click="debugRun">{{ $t('debugRun') }}</Button>
        <!--Button v-if="current === 1 && debugAble" type="info" @click="debugRun">{{ $t('debugRun') }}</Button-->
      </div>
    </Modal>

    <!--双击行时的弹框显示-->
    <Modal v-model="openshow" width="50%">
      <p slot="header">
        {{showTitle}}
      </p>
      <Tabs value="target">
        <TabPane :label="$t('executeTarget')" name="target">
          <div>
            <p v-if="showContent.length === 0" align="center">{{ $t('executeTargetEmpty') }}</p>
            <p v-else v-for="item in showContent" :key="item">{{item}}</p>
          </div>
        </TabPane>
        <TabPane :label="$t('templateDetail')" name="tmpl">
          <Table border stripe :columns="columnsInfo" :data="tmplInfo" :show-header="false" :no-data-text="$t('templateInfoFailed')"></Table>
        </TabPane>
        <TabPane label="playbook" name="playbook">
          <Input v-model="playbookContent" type="textarea" :autosize="{minRows: 10,maxRows: 20}" placeholder="playbook is null" readonly />
        </TabPane>
      </Tabs>
      <div slot="footer"></div>
    </Modal>

    <!--Modal v-model="deleteConfirm" width="50%" :closable="false">
      <p style="color:#f60;margin-left:5%">
        <font size="5">
        <Icon type="ios-help-circle"></Icon>
        {{ $t('confirmDelete') }} {{delname}}
        </font>
      </p>
      <div slot="footer">
        <Button type="text" @click="deleteConfirm=false">{{ $t('cancel') }}</Button>
        <Button type="error" @click="realDelTarget" >{{ $t('delete') }}</Button>
      </div>
    </Modal-->
  </div>
</template>

<script>
  //
  // import axios from 'axios'
  import exec from '@/api/exec'
  import util from '@/libs/util'
  import file from '@/api/file'
  import constrictForm from '@/components/common/constrictForm.vue'
  import VueI18n from 'vue-i18n'

  export default {
    components: {
      constrictForm
    },
    data () {
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        current: 0,
        openshow: false,
        showTitle: '',
        showContent: [],
        openswitch: false,
        formItem: {},
        formComment: {},
        formType: {},
        formConstrict: {},
        formKey: [],
        formValidate: {},
        openinfo: {},
        tmplInfo: [],
        playbookContent: '',
        dataDetailInfo: [],
        tmplInfoSort: ['name','target_type','playbook','job_type','comment'],
        dataDetailInfoSort: ['name','name_s','tmpl','number','target','comment'],
        columnsInfo: [
          {
            key: 'key',
            align: 'center',
            width: 150
          },
          {
            key: 'value'
          }
        ],
        opentarget: '',
        columns: [
          {
            title: 'name',
            key: 'name_s',
            tooltip: true,
            width: 300,
            sortable: true
          },
          
          {
            title: this.$t('executeTargetNum'),
            key: 'number',
            align: 'center',
            width: 150,
            sortable: true
          },
          {
            title: this.$t('template'),
            key: 'tmpl',
            // sortType: 'desc',
            width: 300,
            sortable: true
          },
          {
            title: this.$t('comment'),
            key: 'comment',
            tooltip: true,
            sortable: true,
            minWidth: 300
          },
          {
            title: this.$t('run'),
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
                      this.execJob(params);
                    }
                  }
                }, this.$t('run'))
              ])
            }
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
                    type: 'success'
                  },
                  on: {
                    click: () => {
                      this.targetinfoDetail(params)
                    }
                  }
                }, this.$t('setting'))
              ])
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
                      this.delTarget(params.row.name);
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
        sessionFull: [],
        sessionInfo: [],
        debugAble: false
        // deleteConfirm: false,
        // delname: ''
      }
    },
    methods: {
      previous () {
        if (this.current) {
          this.current -= 1;
        }
      },
      next () {
        if (this.current === 0) {
          if (this.errFlag) {
            this.$Message.error(this.$t('getPlaybookFailedTips'))
          } else if (JSON.stringify(this.formItem) === '{}') {
            this.current += 1
            this.summary()
          } else {
            this.sessionInfo = this.$refs['varsForm'].getFormItem()
            // this.sessionInfo = this.$refs['varsForm'].formItem
            this.sessionFull.forEach((item) => {
              item['value'] = this.sessionInfo[item['key']]
            })
            if (this.$refs['varsForm'].checkValidate()) {
              this.current += 1
              this.summary()
            } else {
              this.$Message.error(this.$t('form.checkErr'))
            }
          }
        }
      },
      saveSession (data) {
        // console.log(data)
        // axios.post(`${this.baseurl}/session/?filter=${this.openinfo['name']}`, this.formItem)
        /**/
        exec.postSession(`${this.openinfo['name']}`, data)
          .then(res => {
            util.notice(this, this.$t('sessionSaveSuccess'), 'info')
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
        
      },
      summary () {
        let rowinfo = util.dictDeepCopy(this.openinfo)
        try{
          delete rowinfo._index
          delete rowinfo._rowKey
        }finally{
          this.dataDetailInfo = util.dict2arry(rowinfo, 'key', 'value', this.dataDetailInfoSort)
        }
      },
      quickShow (params, index) {
        this.openshow = !this.openshow;
        this.showTitle = params['name'].split('exec:')[1]
        if (params['target'] != '') {
          this.showContent = params['target'].split(',')
        } else {
          this.showContent = []
        }
        this.tmplInfo = []
        // axios.get(`${this.baseurl}/executionInfo/get?filter=${params['tmpl']}`)
        exec.getExecutionInfo(`${params['tmpl']}`)
          .then(res => {
            let r = res.data['data'][0]
            this.playbook = r['playbook']
            this.tmplInfo = util.dict2arry(r,'key', 'value',this.tmplInfoSort)
            console.log(this.playbook)
            
            file.getFileContent(this.playbook)
              .then(res => {
                if (res.data['status'] > 0) {
                  this.playbookContent = res.data['content']
                } else {
                  util.notice(this, res.data['msg'], 'error')
                }
              }).catch(error => {
                util.notice(this, error, 'error')
              })
            /**/
          })
          .catch(error => {
            this.$Message.error(this.$t('getTemplateFailedTips'))
          })
      },
      execJob (params) {
        if (parseInt(params.row['number'])){
          if ((parseInt(params.row['number'])) === 1) {
            this.debugAble = true
          } else {
            this.debugAble = false
          }
          this.openinfo = params.row
          this.openinfo_s = params.row['name_s']
          // axios.get(`${this.baseurl}/session/extend?filter=${params.row['name']}`)
          exec.getSession(`${params.row['name']}`)
            .then(res => {
              this.openswitch = !this.openswitch
              this.sessionFull = res.data['session']
              this.debugList = res.data['pause']
              if (!(this.debugList instanceof Object)) {
                this.debugList = [this.debugList]
              }
              this.formItem = util.arry2dict(this.sessionFull)
              this.errFlag = false
            })
            .catch(error => {
              this.errFlag = true
              this.formItem = {}
              this.formKey = []
              // util.notice(this, '获取session参数失败，请检查playbook是否正确！', 'error')
              this.$Message.error(this.$t('getSessionFailedTips'))
            })
        } else {
          this.$Message.error(this.$t('getExecuteTargetTips'))
        } 
      },
      realCommit (debug=0) {
        if (this.errFlag) {
          this.$Message.error(this.$t('getPlaybookFailedTips') )
        } else {
          if (!debug) {
            debug = this.debugList
          }
          this.openswitch = false
          this.$Message.info(this.$t('afterCommitTips'))
          // axios.post(`${this.baseurl}/execution/?filter=${this.openinfo['name']}`, this.sessionInfo)
          exec.postExecution(this.openinfo['name'], this.sessionInfo, String(debug))
            .then(res => {
              util.notice(this, `${this.openinfo['name_s']} `+this.$t('commitBegin'), 'info')
              util.openPageEx(this, 'orderDetail', {'workid': res.data['data']})
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        }
      },
      commit () {
        this.realCommit()
      },
      debugRun () {
        this.realCommit(1)
      },
      targetinfoDetail (params) {
        this.execInfo = params.row;
        this.execInfo['name'] = this.execInfo['name_s'];
        delete this.execInfo['name_s'];
        util.openPageEx(this, 'execDetail', {row: this.execInfo, tag: 'update'})
      },
      getCurrentPageNew (pagesize) {
        this.pagesize=pagesize
        this.getCurrentPage(1)
      },
      getCurrentPage (vl) {
        this.filter = this.$route.name + ':*'
        if (!vl) {
          vl = sessionStorage.getItem('exec_currentpage')
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem('exec_currentpage', vl);
        // axios.get(`${this.baseurl}/executionInfo/get?filter=${this.filter}&page=${vl}&pagesize=${this.pagesize}&orderby=name`)
        exec.getExecutionInfo(this.filter,vl,this.pagesize,'name')
          .then(res => {
            this.tableData = res.data['data']
            this.tableData.forEach((item) => {
              item['name_s'] = item['name'].split('exec:')[1]
            })
            this.pageNumber = parseInt(res.data['page'])
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      delTarget (d) {
        this.delname = d
        // this.deleteConfirm = true
        this.$Modal.confirm({'title': this.$t('confirmDelete')+` ${this.delname} ？`,'onOk': this.realDelTarget, 'okText':this.$t('delete'), 'cancelText': this.$t('cancel') , 'width': '700px'});
      },
      realDelTarget () {
        // this.deleteConfirm = false
        let d = this.delname
        // axios.get(`${this.baseurl}/executionInfo/del?target=${t}`)
        exec.delExecutionInfo(d)
          .then(res => {
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${d} `+this.$t('deleteSuccess'), 'success');
            } else {
              util.notice(this, `${d} `+this.$t('deleteFailed'), 'error');
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
    },
    computed: {
    },
    watch: {
      '$route': function () {
        this.getCurrentPage();
      }
    },
    mounted () {
      this.getCurrentPage()
    }
  }
</script>
