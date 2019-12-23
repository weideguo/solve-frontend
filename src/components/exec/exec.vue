<template>
  <div>
    <Row>
      <Card>
        <!--p slot="title">
          <Icon type="md-flower"></Icon>
          可执行列表
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
          <b>{{openinfo.name_s}}-session参数设置</b>
          <br><br>
        </div>

        <Form ref="varsForm" :label-width="100" :model="formItem" :rules="formValidate">
          <p v-if="JSON.stringify(formItem) === '{}'" style="text-align: center">没有需要设置的session参数</p>
          <div v-else>
            <FormItem v-for="k in formKey" :prop="k" :key="k" :label="k">
              <Input v-model="formItem[k]" type="text" placeholder="please input" clearable></Input>
            </FormItem> 
            <div style="float:right;" >
              <Tooltip content="只是保存session，可选" placement="bottom">
                <Button @click="saveSession" type="primary" ghost>保存</Button>
              </Tooltip>
            </div>
            <div  style="clear:both"></div>
          </div>   
        </Form>
      </div>
      
      <div v-else-if="current === 1">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-确认执行</b>
          <br><br>
        </div>
        <Table border stripe :columns="columnsInfo" :data="dataDetailInfo" :show-header="false" no-data-text="获取执行信息失败"></Table>
      </div>
      
      <br>
      <Steps :current="current">
          <Step title="参数设置"></Step>
          <Step title="确认执行"></Step>
      </Steps>
      
      <div slot="footer">
        <Button @click="previous">上一步</Button>
        <Button v-if="current != 1" type="primary" @click="next">下一步</Button>
        <Button v-else type="primary" @click="commit">执行</Button>
      </div>
    </Modal>

    <!--双击行时的弹框显示-->
    <Modal v-model="openshow" width="50%">
      <p slot="header">
        {{showTitle}}
      </p>
      <Tabs value="target">
        <TabPane label="执行对象" name="target">
          <div>
            <p v-if="showContent.length === 0" align="center">执行对象为空</p>
            <p v-else v-for="item in showContent" :key="item">{{item}}</p>
          </div>
        </TabPane>
        <TabPane label="模板详情" name="tmpl">
          <Table border stripe :columns="columnsInfo" :data="tmplInfo" :show-header="false" no-data-text="获取信息失败"></Table>
        </TabPane>
      </Tabs>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
  //
  import axios from 'axios'
  import util from '@/libs/util'

  export default {
    data () {
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        current: 0,
        openshow: false,
        showTitle: '',
        showContent: [],
        openswitch: false,
        formItem: {},
        formKey: [],
        formValidate: {},
        openinfo: {},
        tmplInfo: [],
        dataDetailInfo: [],
        tmplInfoSort: ['name','target','playbook','job_type','comment'],
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
            title: '执行对象数量',
            key: 'number',
            align: 'center',
            width: 150,
            sortable: true
          },
          {
            title: '模板',
            key: 'tmpl',
            sortType: 'desc',
            width: 300,
            sortable: true
          },
          {
            title: 'comment',
            key: 'comment',
            tooltip: true,
            sortable: true
          },
          {
            title: '执行',
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
                }, '执行')
              ])
            }
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
                    type: 'success'
                  },
                  on: {
                    click: () => {
                      this.targetinfoDetail(params)
                    }
                  }
                }, '设置')
              ])
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
                      this.delTarget(params.row.name);
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
      previous () {
        if (this.current) {
          this.current -= 1;
        }
      },
      next () {
        if (this.errFlag) {
          this.$Message.error('获取playbook的信息失败，不能执行任务')
        } else if (JSON.stringify(this.formItem) === '{}') {
          this.current += 1
          this.summary()
        } else {
          this.$refs['varsForm'].validate((valid) => {
            if (valid) {
              this.current += 1
              this.summary()
            } else {
              this.$Message.error('表单检查失败')
            }
          })   
        }
         
      },
      saveSession () {
        axios.post(`${this.baseurl}/session/?filter=${this.openinfo['name']}`, this.formItem)
          .then(res => {
            util.notice(this, 'session保存成功', 'info')
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
        axios.get(`${this.baseurl}/executioninfo/get?filter=${params['tmpl']}`)
          .then(res => {
            this.tmplInfo = util.dict2arry(res.data['data'][0],'key', 'value',this.tmplInfoSort)
          })
          .catch(error => {
            this.$Message.error('获取模板信息失败，请检查模板是否存在！')
          })
      },
      execJob (params) {
        if (parseInt(params.row['number'])){
          this.openinfo = params.row
          this.openinfo_s = params.row['name_s']
          axios.get(`${this.baseurl}/session/?filter=${params.row['name']}`)
            .then(res => {
              this.openswitch = !this.openswitch
              this.formItem = res.data['vars']
              this.formKey = util.dictKeys(res.data['vars'])
              this.formKey.forEach((item,i) => {
                this.formValidate[item] = [
                  {
                    required: true,
                    message: '不能为空',
                    trigger: 'blur'
                  },
                  {
                    validator: util.noLeftAndRightSpaceCheck,
                    trigger: 'blur'
                  }
                ]
              })
              this.errFlag = false
            })
            .catch(error => {
              this.errFlag = true
              this.formItem = {}
              this.formKey = []
              // util.notice(this, '获取session参数失败，请检查playbook是否正确！', 'error')
              this.$Message.error('获取session参数失败，请检查playbook是否正确')
            })
        } else {
          this.$Message.error('请先选择执行对象')
        } 
      },
      commit () {
        if (this.errFlag) {
          this.$Modal.error({'title': '获取playbook的信息失败，不能执行任务'})
        } else {
          this.openswitch = false
          this.$Message.info('开始提交，请勿多次运行')
          this.sessionInfo = this.formItem
          axios.post(`${this.baseurl}/execution/?filter=${this.openinfo['name']}`, this.sessionInfo)
            .then(res => {
              util.notice(this, `${this.openinfo['name_s']} 开始执行`, 'info')
              util.openPageEx(this, 'orderDetail', {workid: res.data['data']})
            })
            .catch(error => {
              util.notice(this, error, 'error')
            });
        }
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
        axios.get(`${this.baseurl}/executioninfo/get?filter=${this.filter}&page=${vl}&pagesize=${this.pagesize}`)
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
      delTarget (t) {
        this.delname = t
        this.$Modal.confirm({'title': `确认删除 ${this.delname} ？`,'onOk': this.realDelTarget, 'cancelText': '取消', 'width': '700px'});
      },
      realDelTarget () {
        let t = this.delname
        axios.get(`${this.baseurl}/executioninfo/del?target=${t}`)
          .then(res => {
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${t} 删除成功`, 'success');
            } else {
              util.notice(this, `${t} 删除失败`, 'error');
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      }
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
