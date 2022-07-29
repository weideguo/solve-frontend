<template>
  <div>
    <Row>
      <Card>
        <div slot="title" style="height: 32px">
          <Tooltip :content="$t('modifyFiled')"  placement="bottom-start">
            <Button type="info" icon="md-list" @click.native="switchFormInfo=true" ></Button>
          </Tooltip>
          <Button type="info" icon="md-add" @click.native="targetinfoAdd()">{{filter}}</Button>
          
          <Tooltip :content="$t('showCascade')"  placement="bottom-start">
            <Button type="info" icon="md-more" @click.native="showCascade()" ></Button>
          </Tooltip>

          <div style="float:right;margin-right: 0px">
            <Input v-model="searchWord" @on-search="search()" search enter-button :placeholder="$t('searchTips')" style="width: 350px"/>
          </div>
        </div>
        
        <Row>
          <Col span="24">
            <Table border stripe :columns="columns" :data="tableData" size="small" @on-row-dblclick="targetinfoDetail"></Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" :page-size="pagesize" :current="currentPage" @on-page-size-change="getCurrentPageNew" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
      </Card>
    </Row>

    <Modal v-model="openswitch" width="50%">    
      <div slot="header">   
        <Button v-if="!isAdd" shape="circle" icon="md-list" @click.native="getTreeNode"></Button>
        <p style="display:inline"><span>{{modelTitle}}</span></p>
      </div>
      <safe-form ref="myform" :labelwidth="100" :formdata="formItem" :dynamic="true" :formvalidate="formItemValidate" 
        @primaryClick="formCommit" @secondClick="optionOperate" :primaryButtonName="isAdd? $t('add') : $t('update') "
        :secondCheck="!isAdd" :secondButtonName="isAdd? $t('cancel') : $t('copy') " :inputValueTips="$t('inputFieldValueTips')">
      </safe-form>
      <div slot="footer"></div>
    </Modal>

    <Modal v-model="cascadeSwitch" width="60%"> 
      <div slot="header">   
        <p>
          <span> {{ $t('selectedPath') }}: {{cascadePath}} </span>
        </p>
      </div>
      <div>
        <Tree :data="cascadeTreeData" @on-select-change="showCascadePath" ref="casCadeTree"></Tree>
      </div>
      <div slot="footer"></div>
    </Modal>


    <Modal v-model="treeswitch" width="60%"> 
      <div slot="header">   
        <p>
          <span>{{opentarget}}</span>
          <span style="margin-left:30px;">{{ $t('paramName')  }} {{treeLevel}}</span>
        </p>
      </div>
      <div>
        <div style="background: #DCDCDC">
          <div style="width:100px;display: inline-block">{{ $t('paramLevel')  }}</div>
          <div style="width:100px;display: inline-block; margin-left:400px">{{ $t('paramValue')  }}</div>
        </div>
        <Tree ref="mytree" :data="targetDataTree" :render="renderContent" @on-select-change="showPath" @on-toggle-expand="showChildren" class="demo-tree-render"></Tree>
      </div>
      <div slot="footer"></div>
    </Modal>

    <Modal v-model="switchFormInfo" width="50%">          
      <p slot="header">
        <span>{{filter}} {{ $t('modifyFiled') }}</span>
      </p>
      <safe-form ref="formInfo" :labelwidth="100" :dynamicData="formItemInfo" :dynamic="true" :inputValueTips="$t('inputDescValueTips')"
        @primaryClick="formInfoCommit" @secondClick="switchFormInfo=false" >
      </safe-form>
      <div slot="footer"></div>
    </Modal>

  </div>
</template>

