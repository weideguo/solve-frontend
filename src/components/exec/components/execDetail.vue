<template>
  <div>
    <Row>
      <Card>
        <div slot="title">
          <p>{{title}}</p>
          <br><br>
          <!--<Tooltip content="返回" placement="bottom">
            <Button type="primary" shape="circle" icon="md-arrow-round-back" ghost @click.native="$router.go(-1)"></Button>
          </Tooltip>-->
          <Tooltip content="查看playbook" placement="bottom">
            <Button type="primary" shape="circle" icon="md-book" ghost @click.native="playbookDetial()"></Button>
          </Tooltip>
          <Tooltip content="保存" placement="bottom" style="margin-left: 20px">
            <Button type="primary" shape="circle" icon="md-cloud-upload" ghost @click.native="commit()"></Button>
          </Tooltip>
        </div>


        <Form :label-width="100">
          <FormItem label="target_type" required>
              <Input v-model="target_type" disabled></Input> 
          </FormItem>

          <FormItem v-for="(item, i) in formItem" :key="i" :label="item.key" required>
            <Input v-if="item.key === 'target'" v-model="item.value" @click.native="clusterAdd()"></Input>
            <Select v-else-if="item.key === 'tmpl'" v-model="item.value">
              <Option v-for="i in tmplList" :value="i" :key="i">{{ i }}</Option>
            </Select>
            <Input v-else v-model="item.value" clearable></Input>
            
          </FormItem>
          
        </Form>

        <Button type="primary" style="margin-left: 50%" @click.native="commit()">保存</Button>

      </Card>
    </Row>

    <Modal v-model="openswitchAdd" @on-ok="commitinfoAdd" :ok-text="'确定'" width="800"  title="执行对象">
      <Row>
        <Card>
          <div>
          <Tree :data="treeData" show-checkbox ref="mytree"></Tree>
          </div>
        </Card>
      </Row>
    </Modal>



  </div>


</template>

<script>
  // import axios from 'axios'
  import exec from '@/api/exec'
  import target from '@/api/target'
  import util from '@/libs/util'
  
  //
  export default {
    data () {
      return {
        target_type: '',
        // baseurl: this.$store.getters.sessionGet('baseurl'),
        openswitchAdd: false,
        fromData: {},
        formItem: [],
        formItemSort: ['name', 'tmpl', 'target','comment'],
        treeData: [],
        tmplList: [],
        title: '',
        playbook: '',
        name_o: ''
      }
    },
    computed: {
      info: {
        get () {
          let x = util.arry2dict(this.formItem, 'key', 'value')
          x['name'] = 'exec:' + x['name']
          return x 
        },
        set (val) {
        }
      },
      tmpl () {
        return util.arry2dict(this.formItem, 'key', 'value')['tmpl']
      }
    },
    watch: {
      tmpl: {
        handler: function(val,oldval) {
          if (this.info['tmpl'] === '') {
            this.target_type = ''
          } else {
            // axios.get(`${this.baseurl}/executionInfo/get?filter=${this.info['tmpl']}`)
            exec.getExecutionInfo(`${this.info['tmpl']}`)
              .then(res => {
                try {
                  let r = res.data['data'][0]
                  this.target_type = r['target_type']
                  this.playbook = r['playbook']
                } catch (err) {
                  util.notice(this, '获取任务模板信息失败，请检查使用的任务模板！', 'warning')
                }
              })
              .catch(error => {
                util.notice(this, error, 'error')
              }) 
          }
          
        }
      }
    },
    methods: {
      playbookDetial () {
        // 使用新的非tab页面显示playbook
        // console.log(this.info)
        // console.log(this.playbook)
        let name = this.info['name'].split('exec:')[1]
        let path = "/?playbook="+this.playbook+"&title="+name+"#/playbook"
        // console.log(path)
        window.open(path, "_blank", "scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes")
      },
      commit () {
        // this.info = util.arry2dict(this.formItem, 'key', 'value')
        if (util.existSpace(this.info['name'])) {
          this.$Message.error('name左右两端不能存在空格！')
        } else if (this.info['name'] === '') {
          this.$Message.error('name不能为空值！')
        } else if (this.info['target'].indexOf(this.target_type) != 0 && this.info['target'] != '') {
          this.$Message.error('执行对象必须与模板匹配！')
        } else {
          if (this.info['target']) {
            this.info['number'] = this.info['target'].split(',').length
          } else {
            this.info['number'] = 0
          }
          this.$Message.success('开始提交')
          this.info['name_o'] = this.name_o
          console.log(this.info)
          this.addinfo(this.info)
        }
      },
      addinfo (info) {
        try {
          // axios.post(`${this.baseurl}/executionInfo/add`, info)
          exec.postExecutionInfo(info)
            .then(res => {
              if (res.data['status'] >= 1) {
                util.notice(this, `${info['name']} ${res.data['msg']}`, 'success');
              } else {
                util.notice(this, res.data['msg'], 'warning');
              }
            }).catch(error => {
              util.notice(this, error, 'error');
            });
        } catch (err) {
          util.notice(this, err, 'error');
        }
      },
      getCurrentPage () {
        let tag =''
        if (this.$route.query['row']) {
          this.fromData = this.$route.query['row']
          tag = this.$route.query['tag']
          sessionStorage.setItem('exe_data', JSON.stringify(this.$route.query['row']))
          sessionStorage.setItem('exe_data_is_add',this.$route.query['tag'])
        } else {
          this.fromData = JSON.parse(sessionStorage.getItem('exe_data'))
          tag = sessionStorage.getItem('exe_data_is_add')
        }
        try {
          // Object.keys(this.fromData).forEach((item,i) => {
          //     if (item.substring(0,1) === '_') {
          //       delete this.fromData[item]
          //     }
          //   })
          let x = ['_index','_rowKey','number']
            x.forEach((item,i) => {
            delete this.fromData[item]
          })
        } finally {
          this.formItem = util.dict2arry(this.fromData, 'key', 'value', this.formItemSort)
        }
        console.log(tag)
        if (tag === 'add') {
          this.name_o = ''
          this.title = '任务添加'
        } else {
          this.title = '任务修改'
          this.formItem.forEach((item,i) => {
            if (item['key'] === 'name') {
              this.name_o = 'exec:' + item['value']
            }
          })
        }
      },
      clusterAdd () {
        console.log(this.target_type)
        if (this.target_type != '') {
          this.openswitchAdd = !this.openswitchAdd
          let formdata = util.arry2dict(this.formItem, 'key', 'value')
          let selectedItem = (formdata['target']).split(',');
          // axios.get(`${this.baseurl}/target/info?filter=${this.target_type}*`)
          target.getNameList(`${this.target_type}*`)
            .then(res => {
              this.treeData = []
              this.treeData.push(util.formateTreeData(res.data['data'], selectedItem));
            })
            .catch(error => {
              util.notice(this, error, 'error');
            })
        } else {
          this.$Message.error('请先设置模板')
        }
      },
      commitinfoAdd () {
        let checkedleaf = util.getCheckedLeaf(this.treeData);
        this.formItem.forEach((item) => {
          if (item.key === 'target') {
            item.value = checkedleaf.toString();
          }
        });
      },
      reflashTmpl () {
        // axios.get(`${this.baseurl}/executionInfo/info?filter=tmpl*`)
        exec.getNameList('tmpl*')
          .then(res => {
            this.tmplList = res.data['data']
          }).catch(error => {
            util.notice(this, error, 'error');
          })
      }
    },
    mounted () {
      this.getCurrentPage();
    },
    created () {
      this.reflashTmpl()
    }
  }
</script>
