<style lang="less">
  .top {
    padding: 0px;
    background: #2D8CF0;
    color: #fff;
    text-align: center;
    border-radius: 5px;
  }
  .ivu-table-cell {
    white-space: pre-line;
  }
</style>
<template>
  <div>
    <Row>
      <Card>
        <div slot="title">
          <Poptip transfer :content="playbook" trigger="hover" placement="bottom-start">
            <p>{{ this.workid }}</p>
          </Poptip>
          <br>
          <br>
          <Tooltip :content="$t('openNewWindow')" placement="bottom-start">
            <Button type="primary" shape="circle" icon="md-albums" ghost @click.native="orderInfo()"></Button>
          </Tooltip>
          <Tooltip :content="$t('showPlaybook')" placement="bottom-start" style="margin-left: 20px">
            <Button type="primary" shape="circle" icon="md-book" ghost @click.native="playbookDetial()"></Button>
          </Tooltip>
          <Tooltip :content="$t('refresh')" placement="bottom" style="margin-left: 20px">
            <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshCurrentPage()"></Button>
          </Tooltip>
          <Tooltip :content="$t('summary')" placement="bottom" style="margin-left: 20px">
            <Button type="primary" shape="circle" icon="md-bookmarks" ghost @click.native="summary()"></Button>
          </Tooltip>
          <i-switch size="large" @on-change="finishFilter" style="margin-left: 50px">
            <span slot="open">{{ $t('filter') }}</span>
            <span slot="close">{{ $t('all') }}</span>
          </i-switch>

          <Tooltip disabled style="float:right;margin-right: 50px">
            <b>
            {{ $t('executing') }} <font color="#EEB422"> {{sum['executing']}} </font>
            {{ $t('exeFailed') }} <font color="#FF0000"> {{sum['fail']}} </font>
            {{ $t('exeSuccess') }} <font color="#228B22"> {{sum['done']}} </font>
            {{ $t('currentNum') }} <font color="#0000FF">{{targetAmount}}</font>
            {{ $t('allNum') }} <font color="#0000FF">{{sum['all']}}</font>
            </b>
          </Tooltip>
        </div>
        <Row>
          <Col span="24">
            <Table border stripe :columns="tabcolumns" :data="TableDataNew" @on-row-dblclick="quickShow"></Table>
          </Col>
        </Row>
      </Card>
    </Row>

    <BackTop :height="100" :bottom="200">
      <div class="top">
        <Tooltip :content="$t('backTop')" placement="bottom">
          <Icon type="ios-arrow-up" />
        </Tooltip>  
      </div>
    </BackTop>

    <!--日志id列表-->
    <Drawer v-model="modalList" :mask-closable="false" :mask="false" scrollable draggable width="410px">
      <p style="font-weight:800;font-size:18px">{{currentTarget}}</p>
      <br/>
      <Table stripe :columns="columnsDetail" :data="dataDetail" @on-row-click="showDetail" :show-header="false"></Table>
    </Drawer>

    <!--命令的详细信息-->
    <Modal v-model="modalDetail" scrollable width="55%">
      <p slot="header">{{detailTitle}}</p>
      <div>
        <Table border stripe :columns="columnsDetailInfo" :data="dataDetailInfo" :show-header="false" :no-data-text="$t('noCommandInfo')" @on-select=detailSelect @on-selection-change=detailChange></Table>
        {{selectionKeyStr}}
      </div>
      <div v-if="pauseOpt" slot="footer">
        <Tooltip :content="$t('pauseAbort')" placement="top">
          <Button type="warning" shape="circle" icon="md-close" @click.native="pauseAbort"></Button>
        </Tooltip>
        <Tooltip :content="$t('pauseRunAll')" placement="top">
          <Button type="info" shape="circle" icon="md-checkmark" @click.native="pauseRunAll"></Button>
        </Tooltip>
        <Tooltip :content="$t('pauseRunNext')" placement="top">
          <Button type="info" shape="circle" icon="md-fastforward" @click.native="pauseRunNext"></Button>
        </Tooltip>
        <Tooltip :content="$t('prePage')" placement="top">
          <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="showDetailPre"></Button>
        </Tooltip>
        <Tooltip :content="$t('nextPage') " placement="top">
          <Button type="primary" shape="circle" icon="md-arrow-forward" ghost @click.native="showDetailNext"></Button>
        </Tooltip>
        <Tooltip :content="$t('refresh')" placement="top" style="margin-right: 20px">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshDetailInfo"></Button>
        </Tooltip>
      </div>
      <div v-else slot="footer">
        <Tooltip :content="$t('prePage')" placement="top">
          <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="showDetailPre"></Button>
        </Tooltip>
        <Tooltip :content="$t('nextPage') " placement="top">
          <Button type="primary" shape="circle" icon="md-arrow-forward" ghost @click.native="showDetailNext"></Button>
        </Tooltip>
        <Tooltip :content="$t('refresh')" placement="top">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshDetailInfo"></Button>
        </Tooltip>
        <Tooltip :content="$t('downloadColumn')" placement="top" style="margin-right: 20px">
          <Button type="primary" shape="circle" icon="md-arrow-down" ghost @click.native="download"></Button>
        </Tooltip>
      </div>
    </Modal>

    <Modal v-model="modalSummary" scrollable width="55%">
      <div slot="header">
        <div style="float:left;margin-top:5px;width:300px;">{{ $t('summaryTitle') }}</div>
        <div>
          <i-switch size="large" true-color="#ff4949" false-color="#13ce66" @on-change="summaryFilter" >
            <span slot="open">{{ $t('stderr') }}</span>
            <span slot="close">{{ $t('stdout') }}</span>
          </i-switch>
        </div>
      </div>
      <div>
        <Table border stripe :columns="columnsSummaryInfo" :data="summaryInfo" ></Table>
      </div>
      <div slot="footer">
        <Tooltip :content="$t('refresh')" placement="top" style="margin-right: 20px">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshSummary"></Button>
        </Tooltip>
      </div>
    </Modal>

    <Modal v-model="modalRerun" scrollable width="55%" >
      <p slot="header">{{runTitle}}</p>
      <div>
        <Form :label-width="100">
          <Divider>readonly</Divider>
          <FormItem v-for="(item, i) in checkReadonly" :key="item.key" v-bind:label="item.key">
            <Input v-model="item.value" readonly></Input>
          </FormItem>

          <Divider>session</Divider>
          <FormItem v-for="(item, i) in checkSession" :key="item.key" v-bind:label="item.key">
            <Input v-model="item.value"></Input>
          </FormItem>
          <Tooltip :content="$t('sessionTips')" placement="left" style="float:right;margin-right:0px">
            <Button size="large" @click.native="setRerunSession" >{{ $t('setting') }}</Button>
          </Tooltip>

          <Divider v-if="checkChangable.length > 0">changable</Divider>
          <FormItem v-for="(item, i) in checkChangable" :key="item.key" v-bind:label="item.key">
            <InputNumber v-if="item.key === 'begin_line'" v-model="item.value" :max="parseInt(selectParams.playbook_rownum)" :min="1"></InputNumber>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
          <Button type="primary" size="large" @click.native="realRerun">{{ $t('run') }}</Button>
      </div>
    </Modal>

    <Modal v-model="modalSelect" @on-ok="setSelect" scrollable width="55%" >
      <p slot="header">{{ $t('selectTitle') }}  {{selectVar}}</p>
      <div>
      <Select v-model="selectValue" :placeholder="$t('selectTips')" multiple>
          <Option v-for="j in selectList" :value="j" :key="JSON.stringify(j)">{{ j }}</Option>
      </Select>
      </div>
      <!--
      <div slot="footer">
          <Button type="primary" size="large" @click.native="setSelect">{{ $t('run') }}</Button>
      </div>-->
    </Modal>

  </div>