<script>
  //
  // import axios from 'axios'
  import target from '@/api/target'
  import config from '@/api/config'
  import util from '@/libs/util'
  import safeForm from '@/components/common/safeForm.vue'

  export default {
    components: {
      safeForm
    },
    data () {
      const nameCheck = (rule, value, callback) => {
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
              message: this.$t('inputTargetNameTips'),
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
            title: this.$t('info'),
            tooltip: true,
            key: 'info',
            minWidth: 600
          },
          {
            title: this.$t('detail'),
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
                }, this.$t('detail'))
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
                      this.delTarget(params.row['name']);
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
        modelTitle: '',
        openswitch: false,
        treeswitch: false,
        switchFormInfo: false,
        isAdd: true,
        treeLevel: '{{}}',
        targetDataTree: [],
        cascadeTreeData: [],
        cascadeSwitch: false,
        cascadePath: '',
        // deleteConfirm: false,
        // delname: ''
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
        // axios.get(`${this.baseurl}/target/get?filter=${searchWord}&page=${vl}&pagesize=${this.pagesize}`)
        target.getTarget(searchWord,vl,this.pagesize)
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
        this.modelTitle = this.filter+' '+this.$t('updateInfo')
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
        this.modelTitle = this.filter+' '+this.$t('addInfo') 
      },
      showCascade () {
        this.cascadePath = ''
        this.cascadeTreeData = []
        target.getNameList(`${this.$route.name}*`)
          .then(res => {
            this.cascadeTreeData = []
            this.cascadeTreeData.push(util.formateTreeData(res.data['data'], []));
          })
          .catch(error => {
            util.notice(this, error, 'error');
          })
        this.cascadeSwitch = true
      },
      showCascadePath(){
        this.cascadePath = util.getPathOfSelect(this.cascadeTreeData, '_')
        this.cascadePath = this.cascadePath.slice(2)
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
            this.$Message.error(this.$t('nameUniqueTips'))
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
        // axios.post(`${this.baseurl}/config/?key=tmpl_${this.$route.name}`, data)
        config.postKey(`tmpl_${this.$route.name}`,data)
          .then(res => {
            if (res.data['status'] >= 1) {
              util.notice(this, this.$t('modifySuccess'), 'success')
              this.reflashTmpl()
            } else {
              util.notice(this, `${res.data['msg']}`, 'warning')
            }
          }).catch(error => {
            util.notice(this, error, 'error')
          })
      },
      getCurrentPageNew (pagesize) {
        this.pagesize=pagesize
        this.getCurrentPage(1)
      },
      getCurrentPage (vl) {
        this.formDynamic = []
        this.filter = this.$route.name;
        if (!vl) {
          vl = sessionStorage.getItem(`${this.filter}Currentpage`)
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem(`${this.filter}Currentpage`, vl)
        this.search(vl)
      },
      delTarget (t) {
        this.delname = t
        // this.deleteConfirm = true
        this.$Modal.confirm({'title': this.$t('confirmDelete')+` ${this.delname} ？`,'onOk': this.realDelTarget, 'okText':this.$t('delete'), 'cancelText': this.$t('cancel') , 'width': '700px'});
      },
      realDelTarget () {
        // this.deleteConfirm=false
        let t = this.delname

        // axios.get(`${this.baseurl}/target/del?target=${t}`)
        target.delTarget(t.replace(new RegExp("#","g"),"%23"))
          .then(res => {
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
        // axios.post(`${this.baseurl}/target/`, info)
        target.addTarget(info)
          .then(res => {
            if (res.data['status'] >= 1) {
              util.notice(this, `${info['name']} ${res.data['msg']}`, 'success')
              this.getCurrentPage();
            } else {
              if (!info['name']) {
                util.notice(this, `${res.data['msg']}`, 'warning')
              } else {
                util.notice(this, `${info['name']} ${res.data['msg']}`, 'warning')
              }
            }
          }).catch(error => {
            util.notice(this, error, 'error')
          });
      },
      reflashTmpl () {
        // axios.get(`${this.baseurl}/config/?key=tmpl_${this.$route.name}`)
        config.getKey(`tmpl_${this.$route.name}`)
          .then(res => {
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
            this.formItemInfo = util.dictDeepCopy(keyInfo)
            this.formItemOrigin = util.dict2arry(keyInfo, 'key', 'comment', this.itemSort)
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
        // axios.get(`${this.baseurl}/target/info?filter=const*`)
        target.getNameList('const*')
          .then(res => {
            this.constKeyList = res.data['data']
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      showChildren(currentNode){
        currentNode.children=[]
        target.getTreeInfo(currentNode.value) 
          .then(res => {
            this.$set(currentNode, 'children', res.data['data'].sort(util.func_sort('title')))
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      showPath(selectList,selectCurrent){
        // this.treeLevel=this.getParentOfSelect(this.targetDataTree,'.')
        this.treeLevel=util.getPathOfSelect(this.targetDataTree,'.')
        this.treeLevel='{{'+this.treeLevel+'}}'
      },
      getTreeNode() {
        this.treeswitch=true
        this.treeLevel='{{}}'
        this.targetDataTree=[]
        target.getTreeInfo(this.opentarget) 
          .then(res => {
            this.targetDataTree=res.data['data']
            this.targetDataTree=this.targetDataTree.sort(util.func_sort('title'))
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      renderContent (h, { root, node, data }) {
        // 树的渲染函数
        return h('span', {
                            style: {
                             display: 'inline-block',
                             width: '100%'
                            }
                          }, [
                            h('div', {style: {width: '400px',display: 'inline-block',}}, [data.title]),
                            h('span', {style: {color: '#F00'}}, [data.value])
                ]);
      },
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
