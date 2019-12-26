<template>
  <div>
    <Row>
      <Card>
        <div slot="title" style="height: 32px">
          <Tooltip content="修改字段信息">
            <Button type="info" icon="md-list" @click.native="switchFormInfo=true" ></Button>
          </Tooltip>
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()">{{filter}}</Button>
          <div style="float:right;margin-right: 0px">
            <Input v-model="searchWord" @on-search="search()" search enter-button placeholder="* 可用为搜索通配符" style="width: 350px"/>
          </div>
        </div>
        
        <Row>
          <Col span="24">
            <Table border stripe :columns="columns" :data="tableData" size="small" @on-row-dblclick="targetinfoDetail"></Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :page-size="pageSize" :current="currentPage" show-elevator show-total></Page>
      </Card>
    </Row>

    <Modal v-model="openswitch" width="50%">          
      <p slot="header">
        <span>{{modelTitle}}</span>
      </p>
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :dynamic="true" :formvalidate="formItemValidate" @primaryClick="formCommit" @secondClick="optionOperate" :secondCheck="!isAdd" :secondButtonName="isAdd?'取消':'复制'"></safe-form>
      <div slot="footer"></div>
    </Modal>

    <Modal v-model="switchFormInfo" width="50%">          
      <p slot="header">
        <span>{{filter}} 修改字段信息</span>
      </p>
      <safe-form ref="formInfo" :labelwidth="100" :dynamicData="formItemInfo" :dynamic="true" @primaryClick="formInfoCommit" @secondClick="switchFormInfo=false" ></safe-form>
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
      const nameCheck = (rule, value, callback) => {
        // if (value.search('^' + this.$route.name) > -1) {
        //   callback()
        // } else {
        //   callback(new Error('name必须以' + this.$route.name + '开头'))
        // }
        let f = util.validatorGenerator('^'+this.$route.name+'((.*\\S$)|$)')
        f(rule, value, callback)
      }
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        searchWord: '',
        username: sessionStorage.getItem('user'),
        formItem: [],
        constictStr: '',
        formItemValidate: {
          name: [
            {
              required: true,
              message: '请输入执行对象名',
              trigger: 'blur'
            },
            {
              validator: nameCheck,
              trigger: 'blur'
            }
          ]
        },  
        constKeyList: [],
        formDynamic: [],
        formItemInfo: {},
        opentarget: '',
        columns: [
          {
            title: 'name',
            key: 'name',
            width: 400,
            sortable: true
          },
          {
            title: '信息',
            tooltip: true,
            key: 'info'
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return h('div', [
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
                      this.delTarget(params.row['name']);
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
        modelTitle: '',
        openswitch: false,
        switchFormInfo: false,
        isAdd: true
      }
    },
    methods: {
      search (vl = 1) {
        let searchWord = ''
        if (this.searchWord) {
          searchWord = this.searchWord
        } else {
          searchWord = this.$route.name + '*'
        }
        searchWord = encodeURIComponent(searchWord)
        axios.get(`${this.baseurl}/target/get?filter=${searchWord}&page=${vl}&pagesize=${this.pageSize}`)
          .then(res => {
            this.tableData = res.data['data']
            this.tableData.forEach((item) => {
              item.info = JSON.stringify(item);
            })
            this.pageNumber = parseInt(res.data['page'])
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      targetinfoDetail (paramsDict) {
        this.openswitch = true
        this.isAdd = false
        this.modelTitle = this.filter+" 更新信息"
        this.opentarget = paramsDict['name']
        let formItemNew = util.dict2arry(JSON.parse(paramsDict['info']), 'key', 'value', this.itemSort)
        formItemNew.forEach((item, i) => {
          this.formItemOrigin.forEach((item2, i2) => {
            if (item['key'] === item2['key']) {
              item['comment'] = item2['comment']
            }
          })
        })
        formItemNew.forEach((item, i) => {
          item['label'] = item['key']
          
          if (item['key'] === 'const') {
            item['select'] = this.constKeyList
          }
        })
        this.formItem = formItemNew
      },
      targetinfoAdd () {
        this.openswitch = true
        this.isAdd = true
        this.formItem = this.formItemOrigin
        this.modelTitle = this.filter+" 新增信息"
      },
      formCommit (data) {
        if (!this.isAdd) {
          data['name_o'] = this.opentarget        
        }
        this.openswitch = false
        this.addTarget(data)
        // console.log(data)
      },
      optionOperate (data) {
        if (!this.isAdd) {
          console.log('is add')
          if (data['name'] === this.opentarget) {
            this.$Message.error('新增name必须与现有的不同')
          } else {
            this.addTarget(data)
            this.openswitch = false
          }
        } else {
          console.log('is cancel')
          this.openswitch = false
        }
        // console.log(data)
      },
      formInfoCommit (data) {
        this.switchFormInfo = false
        axios.post(`${this.baseurl}/config/?key=tmpl_${this.$route.name}`, data)
          .then(res => {
            if (res.data['status'] >= 1) {
              util.notice(this, '更改成功', 'success')
              this.reflashTmpl()
            } else {
              util.notice(this, `${info['name']} ${res.data['msg']}`, 'warning')
            }
          }).catch(error => {
            util.notice(this, error, 'error')
          })
      },
      getCurrentPage (vl) {
        this.formDynamic = []
        this.filter = this.$route.name;
        if (!vl) {
          vl = sessionStorage.getItem(`${this.filter}_currentpage`)
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem(`${this.filter}_currentpage`, vl)
        this.search(vl)
      },
      delTarget (t) {
        this.delname = t
        this.$Modal.confirm({'title': `确认删除 ${this.delname} ？`,'onOk': this.realDelTarget, 'cancelText': '取消', 'width': '700px'});
      },
      realDelTarget () {
        let t = this.delname
        axios.get(`${this.baseurl}/target/del?target=${t}`)
          .then(res => {
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
        axios.post(`${this.baseurl}/target/`, info)
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
      reflashTmpl () {
        axios.get(`${this.baseurl}/config/?key=tmpl_${this.$route.name}`)
          .then(res => {
            this.formItemInfo = util.dictDeepCopy(res.data['data'])
            this.formItemOrigin = util.dict2arry(res.data['data'], 'key', 'comment', this.itemSort)
            this.formItemOrigin.forEach((item, i) => {
              item['label'] = item['key']
              if (item['key'] === 'const') {
                item['select'] = this.constKeyList
              }
            })
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
        axios.get(`${this.baseurl}/target/info?filter=const*`)
          .then(res => {
            this.constKeyList = res.data['data']
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      }
    },
    watch: {
      '$route': function () {
        this.searchWord = ''
        this.getCurrentPage()
        this.reflashTmpl()
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
