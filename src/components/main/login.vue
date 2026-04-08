<style>
  #band {
    position: fixed;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    right: 0;
    left: 0;
    //background: #000000;
  }

  #login-form {
    position: absolute;
    top: 25%;
    width: 35%;
    height: 40%;
    margin: 0 auto;
    right: 0;
    left: 0;
  }
</style>

<template>
  <div id="band">
    <div style="position: fixed; right:5%; top:5%;width: 100px; height: 100px;">
      <Dropdown transfer @on-click="languageSet">
        <a href="javascript:void(0)">
            LANGUAGE
            <Icon type="ios-arrow-down"></Icon>
        </a>
        <template #list>
          <DropdownMenu>
            <DropdownItem v-for="item in languageList" :name="item.name" :key="item.name">{{ item.value }}</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>

    </div>
    <div id="login-form">
      <Card>
        <Tabs ref="formX" >
          <!--TabPane label="简单命令分发系统" name="simple"-->
          <TabPane :label="title" name="simple">
          
            <Form ref="formLogin" :model="formInline" :rules="ruleInline" inline>
              <FormItem prop="user" style="width: 100%">
                <Input v-model="formInline.user" placeholder="username" clearable></Input>
              </FormItem>
              <FormItem prop="password" style="width: 100%">
                <Input type="password" v-model="formInline.password" placeholder="password" password clearable></Input>
              </FormItem>
              
              <FormItem prop="baseurl" style="width: 100%">
                <Select v-model="formInline.baseurl" placeholder="project & baseurl" clearable :transfer="true">
                  <Option v-for="i in baseurlConfig" :value="JSON.stringify(i)" :key="i[0]">
                    {{ i[0] }} ---- {{ i[1] }}
                  </Option>
                </Select>
              </FormItem>
              
              <FormItem style="width: 100%">
                <Button type="primary" @click="authdata()" style="width: 100%" size="large">{{ $t('login') }}</Button>
              </FormItem>
            </Form> 
          
          </TabPane>
          <!--TabPane v-if="false" label="简单命令分发系统-cas" name="cas"-->
          <TabPane v-if="true" :label="titleCAS" name="cas">
            <br/><br/><br/>
            <Form ref="formLoginCAS" :model="formInline" :rules="ruleCAS" inline>
              <FormItem prop="baseurl" style="width: 100%">
                <Select v-model="formInline.baseurl" placeholder="project & baseurl" clearable :transfer="true">
                  <Option v-for="i in baseurlConfig" :value="JSON.stringify(i)" :key="i[0]">
                    {{ i[0] }} ---- {{ i[1] }}
                  </Option>
                </Select>
              </FormItem>

              <FormItem style="width: 100%">
                <Button type="primary" @click="authCAS()" style="width: 100%" size="large">{{ $t('login') }}</Button>
              </FormItem>
            </Form>
          </TabPane>
        </Tabs>


        <p style="margin-left: 25%;">
          2018-2026 © Powerd By <a href="/about">wdg</a> {{ $t('loginTips') }}
        </p>

      </Card>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import login from '@/api/login'
  import util from '@/libs/util'
  import config from '@/config/config'
  
  // 初始化 Hooks
  const route = useRoute()
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  // 响应式数据
  const title = ref(t('title'))
  const titleCAS = ref(t('title') + '-cas')
  const languageList = ref([])
  const baseurlConfig = ref([[]])
  const service = ref('')
  const project = ref('')
  const baseurl = ref('')
  
  // 表单数据
  const formInline = reactive({
    user: '',
    password: '',
    baseurl: JSON.stringify(config.baseurl[0])
  })
  
  // 表单验证规则
  const ruleInline = reactive({
    user: [{
      required: true,
      message: t('form.userEmpty'),
      trigger: 'blur'
    }],
    password: [{
      required: true,
      message: t('form.passwordEmpty'),
      trigger: 'blur'
    },
    {
      type: 'string',
      min: 6,
      message: t('form.passwordTooShort'),
      trigger: 'blur'
    }
    ],
    baseurl: [{
      type: 'string',
      required: true,
      message: t('form.projectEmpty'),
      trigger: 'blur'
    }],
  })
  
  const ruleCAS = reactive({
    baseurl: [{
      type: 'string',
      required: true,
      message: t('form.projectEmpty'),
      trigger: 'blur'
    }],
  })
  
  
  const ticket = util.parseUrlParams(window.location)['ticket']
  
  // 方法
  const languageSet = (lang) => {
    console.log(lang)
    localStorage.setItem('language', lang)
    window.location = '/'
  }
  
  // 定义表单引用
  const formX = ref(null)
  const formLogin = ref(null)
  const formLoginCAS = ref(null)
  
  // 重新定义 authdata 以使用 formLogin ref
  const authdata = () => {
    formLogin.value.validate((valid) => {
      if (valid) {
        let projectVal = JSON.parse(formInline.baseurl)[0]
        let baseurlVal = JSON.parse(formInline.baseurl)[1]
        sessionStorage.setItem('baseurl', baseurlVal)
        sessionStorage.setItem('project', projectVal)
        
        login.login({ 'username': formInline.user, 'password': formInline.password })
          .then(res => {
            if (res.data['token']) {
              sessionStorage.setItem('jwt', `Bearer ${res.data['token']}`)
              sessionStorage.setItem('hasLogin', 1)
              sessionStorage.setItem('user', formInline.user)
              sessionStorage.setItem('loginTimestamp', (new Date().getTime()) / 1000)
              window.location = '/'
            } else {
              util.notice(proxy, res.data['msg'], 'warning')
            }
          })
          .catch(error => {
            util.notice(proxy, error, 'error')
          })
      } else {
        proxy.$Message.error(t('form.checkErr')) 
      }
    })
  }
  
  // CAS 相关方法
  const loginCAS = () => {
    project.value = JSON.parse(formInline.baseurl)[0]
    baseurl.value = JSON.parse(formInline.baseurl)[1]
    sessionStorage.setItem('project', project.value)
    sessionStorage.setItem('baseurl', baseurl.value)
    localStorage.setItem('project', project.value)
    localStorage.setItem('baseurl', baseurl.value)
    
    login.loginCAS(service.value)
      .then(res => {
        if (res.data['status'] === 1) {
          window.location = res.data['cas_login_url']
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const vertify = () => {
    sessionStorage.setItem('baseurl', baseurl.value)
    sessionStorage.setItem('project', project.value)
    
    login.casServiceValidate(ticket, service.value)
      .then(res => {
        if (res.data['token']) {
          sessionStorage.setItem('jwt', `Bearer ${res.data['token']}`)
          sessionStorage.setItem('hasLogin', 1)
          sessionStorage.setItem('user', res.data['user'])
          sessionStorage.setItem('loginTimestamp', (new Date().getTime()) / 1000)
          sessionStorage.setItem('cas', 1)
          window.location = '/'
        } else {
          util.notice(proxy, res.data['msg'], 'warning')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const authCAS = () => {
    formLoginCAS.value.validate((valid) => {
      if (valid) {
        loginCAS()
      }
    })
  }
  
  const logout = () => {
    login.logout(service.value)
      .then(res => {
        if (res.data['status'] === 1) {
          window.location = res.data['cas_logout_url']
        }
        sessionStorage.clear()
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  
  onMounted(() => {
    document.onkeydown = (e) => {
      if(e.keyCode == 13 && route.name === 'login') {
          // if(proxy.$refs['formX'].activeKey === 'simple'){
          if(formX.value.activeKey === 'simple'){
            authdata()
          } else if (formX.value.activeKey === 'cas') {
            authCAS()
          }
      }
    }
  
    if (window.location.search.length === 0) {
      service.value = window.location.href
      service.value = service.value.replace('#', '%23')
      
      if (sessionStorage.getItem('jwt')) {
        baseurl.value = localStorage.getItem('baseurl')
        if (sessionStorage.getItem('cas')) {
          logout()
        } else {
          sessionStorage.clear()
        }
      }
      localStorage.setItem('loginUrl', service.value)
      localStorage.removeItem('project')
      localStorage.removeItem('baseurl')
    } else {
      service.value = localStorage.getItem('loginUrl')
      service.value = service.value.replace('#', '%23')
      project.value = localStorage.getItem('project')
      baseurl.value = localStorage.getItem('baseurl')
      
      if (ticket) {
        vertify()
      }
    }
  })
  
  // created 钩子逻辑直接执行
  baseurlConfig.value = config.baseurl
  languageList.value = JSON.parse(sessionStorage.getItem('languageList'))
</script>
