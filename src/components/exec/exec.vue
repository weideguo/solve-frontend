<template>
  <div>
    <Card>
      <Table border stripe :columns="columns" :data="tableData" size="small" @on-row-dblclick="quickShow">
        <template #action="{ row, index }">
          <Button type="info" size="small" style="margin-right: 50px" @click="execJob(row)">{{ $t('run') }}</Button>
          <Button type="success" size="small" style="margin-right: 50px" @click="targetinfoDetail(row)">{{ $t('setting') }}</Button>
          <Button type="error" size="small" @click="delTarget(row)">{{ $t('delete') }}</Button>
        </template>
      </Table>
      <br>
      <Page :total="pageNumber" @on-change="getCurrentPage" :model-value="currentPage" :page-size="pagesize"  @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
    </Card>
    
    
    <Modal v-model="switchSubTargetSelect"  width="800"  :title="$t('executeSubTarget')">
      <Tree :data="subTargetTreeData" ref="subTargetTree" show-checkbox></Tree>
      
      <template #footer>
        <Button type="primary" @click="subTargetSelect"> {{ $t('confirm') }} </Button>
      </template>
    </Modal>


    <Modal v-model="switchExecutionInfo" @on-cancel="current = 0" scrollable :mask-closable="false" width="50%">

      <div v-if="current === 0">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('executeTarget') }}</b>
          <br><br>
        </div>

        <Form v-if="showTargets.length === 0" :label-width="100">

          <FormItem v-for="(item, i) in targetConstict" :key="i" :label="item.field">
            
            <Input v-model="item.value" :placeholder="item.comment" @click.native="subTargetAdd(item)" clearable></Input>
          </FormItem>
          
        </Form>

        <p v-else v-for="item in showTargets" :key="item">{{item}}</p>
      </div>

      <div v-else-if="current === 1">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('sessionParamsSetting') }}</b>
          <br><br>
        </div>
        <constrict-form ref="varsForm" :formdata="sessionFull" :nullInfo="$t('noSessionNeed')" :buttonTooltip="$t('saveSessionTips')" @buttonOperation="saveSession"></constrict-form>
      </div>
      
      <div v-else-if="current === 2">
        <div>
          <Icon type="md-pin"></Icon>
          <b>{{openinfo.name_s}}-{{ $t('confirmRun') }}</b>
          <br><br>
        </div>
        <Table border stripe :columns="columnsInfo" :data="dataDetailInfo" :show-header="false" :no-data-text="$t('templateInfoFailed')"></Table>
      </div>
      
      <br>
      <Steps :current="current">
        <Step :title="$t('executeTarget')"></Step>
        <Step :title="$t('paramsSetting')"></Step>
        <Step :title="$t('confirmRun')"></Step>
      </Steps>
      
      <template #footer>
        <Button v-if="current != 0" @click="previous">{{ $t('previousStep') }}</Button>
        <Button v-if="current != 2" type="primary" @click="next">{{ $t('nextStep') }}</Button>
        <Button v-if="current === 2" type="primary" @click="commit">{{ $t('run') }}</Button>
        <Button v-if="current === 2" type="info" @click="debugRun">{{ $t('debugRun') }}</Button>
        <!--Button v-if="current === 2 && debugAble" type="info" @click="debugRun">{{ $t('debugRun') }}</Button-->
      </template>
    </Modal>

    <!--双击行时的弹框显示-->
    <Modal v-model="openshow" footer-hide width="50%">
      <template #header>
        <p>
          {{showTitle}}
        </p>
      </template>
      <Tabs value="target">
        <TabPane :label="$t('executeTarget')" name="target">
          <div>
            <p v-if="showTargets.length === 0" align="center">{{ $t('executeTargetEmpty') }}</p>
            <p v-else v-for="item in showTargets" :key="item">{{item}}</p>
          </div>
        </TabPane>
        <TabPane :label="$t('templateDetail')" name="tmpl">
          <Table border stripe :columns="columnsInfo" :data="tmplInfo" :show-header="false" :no-data-text="$t('templateInfoFailed')"></Table>
        </TabPane>
        <TabPane label="playbook" name="playbook">
          <Input v-model="playbookContent" type="textarea" :autosize="{minRows: 10,maxRows: 20}" placeholder="playbook is loading" readonly />
        </TabPane>
      </Tabs>
    </Modal>

  </div>
</template>

