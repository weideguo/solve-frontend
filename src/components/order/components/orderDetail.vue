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
          <Poptip  :content="playbook" trigger="hover" placement="bottom">
            <p>工单{{ this.workid }}详细信息</p>
          </Poptip>
          <br>
          <br>
          <!--<Tooltip content="返回" placement="bottom">
            <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="$router.go(-1)"></Button>
          </Tooltip>-->
          <Tooltip content="查看playbook" placement="bottom">
            <Button type="primary" shape="circle" icon="md-book" ghost @click.native="playbookDetial()"></Button>
          </Tooltip>
          <Tooltip content="刷新" placement="bottom" style="margin-left: 20px">
            <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshCurrentPage()"></Button>
          </Tooltip>
          <Tooltip content="汇总" placement="bottom" style="margin-left: 20px">
            <Button type="primary" shape="circle" icon="md-bookmarks" ghost @click.native="summary()"></Button>
          </Tooltip>
          <i-switch size="large" @on-change="finishFilter" style="margin-left: 50px">
            <span slot="open">过滤</span>
            <span slot="close">全部</span>
          </i-switch>

          <Tooltip disabled style="float:right;margin-right: 50px">
            <b>
            执行中： <font color="#EEB422"> {{sum['executing']}} </font>
            执行失败： <font color="#FF0000"> {{sum['fail']}} </font>
            执行成功： <font color="#228B22"> {{sum['done']}} </font>
            当前数量： <font color="#0000FF">{{targetAmount}}</font>
            总执行： <font color="#0000FF">{{sum['all']}}</font>
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
        <Tooltip content="返回顶部" placement="bottom">
          <Icon type="ios-arrow-up" />
        </Tooltip>  
      </div>
    </BackTop>

    <!--日志id列表-->
    <Drawer v-model="modalList" :mask-closable="false" :mask="false" scrollable draggable width="400px">
      <p style="font-weight:800;font-size:18px">{{currentTarget}}</p>
      <br/>
      <Table stripe :columns="columnsDetail" :data="dataDetail" @on-row-click="showDetail" :show-header="false"></Table>
    </Drawer>

    <!--命令的详细信息-->
    <Modal v-model="modalDetail" scrollable width="55%" :z-index="20000">
      <p slot="header">{{detailTitle}}</p>
      <div>
        <Table border stripe :columns="columnsDetailInfo" :data="dataDetailInfo" :show-header="false" no-data-text="命令不存在或者信息已经过期"></Table>
      </div>
      <div slot="footer">
        <Tooltip content="上一条" placement="top">
          <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="showDetailPre"></Button>
        </Tooltip>
        <Tooltip content="下一条" placement="top">
          <Button type="primary" shape="circle" icon="md-arrow-forward" ghost @click.native="showDetailNext"></Button>
        </Tooltip>
        <Tooltip content="刷新" placement="top" style="margin-right: 20px">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshDetailInfo"></Button>
        </Tooltip>
      </div>
    </Modal>

    <Modal v-model="modalSummary" scrollable width="55%" :z-index="20000">
      <p slot="header">最后一行命令输出汇总</p>
      <div>
        <Table border stripe :columns="columnsSummaryInfo" :data="summaryInfo" ></Table>
      </div>
      <div slot="footer">
        <Tooltip content="刷新" placement="top" style="margin-right: 20px">
          <Button type="primary" shape="circle" icon="md-refresh" ghost @click.native="refreshSummary"></Button>
        </Tooltip>
      </div>
    </Modal>

    <Modal v-model="modalRerun" scrollable width="55%" :z-index="20000">
      <p slot="header">{{runTitle}}</p>
      <div>
        <Form :label-width="100">
          <Divider>session</Divider>
          <FormItem v-for="(item, i) in checkSession" :key="item.key" v-bind:label="item.key">
            <Input v-model="item.value" readonly></Input>
          </FormItem>

          <Divider>readonly</Divider>
          <FormItem v-for="(item, i) in checkReadonly" :key="item.key" v-bind:label="item.key">
            <Input v-model="item.value" readonly></Input>
          </FormItem>

          <Divider v-if="checkChangable.length > 0">changable</Divider>
          <FormItem v-for="(item, i) in checkChangable" :key="item.key" v-bind:label="item.key">
            <!--Input v-if="item.key === 'begin_host'" v-model="item.value" placeholder="请输入在哪个主机开始执行（根据情况可以不输入）"></Input-->
            <InputNumber v-if="item.key === 'begin_line'" v-model="item.value" :max="parseInt(selectParams.playbook_rownum)" :min="1"></InputNumber>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
          <Button type="primary" size="large" @click.native="realRerun">执行</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  import order from '@/api/order'
  import exec from '@/api/exec'
  // import dura from '@/api/dura'
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
            width: 50
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
            title: '执行对象',
            key: 'target',
            sortable: true,
            minWidth: 150
          },
          {
            title: '当前状态',
            key: 'exe_status',
            align: 'center',
            sortable: true,
            width: 150
          },
          {
            title: '执行行数',
            key: 'exe_rownum',
            align: 'center',
            sortable: true,
            width: 150
          },
          {
            title: '总行数',
            key: 'playbook_rownum',
            align: 'center',
            width: 150
          },
          {
            title: '开始时间',
            key: 'begin_date',
            sortable: true,
            width: 200
          },
          {
            title: '结束时间',
            key: 'end_date',
            sortable: true,
            width: 200
          },
          {
            title: '持续时间',
            key: 'endure',
            sortable: true,
            width: 200
          },
          {
             title: '操作与状态',
             key: 'action',
             align: 'center',
             width: 300,
             render: (h, params) => {
              let b = ''
              if (params.row.exe_status === 'executing') {
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
                  }, '中止')
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
                  }, '执行成功')
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
                        util.notice(this, '已经重新执行', 'info')
                      }
                    }
                  }, '重新执行中')
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
                  }, '执行失败'),
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
                  }, '重新运行'),
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
                  }, '继续运行')
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
        finishOnly: false
      }
    },
    methods: {
      playbookDetial () {
        // 使用新的非tab页面显示playbook
        let path = "/?playbook="+this.playbook+"&workid="+this.workid+"#/playbook"
        window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
      },
      abort (params) {
        // axios.get(`${this.baseurl}/order/abort?target_id=${params['target_id']}`)
        order.abort(params['target_id'])
          .then(res => {
            if (parseFloat(res.data.abort_time)) {
              util.notice(this, '请勿重复中止： ' + params['target'], 'warning')
            } else {
              util.notice(this, '中止： ' + params['target'], 'success')
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
        this.runTitle = '继续运行信息'
        this.getRerunInfo(params, params['target_id'])
      },
      rerun(params, index){
        this.runTitle = '重新运行信息'
        this.getRerunInfo(params, '')
      },
      getRerunInfo (params, target_id) {
        this.checkSession = this.checkReadonly = this.checkChangable = []
        this.modalRerun = true
        this.selectParams = params
        // axios.get(`${this.baseurl}/execution/rerun_info?work_id=${this.workid}&target=${this.selectParams['target']}&target_id=${target_id}`)
        exec.getRerunInfo(this.workid,this.selectParams['target'],target_id)
          .then(res => {
            this.checkSession = util.dict2arry(res.data['data']['session'], 'key', 'value')
            this.checkReadonly = util.dict2arry(res.data['data']['readonly'], 'key', 'value')
            this.checkChangable = util.dict2arry(res.data['data']['changable'], 'key', 'value')
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      realRerun () {
        let x = util.arry2dict(this.checkChangable, 'key', 'value')
        // let begin_host = ''
        let begin_line = 0
        if (x['begin_line']) {
          // begin_host = x['begin_host']
          begin_line = x['begin_line']
        }
        this.selectParams['exe_status'] = 'rerun'
        this.modalRerun = false
        // axios.get(`${this.baseurl}/execution/rerun?work_id=${this.workid}&target=${this.selectParams['target']}&target_id=${this.selectParams['target_id']}&begin_host=${begin_host}&begin_line=${begin_line}`)
        exec.rerun(this.workid,this.selectParams['target'],this.selectParams['target_id'],begin_line)
          .then(res => {
            console.log(res.data)
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
          order.exelist(params['target_id'])
            .then(res => {
              this.exelist=res.data['exelist']
              this.dataDetail = []
              res.data['exelist'].forEach((item, index) => {
                this.dataDetail.push({'index': index + 1, 'log_id': item})
              })
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        }
      },
      showDetailPre () {
        if (this.detailIndex > 1) {
          this.detailIndex=this.detailIndex-1
        } else {
          this.$Message.info('没有更前了')
        }
        this.realShowDetail(this.exelist[this.detailIndex-1],this.detailIndex)
        console.log(this.exelist[this.detailIndex-1],this.detailIndex)
      },
      showDetailNext () {
        if ( this.detailIndex < this.exelist.length ) {
          this.detailIndex=this.detailIndex+1
        } else {
          this.$Message.info('没有更后了')
        }
        this.realShowDetail(this.exelist[this.detailIndex-1],this.detailIndex)
        console.log(this.exelist[this.detailIndex-1],this.detailIndex)
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
        // axios.get(`${this.baseurl}/order/exedetail?id=${logID}`)
        order.exedetail(logID)
          .then(res => {
            this.dataDetailInfo = util.dict2arry(res.data['exedetail'], 'key', 'value')
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      refreshDetailInfo () {
        this.refreshShowDetail(this.logID)
        util.notice(this, '刷新成功', 'fast')
      },
      refreshCurrentPage () {
        try {
          if (this.finishOnly) {
            this.getCurrentPage(1)
          } else {
            this.getCurrentPage()
          }
          util.notice(this, '刷新成功', 'fast');
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
        util.notice(this, '刷新成功', 'fast')
      },
      finishFilter () {
        this.finishOnly = ! this.finishOnly
        if (this.finishOnly) {
          this.getCurrentPage(1)
        } else {
          this.getCurrentPage()
        }
      },
      getCurrentPage (exclude='') {
        this.workid = this.$route.query['workid']
        if (this.workid) {
          sessionStorage.setItem('order_list_workid', this.workid)
        } else {
          this.workid = sessionStorage.getItem('order_list_workid');
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
      }
    },
    destroyed() {
      // 销毁组件时调用
      // 持久化对前端透明 前端不进行任何操作
      // dura.dura(this.workid)
    },
    mounted () {
      this.getCurrentPage();
    }
  }
</script>
