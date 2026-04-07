<template>
  <div>
    <Row>
      <Card>
        <template #title style="height: 32px">
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()">{{ $t('addHost') }}</Button>
          <Switch size="large" @on-change="onlineFilter" style="margin-left: 50px">
            <template #open>
              <span>{{ $t('connect') }}</span>
            </template>
            <template #close>
              <span>{{ $t('all') }}</span>
            </template>
          </Switch>
          <div style="float:right;margin-right: 0px">
            <Input v-model="searchWord" @on-search="search()" search enter-button :placeholder="$t('searchTips')" style="width: 350px"/>
          </div>
        </template>
        
        <Row>
          <Col span="24">
            <Table border :columns="columns" :data="tableData" @on-row-dblclick="targetinfoDetail" stripe size="small">
              <template #operation="{ row, index }">                
                <Button v-if="row['is_conn'] === 0" type="warning" size="small" @click="createConn(row)">{{ $t('createConnect') }}</Button>
                <Button v-else-if="row['is_conn'] === 1" type="success" size="small" @click="closeConn(row)">{{ $t('closeConnect') }}</Button>
                <Button v-else-if="row['is_conn'] === 2" type="success" loading size="small" >{{ $t('closeConnecting') }}</Button>
                <Button v-else-if="row['is_conn'] === 3" type="warning" loading size="small" >{{ $t('createConnecting') }}</Button>
              </template>
              <template #detail="{ row, index }">
                <Button type="success" size="small" @click="targetinfoDetail(row)">{{ $t('detail') }}</Button>
              </template>
              <template #delete="{ row, index }">
                <Button type="error" size="small" @click="delTarget(row.name)">{{ $t('delete') }}</Button>
              </template>
            </Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :page-size="this.pageSize" :model-value="this.currentPage" show-elevator show-total></Page>
      </Card>
    </Row>

    <Modal v-model="openswitch" footer-hide width="50%">
      <template #header>          
        <p>
          <span>{{modelTitle}}</span>
        </p>
      </template>
      
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formCommit" :primaryButtonName="isAdd? $t('add') : $t('update')" @secondClick="optionOperate" :secondCheck="!isAdd" :secondButtonName="isAdd? $t('cancel') : $t('copy')"></safe-form>
    </Modal>
    
  </div>
</template>