</template>

<script>
  import order from '@/api/order'
  import exec from '@/api/exec'
  import util from '@/libs/util'
  // import axios from 'axios'
  //
  export default {
    name: 'orderList',
    data () {
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        modalRerun: false,
        modalList: false,
        modalDetail: false,
        modalSummary: false,
        modalSelect: false,
        summaryInfo: [],
        columnsSummaryInfo: [
          {
            key: 'target',
            align: 'center',
            width: 300,
            sortable: true
          },
          {
            key: 'last_stdout',
            sortable: true
          }
        ],
        dataDetail: [],
        columnsDetail: [
          {
            key: 'index',
            align: 'center',
            width: 60
          },
          {
            align: 'center',
            key: 'log_id',
            width: 300
          }
        ],
        detailTitle: '',
        dataDetailInfo: [],
        columnsDetailInfo: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            key: 'key',
            align: 'center',
            sortType: 'desc',
            width: 150
          },
          {
            key: 'value'
          }
        ],
        workid: '',
        playbook: '',
        targetAmount: 0,
        sum: {
          'executing': 0,
          'done': 0,
          'fail': 0,
          'all': 0},
        columnsName: [
          {
            title: 'exe info',
            key: 'sql'
          }
        ],
        tabcolumns: [
          {
            title: this.$t('executeTarget'),
            key: 'target',
            sortable: true,
            minWidth: 150
          },
          {
            title: this.$t('currentStatus'),
            key: 'exe_status',
            align: 'center',
            sortable: true,
            width: 150
          },
          {
            title: this.$t('exeRownum'),
            key: 'exe_rownum',
            align: 'center',
            sortable: true,
            width: 150
          },
          {
            title: this.$t('rownum'),
            key: 'playbook_rownum',
            align: 'center',
            width: 150
          },
          {
            title: this.$t('beginDate'),
            key: 'begin_date',
            sortable: true,
            width: 200
          },
          {
            title: this.$t('endDate'),
            key: 'end_date',
            sortable: true,
            width: 200
          },
          {
            title: this.$t('endure'),
            key: 'endure',
            sortable: true,
            width: 200
          },
          {
             title: this.$t('action'),
             key: 'action',
             align: 'center',
             width: 300,
             render: (h, params) => {
              let b = ''
              if ( [ 'executing','pausing','waiting select'].indexOf(params.row.exe_status) >= 0 ) {
                b = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'warning'
                    },
                    on: {
                      click: () => {
                        this.abort(params.row)
                      }
                    }
                  }, this.$t('abort'))
                ])
              } else if (params.row.exe_status === 'done') {
                b = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'success'
                    },
                    on: {
                      click: () => {
                        this.quickShow(params.row)
                      }
                    }
                  }, this.$t('exeSuccess'))
                ])
              } else if (params.row.exe_status === 'rerun') {
                b = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'warning'
                    },
                    on: {
                      click: () => {
                        util.notice(this, this.$t('reExecute'), 'info')
                      }
                    }
                  }, this.$t('reExecuting'))
                ])
              } else {
                b = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'warning'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.quickShow(params.row)
                      }
                    }
                  }, this.$t('exeFailed')),
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'error'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.rerun(params.row)
                      }
                    }
                  }, this.$t('rerun')),
                  h('span', {}, ' '),
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'error'
                    },
                    on: {
                      click: () => {
                        this.continueRun(params.row)
                      }
                    }
                  }, this.$t('continueRun'))
                ])
              }
              return b
            }
          }
        ],
        TableDataNew: [],
        selectParams: {},
        checkFormItem: [],
        conCheckFormItem: [],
        checkSession: [],
        checkReadonly: [],
        checkChangable: [],
        runTitle: '',
        currentTarget: '',
        finishOnly: false,
        stdoutSummary: true,
        newJobId:'',
        pauseOpt: false,
        selectVar: '',
        selectValue: '',
        selectList: [],
        selectionKey: [],
        selectionKeyStr: ''
      }
    },
    methods: {
      orderInfo () {
        // let path = "/orderInfo?workid="+this.workid
        let path = this.$router.resolve({ path: '/orderInfo', query: {  workid: this.workid } }).href
        window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
      },
      playbookDetial () {
        // 使用新的非tab页面显示playbook
        // let path = "/?playbook="+this.playbook+"&title="+this.workid+"#/playbook"
        // let path = "/playbook?playbook="+this.playbook+"&title="+this.workid
        let path = this.$router.resolve({ path: '/playbook', query: {  playbook: this.playbook, title: this.workid } }).href
        window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
      },
      abort (params) {
        // axios.get(`${this.baseurl}/order/abort?target_id=${params['target_id']}`)
        order.abort(params['target_id'])
          .then(res => {
            if (parseFloat(res.data.abort_time)) {
              util.notice(this, this.$t('shouldNotAbort')+' ' + params['target'], 'warning')
            } else {
              util.notice(this, this.$t('abort')+' ' + params['target'], 'success')
            }
            if (this.finishOnly) {
              this.getCurrentPage(1)
            } else {
              this.getCurrentPage()
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      continueRun (params, index) {
        this.runTitle = this.$t('continueExeInfo')
        this.begin_line = -1
        this.getRerunInfo(params, params['target_id'])
        this.newJobId=''
      },
      rerun(params, index){
        this.runTitle = this.$t('rerunInfo')
        this.begin_line = 0
        this.getRerunInfo(params, params['target_id'])
        this.newJobId=''
      },
      getRerunInfo (params, target_id) {
        this.checkSession = this.checkReadonly = this.checkChangable = []
        this.modalRerun = true
        this.selectParams = params
        // axios.get(`${this.baseurl}/execution/rerun_info?work_id=${this.workid}&target=${this.selectParams['target']}&target_id=${target_id}`)
        exec.getRerunInfo(this.workid,this.selectParams['target'],target_id)
          .then(res => {
            if (this.begin_line === 0) {
              res.data['data']['changable']['begin_line'] = 0
            }
            this.checkSession = util.dict2arry(res.data['data']['session'], 'key', 'value')
            this.checkReadonly = util.dict2arry(res.data['data']['readonly'], 'key', 'value')
            this.checkChangable = util.dict2arry(res.data['data']['changable'], 'key', 'value')
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      setRerunSession(){
        let newSession = util.arry2dict(this.checkSession, 'key', 'value')
        // console.log(newSession)
        exec.postTempSession(newSession)
          .then(res => {
            if (res.data['status']>=1) {
              util.notice(this, this.$t('sessionSaveSuccess'), 'info')
              console.log(res.data)
              this.newJobId=res.data['job_id']
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      realRerun () {
        let begin_line = 0
        let x = util.arry2dict(this.checkChangable, 'key', 'value')
        if (x['begin_line']) {
          begin_line = x['begin_line']
        }
        this.selectParams['exe_status'] = 'rerun'
        this.modalRerun = false
        // console.log(this.newJobId)
        // axios.get(`${this.baseurl}/execution/rerun?work_id=${this.workid}&target=${this.selectParams['target']}&target_id=${this.selectParams['target_id']}&begin_host=${begin_host}&begin_line=${begin_line}`)
        exec.rerun(this.workid,this.selectParams['target'],this.selectParams['target_id'],begin_line,this.newJobId)
          .then(res => {
            console.log(res.data)
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      realQuickShow (targetId) {
        order.exelist(targetId)
          .then(res => {
            this.pauseTarget=''
            if(res.data['pause']) {
              this.pauseTarget=targetId
            }
            console.log(this.pauseTarget)
            this.exelist=res.data['exelist']
            this.dataDetail = []
            res.data['exelist'].forEach((item, index) => {
              this.dataDetail.push({'index': index + 1, 'log_id': item})
            })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      quickShow (params, index) {
        this.modalList = !this.modalList
        if (this.modalList) {
          this.currentTarget = params['target']
          this.currentTargetId = params['target_id']
          // axios.get(`${this.baseurl}/order/exelist?id=${params['target_id']}`)
          this.realQuickShow(params['target_id'])
        } else {
          this.currentTargetId = ''
        }
      },
      showDetailPre () {
        if (this.detailIndex > 1) {
          this.detailIndex=this.detailIndex-1
        } else {
          this.$Message.info(this.$t('noForward'))
        }
        this.realShowDetail(this.exelist[this.detailIndex-1],this.detailIndex)
        console.log(this.exelist[this.detailIndex-1],this.detailIndex)
      },
      showDetailNext () {
        this.realQuickShow(this.currentTargetId)
        if ( this.detailIndex < this.exelist.length ) {
          this.detailIndex=this.detailIndex+1
        } else {
          this.$Message.info(this.$t('noBackward'))
        }
        this.realShowDetail(this.exelist[this.detailIndex-1],this.detailIndex)
        // console.log(this.exelist[this.detailIndex-1],this.detailIndex)
      },
      showDetail (params, index) {
        this.realShowDetail(params['log_id'], params['index'])
      },
      realShowDetail (logID, index) {
        this.modalDetail = true
        this.logID = logID
        this.detailIndex = index
        this.detailTitle = index + '-------------' + logID
        this.refreshShowDetail(logID)
      },
      refreshShowDetail (logID) {
        this.selectionKey=[]
        this.selectionKeyStr='' 
        // axios.get(`${this.baseurl}/order/exedetail?id=${logID}`)
        order.exedetail(logID)
          .then(res => {
            if (res.data['status'] > 0) {
              if (res.data['select']) {
                // 存在可选信息时
                this.modalSelect= true
                this.selectVar=res.data['select_var']
                // this.selectList=['aaa','bbb','ccc']
                this.selectList=res.data['select']
                this.selectID=logID
              }

              this.pauseOpt=false
              if (this.pauseTarget) {
                // 当前执行信息为 {step: "pausing"} 则显示断点执行的操作
                let tmp_exedetail=res.data['exedetail']
                // 以此判断才能确保当前命令的暂停与否 exelist的pause只是说明是否启用断点
                //if (tmp_exedetail['step'] === 'pausing' && Object.keys(tmp_exedetail).length === 1 ){
                if (tmp_exedetail['step'] === 'pausing'){
                  this.pauseOpt=true
                }
              } 
              // console.log(this.pauseTarget+' '+this.pauseOpt)
              this.dataDetailInfo = util.dict2arry(res.data['exedetail'], 'key', 'value')              
            } else {
              this.$Message.error(res.data['msg'])
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      setSelect() {
        if (this.selectValue.length) {
          console.log(this.selectValue,this.selectID,this.selectValue.length)
          order.setSelect(this.selectID, this.selectValue)
            .then(res => {
              // console.log("set select success")
              util.notice(this, this.$t('commitSelectSuccess'), 'success')
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.$Message.error(this.$t('emptySelectWarn'))
        }
      },
      refreshDetailInfo () {
        this.refreshShowDetail(this.logID)
        util.notice(this, this.$t('refreshSuccess'), 'fast')
      },
      refreshCurrentPage () {
        try {
          if (this.finishOnly) {
            this.getCurrentPage(1)
          } else {
            this.getCurrentPage()
          }
          util.notice(this, this.$t('refreshSuccess'), 'fast');
        } catch (err) {
          util.notice(this, err, 'error');
        }
      },
      summary () {
        this.modalSummary = true
        // axios.get(`${this.baseurl}/order/summary?workid=${this.workid}`)
        order.summary(this.workid)
          .then(res => {
              this.summaryInfo = res.data['data']
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      refreshSummary () {
        this.summary()
        util.notice(this, this.$t('refreshSuccess'), 'fast')
      },
      finishFilter () {
        this.finishOnly = ! this.finishOnly
        if (this.finishOnly) {
          this.getCurrentPage(1)
        } else {
          this.getCurrentPage()
        }
      },
      summaryFilter () {
        this.stdoutSummary = ! this.stdoutSummary
        if (this.stdoutSummary) {
          this.columnsSummaryInfo[1].key = 'last_stdout'
        } else {
          this.columnsSummaryInfo[1].key = 'last_stderr'
        }
        // console.log(this.columnsSummaryInfo) 
      },
      getCurrentPage (exclude='') {
        if (this.modalList) {
          this.realQuickShow(this.currentTargetId)
        }
        this.workid = this.$route.query['workid']
        if (this.workid) {
          sessionStorage.setItem('orderListWorkid', this.workid)
        } else {
          this.workid = sessionStorage.getItem('orderListWorkid');
        }
        // axios.get(`${this.baseurl}/order/detail?workid=${this.workid}&exclude=${exclude}`)
        order.detail(this.workid,exclude)
          .then(res => {
            if (res.data['status']>=1) {
              this.sum = res.data['sum']
              this.TableDataNew = res.data['data']
              this.targetAmount = this.TableDataNew.length
              this.playbook = res.data['playbook']
              this.TableDataNew.forEach((item) => {
                if (item['begin_date']) { item['begin_date'] = util.formatDate(parseFloat(item['begin_date'])); }
                if (item['end_date']) { item['end_date'] = util.formatDate(parseFloat(item['end_date'])); }
              })
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      pauseAbort() {
        exec.pauseRun(this.pauseTarget, 'abort')
          .then(res => {
            this.refreshCurrentPage()
            this.modalDetail = false
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      pauseRunAll() {
        exec.pauseRun(this.pauseTarget, '-1', this.workid, this.detailIndex)
          .then(res => {
            this.refreshCurrentPage()
            this.modalDetail = false
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      pauseRunNext() {
        exec.pauseRun(this.pauseTarget, '0')
          .then(res => {
            // this.refreshCurrentPage()
            this.showDetailNext()
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      detailSelect(selection,row){
        // 增加才触发
        this.selectionKey.push(row.key)
      },
      detailChange(selection){
        // 增加删除都触发
        let realSelectionKey=[]
        for ( let k of selection ){ 
          if(k.key){
            realSelectionKey.push(k.key)
          }
        }
        // console.log(real_selection_key)
        for(let i in this.selectionKey) {
          if(realSelectionKey.indexOf(this.selectionKey[i]) < 0) {
            this.selectionKey.splice(i,1)
          }
        }
        console.log(this.selectionKey)
        this.selectionKeyStr=''
        for(let k of this.selectionKey){
          this.selectionKeyStr += ' '+k
        }
      },
      download() {
        if(this.selectionKey.length){
          order.download(this.workid,this.detailIndex,this.selectionKey)
            .then(res => {
              let blob = new Blob([res.data])
              let filename = decodeURIComponent(res.headers['filename'])
              // let filename = 'order_'+util.formatDate((new Date().getTime()) / 1000).replaceAll('-','').replaceAll(':','').replaceAll(' ','_')+'.csv'
              console.log(filename)
              util.downloadBlob(blob,filename)
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        }else{
          this.$Message.error(this.$t('emptyFieldWarn'))
        }
      }
    },
    destroyed() {
      // 销毁组件时调用
    },
    mounted () {
      this.getCurrentPage();
    }
  }
</script>
