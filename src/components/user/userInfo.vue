<template>
  <div>
    <Card>
      <template #title>
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
      <Form ref="editForm" :model="editFormData" :label-width="100" label-position="right" :rules="editValidate">
        <FormItem :label="$t('username')" prop="username">
          <Input v-model="editFormData.username" :placeholder="$t('inputUsernameTips')" :readonly="!notEdit" :clearable="notEdit"></Input>
        </FormItem>
        <FormItem :label="$t('newPassword')" prop="pass">
          <Input v-model="editFormData.pass" :placeholder="$t('inputPasswordTips')" type="password" clearable></Input>
        </FormItem>
        <FormItem :label="$t('confirmNewPassword')" prop="rePass">
          <Input v-model="editFormData.rePass" :placeholder="$t('reInputPasswordTips')" type="password" clearable></Input>
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


<script setup>
  //
  import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import user from '@/api/user'
  import util from '@/libs/util'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const currentUser = ref(sessionStorage.getItem('user'))
  const currentPage = ref(1)
  const pagesize = ref(10)
  const pagenumber = ref(1)
  const usercolumns = ref([
    {
      title: t('username'),
      key: 'username',
      sortable: true,
      minWidth: 400
    },
    {
      title: t('operation'),
      slot: 'operation',
      width: 400,
      align: 'center'
    }
  ])
  const userdata = ref([])
  const notEdit = ref(true)
  const modelTitle = ref('')
  const editModal = ref(false)
  const editFormData = reactive({
    username: '',
    pass: '',
    rePass: ''
  })
  const saveLoading = ref(false)
  
  // 自定义验证规则
  const valideRePassword = (rule, value, callback) => {
    if (editFormData.pass !== editFormData.rePass) {
      callback(new Error(t('passwordNotSame')))
    } else {
      callback()
    }
  }
  
  const editValidate = reactive({
    username: [{
      required: true,
      message: t('inputUsernameTips'),
      trigger: 'blur'
    }],
    pass: [
      {
        required: true,
        message: t('inputPasswordTips'),
        trigger: 'blur'
      },
      {
        min: 6,
        message: t('inputPasswordTips'),
        trigger: 'blur'
      },
      {
        max: 32,
        message: t('max32Chars'),
        trigger: 'blur'
      }
    ],
    rePass: [
      {
        required: true,
        message: t('reInputPasswordTips'),
        trigger: 'blur'
      },
      {
        validator: valideRePassword,
        trigger: 'blur'
      }
    ]
  })
  
  // 删除用户相关
  const username = ref('')
  const confirmuser = ref('')
  const deluserModal = ref(false)
  
  // 表单
  const editForm = ref(null)
  
  const realAddUser = () => {
    user.postUserinfo({'username': editFormData.username, 'password': editFormData.pass})
      .then(res => {
        editModal.value = false
        saveLoading.value = false
        refreshuser()
        if (res.data['status'] === 1) {
          util.notice(proxy, res.data['msg'], 'success')
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
        editForm.value.resetFields()
      })
      .catch(error => {
        saveLoading.value = false
        util.notice(proxy, error, 'error')
      })
  }
  
  const refreshuser = (vl = 1) => {
    user.getUserinfo(vl, pagesize.value)
      .then(res => {
        userdata.value = res.data['data']
        pagenumber.value = parseInt(res.data['page'])
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const splicpage = (page) => {
    refreshuser(page)
  }
  
  const addUser = () => {
    notEdit.value = true
    editModal.value = true
    modelTitle.value = t('addUser')
  }
  
  const editPass = (params) => {
    editFormData.username = params.username
    notEdit.value = false
    editModal.value = true
    modelTitle.value = t('chanePassword')
  }
  
  const cancelEdit = () => {
    editForm.value.resetFields()
    editModal.value = false
  }
  
  const commit = () => {
    editForm.value.validate((valid) => {
      if (valid) {
        proxy.$Message.success(t('commitBegin'))
        saveLoading.value = true
        if (notEdit.value) {
          realAddUser()
        } else {
          saveEdit()
        }
      } else {
        proxy.$Message.error(t('form.checkErr'))
      }
    })
  }
  
  const saveEdit = () => {
    user.putUserinfo({'username': editFormData.username, 'new': editFormData.pass})
      .then(res => {
        if (res.data['status'] === 1) {
          util.notice(proxy, res.data['data'], 'success')
          editModal.value = false
          saveLoading.value = false
          // 重置表单
          editForm.value.resetFields()
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const deleteUser = (params) => {
    deluserModal.value = true
    username.value = params.username
  }
  
  const delUser = () => {
    if (username.value === confirmuser.value) {
      proxy.$Message.success(t('commitBegin'))
      user.deleteUserinfo(username.value)
        .then(res => {
          if (res.data['status'] === 1) {
            util.notice(proxy, res.data['data'], 'success')
            deluserModal.value = false
            confirmuser.value = ''
            currentPage.value = 1
            refreshuser()
          } else {
            util.notice(proxy, res.data['msg'], 'error')
          }
        })
        .catch(error => {
          util.notice(proxy, error, 'error')
        })
    } else {
      proxy.$Message.error(t('usernameNotSame'))
    }
  }
  
  const cancelDelUser = () => {
    deluserModal.value = false
    confirmuser.value = ''
  }
  
  onMounted(() => {
    refreshuser()
  })
</script>
