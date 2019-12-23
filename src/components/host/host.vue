<template>
  <div>
    <Row>
      <Card>
        <div slot="title" style="height: 32px">
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()">添加主机</Button>
          <!--<Checkbox v-model="isOnline" @click.prevent.native="onlineFilter" style="margin-left: 50px">只选已连接</Checkbox>-->
          <!--Vue 限制的两个标签 Switch 和 Circle-->
          <i-switch size="large" @on-change="onlineFilter" style="margin-left: 50px">
            <span slot="open">连接</span>
            <span slot="close">全部</span>
          </i-switch>
          <div style="float:right;margin-right: 0px">
            <Input v-model="searchWord" @on-search="search()" search enter-button placeholder="* 可用为搜索通配符" style="width: 350px"/>
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
      
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :formvalidate="formItemValidate" @primaryClick="formCommit" @secondClick="optionOperate" :secondCheck="!isAdd" :secondButtonName="isAdd?'取消':'复制'"></safe-form>
      <div slot="footer"></div>
    </Modal>

  </div>
</template>
"
<script>
  //
  import axios from 'axios'
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
              message: '请输入主机ip',
              trigger: 'blur'
            },
            {
              validator: util.noLeftAndRightSpaceCheck,
              trigger: 'blur'
            },
          ],
          user: [
            {
              required: true,
              message: '请输入连接的用户',
              trigger: 'blur'
            },
            {
              validator: util.noLeftAndRightSpaceCheck,
              trigger: 'blur'
            },
          ],
          ssh_port: [
            {
              required: true,
              message: '请输入连接的SSH端口',
              trigger: 'blur'
            },
            {
              validator: util.noLeftAndRightSpaceCheck,
              trigger: 'blur'
            },
          ],
          passwd: [
            {
              required: true,
              message: '请输入连接的密码',
              trigger: 'blur'
            },
            {
              validator: util.noLeftAndRightSpaceCheck,
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
            width: 300,
            sortable: true
          },
          {
            title: 'IP',
            key: 'ip',
            width: 300,
            sortable: true
          },
          {
            title: 'SSH端口',
            key: 'ssh_port',
            width: 300,
            sortable: true
          },
          {
            title: '用户',
            key: 'user',
            align: 'center',
            sortable: true
          },
          {
            title: '操作',
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
                  }, '创建连接')
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
                  }, '断开连接')
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
                  }, '断开连接...')
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
                  }, '创建连接...')
                ])
              }
              return x
            }
          },
          {
            title: '详细',
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
                      this.delTarget(params.row.name);
                    }
                  }
                }, '删除')
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
        isAdd: false
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
            this.$Message.error('新增ip必须与现有的不同')
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
          axios.get(`${this.baseurl}/host/onlinedetail`)
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
        axios.get(`${this.baseurl}/targetinfo/get?filter=${searchWord}&page=${vl}&pagesize=${this.pageSize}`)
          .then(res => {
            axios.get(`${this.baseurl}/host/online`)
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
          this.modelTitle = "更新信息"
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
          this.$Message.info('当前项不能在此查看与修改')
        }
      },
      targetinfoAdd () {
        this.openswitch = true;
        this.isAdd = true
        this.formItem = this.formItemOrigin
        this.modelTitle = "新增信息"
      },
      getCurrentPage (vl) {
        this.filter = this.$route.name;
        if (!vl) {
          vl = sessionStorage.getItem(`${this.filter}_currentpage`)
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem(`${this.filter}_currentpage`, vl);
        this.search(vl)
      },
      delTarget (t) {
        this.delname = t
        this.$Modal.confirm({'title': `确认删除 ${this.delname} ？`,'onOk': this.realDelTarget, 'cancelText': '取消'});
      },
      realDelTarget () {
        let t = this.delname
        axios.get(`${this.baseurl}/targetinfo/del?target=${t}`)
          .then(res => {
            // console.log(res.data.status);
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${t} 删除成功`, 'success')
            } else {
              util.notice(this, `${t} 删除失败`, 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      addTarget (info) {
        axios.post(`${this.baseurl}/targetinfo/add`, info)
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
          axios.get(`${this.baseurl}/host/kill?ip=${params.row['ip']}`)
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
          this.$Message.info('ip不存在，不能关闭连接')
        }    
      },
      createConn (params) {
        if (params.row['ip']) {
          params.row['is_conn'] = 3
          axios.get(`${this.baseurl}/host/conn?ip=${params.row['ip']}`)
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
          this.$Message.info('ip不存在，不能建立连接')
        }
      },
      reflashTmpl() {
        // axios.get(`${this.baseurl}/targetinfo/get?filter=tmpl_${this.$route.name}`)
        axios.get(`${this.baseurl}/config?key=tmpl_${this.$route.name}`)
          .then(res => {
            delete res.data['data']['name']
            this.formItemOrigin = util.dict2arry(res.data['data'], 'key', 'comment', this.itemSort)
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
