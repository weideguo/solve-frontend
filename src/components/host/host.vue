<template>
  <div>
    <Row>
      <Card>
        <div slot="title" style="height: 32px">
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()">{{ $t('addHost') }}</Button>
          <!--Vue 限制的两个标签 Switch 和 Circle-->
          <i-switch size="large" @on-change="onlineFilter" style="margin-left: 50px">
            <span slot="open">{{ $t('connect') }}</span>
            <span slot="close">{{ $t('all') }}</span>
          </i-switch>
          <div style="float:right;margin-right: 0px">
            <Input v-model="searchWord" @on-search="search()" search enter-button :placeholder="$t('searchTips')" style="width: 350px"/>
          </div>
        </div>
        
        <Row>
          <Col span="24">
            <Table border :columns="columns" :data="tableData" @on-row-dblclick="targetinfoDetail" stripe size="small"></Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :page-size="this.pageSize" :current="this.currentPage" show-elevator show-total></Page>
      </Card>
    </Row>

    <Modal v-model="openswitch" width="50%">          
      <p slot="header">
        <span>{{modelTitle}}</span>
      </p>
      
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formCommit" :primaryButtonName="$t('update')" @secondClick="optionOperate" :secondCheck="!isAdd" :secondButtonName="isAdd? $t('cancel') : $t('copy')"></safe-form>
      <div slot="footer"></div>
    </Modal>
    
  </div>
</template>

<script>
  //
  // import axios from 'axios'
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
        switch1: true,
        baseurl: this.$store.getters.sessionGet('baseurl'),
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
              validator: util.validatorGenerator(),
              trigger: 'blur'
            },
          ],
          passwd: [
            {
              required: true,
              message: this.$t('inputHostPasswordTips'),
              trigger: 'blur'
            },
            {
              validator: util.validatorGenerator(),
              trigger: 'blur'
            },
          ],
          proxy: []
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
            key: 'action',
            align: 'center',
            width: 200,
            render: (h, params) => {
              let x;
              if (params.row['is_conn'] === 0) {
                x = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'warning'
                    },
                    on: {
                      click: () => {
                        this.createConn(params);
                      }
                    }
                  }, this.$t('createConnect'))
                ])
              } else if (params.row['is_conn'] === 1) {
                x = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'success'
                    },
                    on: {
                      click: () => {
                        this.closeConn(params);
                      }
                    }
                  }, this.$t('closeConnect'))
                ])
              } else if (params.row['is_conn'] === 2) {
                x = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'success',
                      loading: true
                    },
                    on: {
                      click: () => {
                        this.closeConn(params);
                      }
                    }
                  }, this.$t('closeConnecting'))
                ])
              } else if (params.row['is_conn'] === 3) {
                x = h('div', [
                  h('Button', {
                    props: {
                      size: 'small',
                      type: 'warning',
                      loading: true
                    },
                    on: {
                      click: () => {
                        this.createConn(params);
                      }
                    }
                  }, this.$t('createConnecting'))
                ])
              }
              return x
            }
          },
          {
            title: this.$t('detail'),
            key: 'action',
            align: 'center',
            width: 200,
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
                      this.delTarget(params.row.name);
                    }
                  }
                }, this.$t('delete'))
              ])
            }
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
          // axios.get(`${this.baseurl}/host/onlinedetail`)
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
        // axios.get(`${this.baseurl}/target/get?filter=${searchWord}&page=${vl}&pagesize=${this.pageSize}`)
        target.getTarget(searchWord,vl,this.pageSize)
          .then(res => {
            // axios.get(`${this.baseurl}/host/online`)
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
        // axios.get(`${this.baseurl}/target/del?target=${t}`)
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
        // axios.post(`${this.baseurl}/target/add`, info)
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
      closeConn (params) {
        if (params.row['ip']) {
          params.row['is_conn'] = 2
          // axios.get(`${this.baseurl}/host/kill?ip=${params.row['ip']}`)
          host.kill(params.row['ip'])
            .then(res => {
              if (res.data['status'] === 1) {
                params.row['is_conn'] = 0
                util.notice(this, `${params.row['ip']} ${res.data['msg']}`, 'success')
              } else {
                params.row['is_conn'] = 1
                util.notice(this, `${params.row['ip']} ${res.data['msg']}`, 'error')
              }
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.$Message.info(this.$t('notCloseConnectTips'))
        }    
      },
      createConn (params) {
        if (params.row['ip']) {
          params.row['is_conn'] = 3
          // axios.get(`${this.baseurl}/host/conn?ip=${params.row['ip']}`)
          host.conn(params.row['ip'])
            .then(res => {
              if (res.data['status'] === 1) {
                params.row['is_conn'] = 1
                util.notice(this, `${params.row['ip']} ${res.data['msg']}`, 'success')
              } else {
                params.row.is_conn = 0
                util.notice(this, `${params.row['ip']} ${res.data['msg']}`, 'error')
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
        // axios.get(`${this.baseurl}/target/get?filter=tmpl_${this.$route.name}`)
        // axios.get(`${this.baseurl}/config?key=tmpl_${this.$route.name}`)
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
