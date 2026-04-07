<template>
  <div>
    <Card>
      <template #title>
        <!--Icon type="md-people"></Icon>
        <b>{{ $t('userList') }}</b-->
        <Button type="info" icon="md-add" shape="circle" size="small" @click="addUser"></Button>
      </template>
      
      <div>
        <Table border :columns="usercolumns" :data="userdata" stripe height="700">
          <template #operation="{ row, index }">  
            <Button v-if="row['username'] === currentUser" type="primary" size="small" @click="editPass(row)">{{ $t('chanePassword') }}</Button>
            <div v-else>
              <Button type="primary" style="margin-right: 5px" size="small" @click="editPass(row)">{{ $t('chanePassword') }}</Button>
              <Button type="error" size="small" @click="deleteUser(row)">{{ $t('delete') }}</Button>
            </div>
          </template>
        </Table>
      </div>
      <br>
      <Page :total="pagenumber" @on-change="splicpage" :page-size="pagesize" ref="total" :model-value="currentPage" show-elevator show-total></Page>
    </Card>

    <Modal v-model="editModal" :mask-closable=false :width="500">
      <template #header>
        <p>
          <b>{{modelTitle}}</b>
        </p>
      </template>
      <Form ref="editForm" :model="editForm" :label-width="100" label-position="right" :rules="editValidate">
        <FormItem :label="$t('username')" prop="username">
          <Input v-model="editForm.username" :placeholder="$t('inputUsernameTips')" :readonly="!notEdit" :clearable="notEdit"></Input>
        </FormItem>
        <FormItem :label="$t('newPassword')" prop="pass">
          <Input v-model="editForm.pass" :placeholder="$t('inputPasswordTips')" type="password" clearable></Input>
        </FormItem>
        <FormItem :label="$t('confirmNewPassword')" prop="rePass">
          <Input v-model="editForm.rePass" :placeholder="$t('reInputPasswordTips')" type="password" clearable></Input>
        </FormItem>
      </Form>
      <template #footer>
        <Button type="text" @click="cancelEdit">{{ $t('cancel') }}</Button>
        <Button type="primary" @click="commit" :loading="saveLoading">{{ $t('save') }}</Button>
      </template>
    </Modal>

    <Modal v-model="deluserModal" :mask-closable=false :width="500">
      <template #header>
        <p>
          <b>{{ $t('deleteUser') }}</b>
        </p>
      </template>
      <Form :label-width="100" label-position="right">
        <FormItem :label="$t('username')">
          <Input v-model="username" readonly="readonly"></Input>
        </FormItem>
        <FormItem :label="$t('inputUsernameTips')">
          <Input v-model="confirmuser" :placeholder="$t('confirmUsernameTips')"></Input>
        </FormItem>
      </Form>
      <template #footer>
        <Button type="text" @click="cancelDelUser">{{ $t('cancel') }}</Button>
        <Button type="error" @click="delUser">{{ $t('delete') }}</Button>
      </template>
    </Modal>

  </div>
</template>


<script>
  //
  import user from '@/api/user'
  import util from '@/libs/util'

  export default {
    data () {
      const valideRePassword = (rule, value, callback) => {
        if (this.editForm.pass !== this.editForm.rePass) {
          callback(new Error(this.$t('passwordNotSame')))
        } else {
          callback()
        }
      }
      return {
        currentUser: sessionStorage.getItem('user'),
        // 用户表
        currentPage: 1,
        pagesize: 10,
        pagenumber: 1,
        usercolumns: [
          {
            title: this.$t('username'),
            key: 'username',
            sortable: true,
            minWidth: 400
          },
          {
            title: this.$t('operation'),
            slot: 'operation',
            width: 400,
            align: 'center',
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
            message: this.$t('inputUsernameTips'),
            trigger: 'blur'
          }],
          pass: [
            {
              required: true,
              message: this.$t('inputPasswordTips'),
              trigger: 'blur'
            },
            {
              min: 6,
              message: this.$t('inputPasswordTips'),
              trigger: 'blur'
            },
            {
              max: 32,
              message: this.$t('max32Chars'),
              trigger: 'blur'
            }
          ],
          rePass: [
            {
              required: true,
              message: this.$t('reInputPasswordTips'),
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
        user.postUserinfo({'username': this.editForm.username, 'password': this.editForm.pass})
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
        user.getUserinfo(vl,this.pagesize)
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
        this.modelTitle = this.$t('addUser')
      },
      editPass (params) {
        this.editForm['username'] = params.username
        this.notEdit = false
        this.editModal = true
        this.modelTitle = this.$t('chanePassword')
      },
      cancelEdit () {
        this.$refs['editForm'].resetFields()
        this.editModal = false
      },
      commit () {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            this.$Message.success(this.$t('commitBegin'))
            this.saveLoading = true
            if (this.notEdit) {
              this.realAddUser()
            } else {
              this.saveEdit()
            }
          } else {
            this.$Message.error(this.$t('form.checkErr'))
          }
        })
        
      },
      saveEdit () {
        user.putUserinfo({'username': this.editForm.username,'new': this.editForm.pass})
          .then(res => {
            if (this, res.data['status'] === 1) {
            util.notice(this, res.data['data'], 'success')
              this.editModal = false
              this.saveLoading = false
              this.$refs['editForm'].resetFields()
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
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
          this.$Message.success(this.$t('commitBegin'))
          user.deleteUserinfo(this.username)
            .then(res => {
              if (this, res.data['status'] === 1) {
                util.notice(this, res.data['data'], 'success')
                this.deluserModal = false
                this.confirmuser = ''
                this.currentPage = 1
                this.refreshuser()
              } else {
                util.notice(this, res.data['msg'], 'error')
              }
            })
            .catch(error => {
              util.notice(this, error, 'error')
            })
        } else {
          this.$Message.error(this.$t('usernameNotSame'))
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