<script>
  //
  import { toRaw } from 'vue'
  import exec from '@/api/exec'
  import util from '@/libs/util'
  import file from '@/api/file'
  import target from '@/api/target'
  import constrictForm from '@/components/common/constrictForm.vue'

  export default {
    components: {
      constrictForm
    },
    data () {
      return {
        current: 0,
        openshow: false,
        showTitle: '',
        showTargets: [],
        switchExecutionInfo: false,
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
            // tooltip: true,
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
            title: this.$t('operation'),
            slot: 'action',
            align: 'center',
            width: 450,
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
        debugAble: false,
        targetConstict: [],
        execExtraInfo: {},
        switchSubTargetSelect: false,
        subTargetTreeData: [],
        targetInfoOld: '',
        shouldTagetCommit: true,
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
          if (this.targetConstict.length && ! this.showTargets.length ) {
            // 如果需要构造对象，第一个tab点击下一步时，先保存对象
            let targetInfo = {}
            this.targetConstict.forEach((k,i) =>{
              targetInfo[k['field']] = k['value']
            })
            
            if ( this.shouldTagetCommit || this.targetInfoOld != JSON.stringify(targetInfo) ) {
              this.targetInfoOld = JSON.stringify(targetInfo)
              this.targetName = 'container_auto_'+util.formatDate((new Date().getTime()) / 1000).replace(new RegExp('-','g'),'').replace(new RegExp(':','g'),'').replace(new RegExp(' ','g'),'_')
                                +'_'+Math.round(Math.random()*10000)
              targetInfo['name'] = this.targetName
              
              for (const [key, value] of Object.entries(targetInfo)) {
                if (value === undefined || value === null || value === '') {
                  util.notice(this, key+this.$t('shouldNotEmpty'), 'error')
                  return
                }
              }
              
              target.addTarget(targetInfo)
                .then(res => {
                  if (res.data['status'] < 1) {
                      util.notice(this, `${res.data['msg']}`, 'warning')
                  } else {
                    this.shouldTagetCommit = false
                    this.current += 1
                    this.execExtraInfo = {'number':1 ,'target': this.targetName}
                  }
                }).catch(error => {
                  util.notice(this, error, 'error')
                })
              
            } else {
              this.current += 1
            }
          } else {
            this.targetName = ''
            this.execExtraInfo = {}
            this.current += 1
          }
          // 处理select_field_key类型的session变量
          let targetName = this.targetName
          if (this.showTargets.length != 0) {
            targetName = this.showTargets[0]
          }
          //console.log(this.sessionFull)
          this.sessionFull.forEach((sessionItem) => {
            if (sessionItem['type'] === 'select_field_key' || sessionItem['_type'] === 'select_field_key') {
              console.log(sessionItem)
              sessionItem['_type'] = 'select_field_key'
              sessionItem['type'] = 'select'
              if ( !sessionItem.hasOwnProperty('constrict') ) {
                this.$Message.error(this.$t('select_field_key_SessionVarConstrictFieldMustExist'))
                return
              }
              if ( !sessionItem.hasOwnProperty('_constrict') ) {
                sessionItem['_constrict'] = sessionItem['constrict']
              }
              console.log('targetName',targetName,'field',sessionItem['_constrict'])
              sessionItem['constrict'] = []
              setTimeout(() => {
                // 稍微延后再执行，可能存在执行对象临时构建的情况
                target.getTargetDetail(targetName,sessionItem['_constrict'])
                  .then(res => {
                    if (res.data['status'] > 0) {
                      if (res.data['status'] === 1) {
                        sessionItem['constrict'] = Object.keys(res.data['data'])
                      } else {
                        console.log(res.data)
                        util.notice(this, targetName+' '+sessionItem['constrict']+' \n'+this.$t('fieldOfTargetNotAnObject'), 'error')
                      }
                    } else {
                      util.notice(this, targetName+res.data['msg'], 'error')
                    }
                  })
                  .catch(error => {
                    util.notice(this, error, 'error')
                  })
              },500)
            }
          })

        } else if (this.current === 1) {
          if (this.errFlag) {
            this.$Message.error(this.$t('getPlaybookFailedTips'))
          } else if (JSON.stringify(this.formItem) === '{}') {
            this.current += 1
            this.summary(this.execExtraInfo)
          } else {
            this.sessionInfo = this.$refs['varsForm'].getFormItem()
            // this.sessionInfo = this.$refs['varsForm'].formItem
            this.sessionFull.forEach((item) => {
              item['value'] = this.sessionInfo[item['key']]
            })
            if (this.$refs['varsForm'].checkValidate()) {
              this.current += 1
              this.summary(this.execExtraInfo)
            } else {
              this.$Message.error(this.$t('form.checkErr'))
            }
          }
        } else {
          this.current += 1
        }
      },
      saveSession (data) {
        // console.log(data)
        exec.postSession(`${this.openinfo['name']}`, data)
          .then(res => {
            util.notice(this, this.$t('sessionSaveSuccess'), 'info')
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
        
      },
      summary (extraInfo) {
        let rowinfo = util.dictDeepCopy(this.openinfo)
        for (let k in extraInfo) {
          rowinfo[k] = extraInfo[k]
        }
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
        this.showTargets = []
        if (params['target'] != '') {
          this.showTargets = params['target'].split(',')
        }
        this.tmplInfo = []
        this.playbookContent = ''
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
      execJob (row) {
        this.showTargets = []
        if (row['target'] != '') {
          this.showTargets = row['target'].split(',')
        }
        
        this.openinfo = row
        this.openinfo_s = row['name_s']
        exec.getSession(`${row['name']}`)
          .then(res => {
            // this.switchExecutionInfo = !this.switchExecutionInfo
            this.sessionFull = res.data['session']
            this.debugList = res.data['pause']
            this.targetConstict = res.data['target_constrict']
            if (!(this.debugList instanceof Object)) {
              this.debugList = [this.debugList]
            }
            this.formItem = util.arry2dict(this.sessionFull)
            this.errFlag = false

            if ( ! this.targetConstict.length && ! parseInt(row['number']) ) {
              this.$Message.error(this.$t('getExecuteTargetTips'))
            } else {
              this.switchExecutionInfo = !this.switchExecutionInfo
              this.shouldTagetCommit = true
            }

          })
          .catch(error => {
            this.errFlag = true
            this.formItem = {}
            this.formKey = []
            // util.notice(this, '获取session参数失败，请检查playbook是否正确！', 'error')
            this.$Message.error(this.$t('getSessionFailedTips'))
          })

      },
      subTargetAdd (targetConstict) {
        // 根据传入的constrict 显示选择树
        this.activeTargetConstict = targetConstict
        this.targetType = targetConstict['constrict']
        if (this.targetType != '') {
          this.switchSubTargetSelect = true
          let selectedItem = []
          target.getNameList(`${this.targetType}`)
            .then(res => {
              this.subTargetTreeData = []
              this.subTargetTreeData.push(util.formateTreeData(res.data['data'], selectedItem));
            })
            .catch(error => {
              util.notice(this, error, 'error');
            })
        } else {
          this.$Message.error(this.$t('setTemplateTips'))
        }
      },
      subTargetSelect () {
        let checkedleaf = util.getCheckedLeaf(this.subTargetTreeData)
        // console.log(this.activeTargetConstict)
        if (checkedleaf.length === 1) {
          this.switchSubTargetSelect = false
          this.activeTargetConstict.value = checkedleaf[0]
        } else {
          this.$Message.error(this.$t('onlyOneOndeSelectTips'))
        }
      },
      realCommit (debug=0) {
        if (this.errFlag) {
          this.$Message.error(this.$t('getPlaybookFailedTips') )
        } else {
          if (!debug) {
            debug = this.debugList
          }
          this.switchExecutionInfo = false
          this.$Message.info(this.$t('afterCommitTips'))

          exec.postExecution(this.openinfo['name'], this.sessionInfo, String(debug), this.targetName)
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
      targetinfoDetail (row) {
        this.execInfo = row;
        this.execInfo['name'] = this.execInfo['name_s'];
        delete this.execInfo['name_s'];
        // console.log(toRaw(this.execInfo))
        util.openPageEx(this, 'execDetail', {row: JSON.stringify(this.execInfo), tag: 'update'})
      },
      getCurrentPageNew (pagesize) {
        this.pagesize=pagesize
        this.getCurrentPage(1)
      },
      getCurrentPage (vl) {
        this.filter = this.$route.name + ':*'
        if (!vl) {
          vl = sessionStorage.getItem('execCurrentpage')
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem('execCurrentpage', vl);
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
        this.delname = d.name
        // this.deleteConfirm = true
        this.$Modal.confirm({'title': this.$t('confirmDelete')+` ${this.delname} ？`,'onOk': this.realDelTarget, 'okText':this.$t('delete'), 'cancelText': this.$t('cancel') , 'width': '700px'});
      },
      realDelTarget () {
        // this.deleteConfirm = false
        let d = this.delname
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