<script>
  //
  import target from '@/api/target'
  import host from '@/api/host'
  import config from '@/api/config'
  import util from '@/libs/util'
  import safeForm from '@/components/common/safeForm.vue'

  export default {
    components: {
      safeForm
    },
    data () {
      return {
        isOnline: false,
        searchWord: '',
        formItemValidate: {
          ip: [
            {
              required: true,
              message: this.$t('inputIpTips'),
              trigger: 'blur'
            },
            {
              validator: util.validatorGenerator(),
              trigger: 'blur'
            },
          ],
          user: [
            {
              required: true,
              message: this.$t('inputUserTips'),
              trigger: 'blur'
            },
            {
              validator: util.validatorGenerator(),
              trigger: 'blur'
            },
          ],
          ssh_port: [
            {
              required: true,
              message: this.$t('inputSshPortTips'),
              trigger: 'blur'
            },
            {
              validator: util.validatorGenerator('^\\d+$',this.$t('portMustBeNum')),
              trigger: 'blur'
            },
          ],
          passwd: [
            {
              validator: util.validatorGenerator('^$|^[^\\s]$|^[^\\s].*[^\\s]$',this.$t('emptyOrNoSpaceLeftRight')),
              trigger: 'blur'
            },
          ],
          proxy: [
            {
              validator: util.validatorGenerator('^$|^[^\\s]$|^[^\\s].*[^\\s]$',this.$t('emptyOrNoSpaceLeftRight')),
              trigger: 'blur'
            },
          ]
        }, 
        formItem: [],
        opentarget: '',
        columns: [
          {
            title: 'name',
            key: 'name',
            minWidth: 400,
            sortable: true
          },
          {
            title: 'IP',
            key: 'ip',
            width: 400,
            sortable: true
          },
          {
            title: this.$t('sshPort'),
            key: 'ssh_port',
            width: 200,
            sortable: true
          },
          {
            title: this.$t('user'),
            key: 'user',
            align: 'center',
            sortable: true,
            width: 100
          },
          {
            title: this.$t('operation'),
            slot: 'operation',
            align: 'center',
            width: 200,
          },
          {
            title: this.$t('detail'),
            slot: 'detail',
            align: 'center',
            width: 200,
          },
          {
            title: this.$t('delete'),
            slot: 'delete',
            align: 'center',
            width: 100,
          }
        ],
        tableData: [],
        pageSize: 16,
        pageNumber: 1,
        currentPage: 1,
        filter: '',
        openswitch: false,
        modelTitle: '',
        isAdd: false,
        // deleteConfirm: false,
        // delname: ''
      }
    },
    methods: {
      formCommit (data) {
        // console.log(data)
        data['name'] = 'realhost_' + data['ip']
        if (!this.isAdd) {
          data['name_o'] = this.opentarget
        }
        console.log(data)
        this.addTarget(data)
        this.openswitch = false
      },
      optionOperate (data) {
        if (!this.isAdd) {
          console.log('is add')
          data['name'] = 'realhost_' + data['ip']
          if (data['name'] === this.opentarget) {
            this.$Message.error(this.$t('ipUniqueTips'))
          } else {
            this.addTarget(data)
            this.openswitch = false
          }
        } else {
          console.log('is cancel')
          this.openswitch = false
        }
        console.log(data)
      },
      onlineFilter () {
        this.isOnline = ! this.isOnline
        if (this.isOnline) {
          host.getOnlinedetail()
            .then(res => {
              res.data['data'].forEach((item) => {
                 item['info'] = util.dictDeepCopy(item)
              })
              this.tableData = res.data['data']
              this.pageNumber = res.data['page']
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.getCurrentPage()
        }
      },
      search (vl = 1) {
        let searchWord = ''
        if (this.searchWord) {
          searchWord = this.searchWord
        } else {
          searchWord = this.$route.name + '*'
        }
        searchWord = encodeURIComponent(searchWord)
        target.getTarget(searchWord,vl,this.pageSize)
          .then(res => {
            host.getOnline()
              .then(res2 => {
                let onlinehost = [];
                res.data['data'].forEach((item) => {
                  res2.data['data'].forEach((item) => {
                    if (item['is_conn']) {
                      onlinehost.push(item['host'])
                    }
                  })
                  if (onlinehost.indexOf(item['ip']) < 0) {
                    item['is_conn'] = 0;
                  } else {
                    item['is_conn'] = 1;
                  }
                })
                this.tableData = res.data['data']
                this.pageNumber = parseInt(res.data['page'])
              })
              .catch(error2 => {
              util.notice(this, error2, 'error')
              })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      targetinfoDetail (params) {
        let info = util.dictDeepCopy(params)
        if (info['name'].search('^' + this.$route.name) > -1) {
          this.openswitch = true
          this.isAdd = false
          this.modelTitle = this.$t('updateInfo')
          this.opentarget = info['name']
          let x = ['name','is_conn','_index','_rowKey']
          x.forEach((item,i) => {
            delete info[item]
          })
          this.formItemNew = util.dictDeepCopy(this.formItemOrigin)
          this.formItemNew.forEach((item, i) => {
            item['value'] = info[item['key']]
          })
          this.formItem = this.formItemNew
        } else {
          // util.notice(this, '当前项不在此查看详细', 'info')
          this.$Message.info(this.$t('notUpdateTips'))
        }
      },
      targetinfoAdd () {
        this.openswitch = true;
        this.isAdd = true
        this.formItem = this.formItemOrigin
        this.modelTitle = this.$t('addInfo')
      },
      getCurrentPage (vl) {
        this.filter = this.$route.name;
        if (!vl) {
          vl = sessionStorage.getItem(`${this.filter}Currentpage`)
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem(`${this.filter}Currentpage`, vl);
        this.search(vl)
      },
      delTarget (t) {
        this.delname = t
        // this.deleteConfirm = true
        this.$Modal.confirm({'title': this.$t('confirmDelete')+` ${this.delname} ？`,'onOk': this.realDelTarget, 'okText':this.$t('delete'), 'cancelText': this.$t('cancel') , 'width': '700px'});
      },
      realDelTarget () {
        // this.deleteConfirm = false
        let t = this.delname
        target.delTarget(t.replace('#','%23'))
          .then(res => {
            // console.log(res.data.status);
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${t} `+this.$t('deleteSuccess'), 'success')
            } else {
              util.notice(this, `${t} `+this.$t('deleteFailed'), 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      addTarget (info) {
        target.addTarget(info)
          .then(res => {
            if (res.data['status'] >= 1) {
              util.notice(this, `${info['name']} ${res.data['msg']}`, 'success')
              this.getCurrentPage();
            } else {
              util.notice(this, `${info['name']} ${res.data['msg']}`, 'warning')
            }
          }).catch(error => {
            util.notice(this, error, 'error')
          });
      },
      closeConn (row) {
        if (row['ip']) {
          row['is_conn'] = 2
          host.kill(row['ip'])
            .then(res => {
              if (res.data['status'] === 1) {
                row['is_conn'] = 0
                util.notice(this, `${row['ip']} ${res.data['msg']}`, 'success')
              } else {
                row['is_conn'] = 1
                util.notice(this, `${row['ip']} ${res.data['msg']}`, 'error')
              }
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.$Message.info(this.$t('notCloseConnectTips'))
        }    
      },
      createConn (row) {
        if (row['ip']) {
          row['is_conn'] = 3
          host.conn(row['ip'])
            .then(res => {
              if (res.data['status'] === 1) {
                row['is_conn'] = 1
                util.notice(this, `${row['ip']} ${res.data['msg']}`, 'success')
              } else {
                row.is_conn = 0
                util.notice(this, `${row['ip']} ${res.data['msg']}`, 'error')
              }
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.$Message.info(this.$t('notCreateConnectTips'))
        }
      },
      reflashTmpl() {
        config.getKey(`tmpl_${this.$route.name}`)
          .then(res => {
            delete res.data['data']['name']
            let keyInfo={}
            if(res.data['data']) {
              keyInfo=res.data['data']
            }
            // 后端不存在的字段说明时使用排序指定的key当成默认
            this.itemSort.forEach((k, i) => {
              if(!keyInfo[k]) {
                keyInfo[k]=""
              }
            })
            this.formItemOrigin = util.dict2arry(keyInfo, 'key', 'comment', this.itemSort)
            this.formItemOrigin.forEach((item, i) => {
              item['label'] = item['key']
            })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      }
    },
    computed: {
      itemSort () {
        return util.dictKeys(this.formItemValidate)
      }
    },
    mounted () {
      this.getCurrentPage()
    },
    created () {
      this.reflashTmpl()
    }
  }
</script>
