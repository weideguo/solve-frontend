<template>
  <div>
    <Col span="24">
      <Card>
        <div slot="title">
          <!--Icon type="md-people"></Icon>
          <b>用户列表</b-->
          <Button type="info" icon="md-add" shape="circle" size="small" @click="addUser"></Button>
        </div>
        
        <div>
          <Table border :columns="usercolumns" :data="userdata" stripe height="700"></Table>
        </div>
        <br>
        <Page :total="pagenumber" @on-change="splicpage" :page-size="pagezie" ref="total" :current="currentPage" show-elevator show-total></Page>
      </Card>
    </Col>

    <Modal v-model="editModal" :mask-closable=false :width="500">
      <p slot="header">
        <b>{{modelTitle}}</b>
      </p>
      <Form ref="editForm" :model="editForm" :label-width="100" label-position="right" :rules="editValidate">
        <FormItem label="用户名" prop="username">
          <Input v-model="editForm.username" placeholder="请输入用户名" :readonly="!notEdit" :clearable="notEdit"></Input>
        </FormItem>
        <FormItem label="新密码" prop="pass">
          <Input v-model="editForm.pass" placeholder="请输入新密码，至少6位字符" type="password" clearable></Input>
        </FormItem>
        <FormItem label="确认新密码" prop="rePass">
          <Input v-model="editForm.rePass" placeholder="请再次输入新密码" type="password" clearable></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelEdit">取消</Button>
        <Button type="primary" @click="commit" :loading="saveLoading">保存</Button>
      </div>
    </Modal>

    <Modal v-model="deluserModal" :mask-closable=false :width="500">
      <p slot="header">
        <b>删除用户</b>
      </p>
      <Form :label-width="100" label-position="right">
        <FormItem label="用户名">
          <Input v-model="username" readonly="readonly"></Input>
        </FormItem>
        <FormItem label="请输入用户名">
          <Input v-model="confirmuser" placeholder="请确认用户名"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelDelUser">取消</Button>
        <Button type="error" @click="delUser">删除</Button>
      </div>
    </Modal>

  </div>
</template>


<script>
  import axios from 'axios'
  import util from '@/libs/util'

  export default {
    data () {
      const valideRePassword = (rule, value, callback) => {
        if (this.editForm.pass !== this.editForm.rePass) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        currentUser: sessionStorage.getItem('user'),
        // 用户表
        currentPage: 1,
        pagezie: 10,
        pagenumber: 1,
        usercolumns: [
          {
            title: '用户名',
            key: 'username',
            sortable: true
          },
          {
            title: '操作',
            key: 'action',
            width: 400,
            align: 'center',
            render: (h, params) => {
              if (params.row['username'] === this.currentUser) {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.editPass(params.row)
                      }
                    }
                  }, '更改密码')
                ])
              } else {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.editPass(params.row)
                      }
                    }
                  }, '更改密码'),
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.deleteUser(params.row)
                      }
                    }
                  }, '删除')
                ])
              }
            }
          }
        ],
        userdata: [],
        notEdit: true,
        modelTitle: '',
        editModal: false,
        editForm: {
          username: '',
          pass: '',
          rePass: ''
        },
        saveLoading: false,
        editValidate: {
          username: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
          pass: [
            {
              required: true,
              message: '请输入新密码',
              trigger: 'blur'
            },
            {
              min: 6,
              message: '请至少输入6个字符',
              trigger: 'blur'
            },
            {
              max: 32,
              message: '最多输入32个字符',
              trigger: 'blur'
            }
          ],
          rePass: [
            {
              required: true,
              message: '请再次输入新密码',
              trigger: 'blur'
            },
            {
              validator: valideRePassword,
              trigger: 'blur'
            }
          ]
        },
        // 删除用户
        username: '',
        confirmuser: '',
        deluserModal: false
      }
    },
    methods: {
      realAddUser () {
        axios.post(this.baseurl + '/userinfo/', {
            'username': this.editForm.username,
            'password': this.editForm.pass
          })
          .then(res => {
            this.editModal = false
            this.saveLoading = false
            this.refreshuser()
            if (res.data['status'] === 1) {
              util.notice(this, res.data['msg'], 'success')
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
            this.$refs['editForm'].resetFields()
          })
          .catch(error => {
            this.loading = false
            util.notice(this, error, 'error')
          })
      },
      refreshuser (vl = 1) {
        axios.get(`${this.baseurl}/userinfo/?page=${vl}&pagesize=${this.pagezie}`)
          .then(res => {
            this.userdata = res.data['data']
            this.pagenumber = parseInt(res.data['page'])
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      splicpage (page) {
        this.refreshuser(page)
      },
      addUser () {
        this.notEdit = true
        this.editModal = true
        this.modelTitle = '增加用户'
      },
      editPass (params) {
        this.editForm['username'] = params.username
        this.notEdit = false
        this.editModal = true
        this.modelTitle = '修改用户密码'
      },
      cancelEdit () {
        this.$refs['editForm'].resetFields()
        this.editModal = false
      },
      commit () {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            this.$Message.success('开始操作')
            this.saveLoading = true
            if (this.notEdit) {
              this.realAddUser()
            } else {
              this.saveEdit()
            }
          } else {
            this.$Message.error('表单检查失败!')
          }
        })
        
      },
      saveEdit () {
        axios.put(this.baseurl + '/userinfo/changepwd', {
            'username': this.editForm.username,
            'new': this.editForm.pass
          })
          .then(res => {
            util.notice(this, res.data['data'], 'success')
            this.editModal = false
            this.saveLoading = false
            this.$refs['editForm'].resetFields()
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      },
      deleteUser (params) {
        this.deluserModal = true
        this.username = params.username
      },
      delUser () {
        if (this.username === this.confirmuser) {
          this.$Message.success('开始删除')
          axios.delete(this.baseurl + '/userinfo/' + this.username)
            .then(res => {
              util.notice(this, res.data['data'], 'success')
              this.deluserModal = false
              this.confirmuser = ''
              this.currentPage = 1
              this.refreshuser()
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.$Message.error('用户名不一致!请重新操作!')
        }
      },
      cancelDelUser () {
        this.deluserModal = false
        this.confirmuser = ''
      }
    },
    mounted () {
      this.refreshuser()
    }
  }
</script>
