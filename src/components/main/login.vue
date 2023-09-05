<style>
  #band {
    position: fixed;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    right: 0;
    left: 0;
    background: #000000;
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
        <DropdownMenu slot="list" >
            <DropdownItem v-for="item in languageList" :name="item.name" :key="item.name">{{ item.value }}</DropdownItem>
        </DropdownMenu>
      </Dropdown>

    </div>
    <div id="login-form">
      <Card>
        <!--
        <div style='margin-left: 30%'>
        <img src="/static/favicon.ico" style="max-width:50%">
        <br>
        </div>-->
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
          2018-2023 © Powerd By <a href="/about">wdg</a> {{ $t('loginTips') }}
        </p>

      </Card>
    </div>
  </div>
</template>

<script>
  // import axios from 'axios'
  import login from '@/api/login'
  import util from '@/libs/util'
  import config from '@/config/config'
  // import VueI18n from 'vue-i18n'
  //
  export default {
    name: 'login',
    data () {
      return {
        title: this.$t('title'),
        titleCAS: this.$t('title')+'-cas',
        languageList: [],
        baseurlConfig: [[]],
        formInline: {
          user: '',
          password: '',
          baseurl: JSON.stringify(config.baseurl[0])
        },
        ruleInline: {
          user: [{
            required: true,
            message: this.$t('form.userEmpty'),
            trigger: 'blur'
          }],
          password: [{
            required: true,
            message: this.$t('form.passwordEmpty'),
            trigger: 'blur'
          },
          {
            type: 'string',
            min: 6,
            message: this.$t('form.passwordTooShort'),
            trigger: 'blur'
          }
          ],
          baseurl: [{
            type: 'string',
            required: true,
            message: this.$t('form.projectEmpty'),
            trigger: 'blur'
          }],
        },
        ruleCAS: {
          baseurl: [{
            type: 'string',
            required: true,
            message: this.$t('form.projectEmpty'),
            trigger: 'blur'
          }],
        }
      }
    },
    computed: {
      ticket () {
        // let result=this.parseUrlParams()
        let result=util.parseUrlParams(window.location)
        return result["ticket"]
      },
    },
    methods: {
      languageSet(lang) {
        console.log(lang)
        localStorage.setItem('language',lang)
        window.location = '/'
      },
      authdata () {
        this.$refs['formLogin'].validate((valid) => {
          if (valid) {
            let project = JSON.parse(this.formInline.baseurl)[0]
            let baseurl = JSON.parse(this.formInline.baseurl)[1]
            // axios.post(baseurl + '/login/', {
            //     'username': this.formInline.user,
            //     'password': this.formInline.password
            //   })
            login.login(baseurl, {'username': this.formInline.user, 'password': this.formInline.password})
              .then(res => {
                if (res.data['token']) {
                  this.$store.commit('sessionSet', ['jwt', `JWT ${res.data['token']}`])
                  // this.$store.commit('storeSet', ['jwt', `JWT ${res.data['token']}`])    // 用state存储右击刷新会清空 所以不用
                  this.$store.commit('sessionSet', ['baseurl', baseurl])
                  this.$store.commit('sessionSet', ['project', project])
                  this.$store.commit('sessionSet', ['hasLogin', 1])
                  this.$store.commit('sessionSet', ['user', this.formInline.user])
                  this.$store.commit('sessionSet', ['loginTimestamp', (new Date().getTime()) / 1000])
                  // this.$router.push({
                  //   name: 'home_index'
                  // })
                  // 使用push可能导致session未设置前已经加载下一个页面 故而不用
                  window.location = '/'
                } else {
                  util.notice(this, res.data['msg'], 'warning')
                }
              })
              .catch(error => {
                util.notice(this, error, 'error')
              })                
          } else {
            this.$Message.error(this.$t('form.checkErr'))
          }
        })
      },
      // 以下是CAS使用
      login () {
        this.project = JSON.parse(this.formInline.baseurl)[0]
        this.baseurl = JSON.parse(this.formInline.baseurl)[1]
        localStorage.setItem('project',this.project)
        localStorage.setItem('baseurl',this.baseurl)
        // axios.get(`${this.baseurl}/cas/login?service=${this.service}`)
        login.loginCAS(this.baseurl,this.service)
          .then(res => {
            if (res.data['status'] === 1) {
              window.location = res.data['cas_login_url']
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
          })
          .catch(error => {
            // console.log(error)
            util.notice(this, error, 'error')
          })
      },
      vertify () {
        // axios.get(`${this.baseurl}/cas/serviceValidate?ticket=${this.ticket}&service=${this.service}`)
        login.casServiceValidate(this.baseurl,this.ticket,this.service)
          .then(res => {
            // this.jwt = 'JWT '+res.data['token']
            if (res.data['token']) {
              this.$store.commit('sessionSet', ['jwt', `JWT ${res.data['token']}`])
              this.$store.commit('sessionSet', ['baseurl', this.baseurl])
              this.$store.commit('sessionSet', ['project', this.project])
              this.$store.commit('sessionSet', ['hasLogin', 1])
              this.$store.commit('sessionSet', ['user', res.data['user']])
              this.$store.commit('sessionSet', ['loginTimestamp', (new Date().getTime()) / 1000])
              this.$store.commit('sessionSet', ['cas', 1])
              // 使用push会导致url携带ticket,故而不用
              window.location = '/'
            } else {
              util.notice(this, res.data['msg'], 'warning')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error');
            // console.log(error)
          });
      },
      authCAS () {
        this.$refs['formLoginCAS'].validate((valid) => {
          if (valid) {
            this.login()
          }
        })
      },
      logout () {
        // axios.defaults.headers.common['Authorization'] = this.$store.getters.sessionGet('jwt')
        // axios.get(`${this.baseurl}/logout/?service=${this.service}`)
        login.logout(this.baseurl, this.service)
          .then(res => {
            // util.notice(this, res.data, 'info');
            // console.log(res.data)
            if (res.data['status'] === 1) {
              window.location = res.data['cas_logout_url'] 
            }
            sessionStorage.clear()
          })
          .catch(error => {
            util.notice(this, error, 'error');
            // console.log(error)
          });
      },
    },
    mounted () {
      window.particlesJS.load('band', '/static/particlesjs-config.json')
      document.onkeydown = (e) => {
        if(e.keyCode == 13 && this.$route.name === 'login') {
            if(this.$refs['formX'].activeKey === 'simple'){
              this.authdata()
            } else if (this.$refs['formX'].activeKey === 'cas') {
              this.authCAS()
            }
        }
      }
      if ( window.location.search.length === 0 ) {
        this.service = window.location.href
        this.service = this.service.replace('#','%23')
        if (this.$store.getters.sessionGet('jwt')) {
          this.baseurl = localStorage.getItem('baseurl')
          if (this.$store.getters.sessionGet('cas')) {
            // 因为异步 所有后面也可以被执行？
            this.logout()
          } else{
            sessionStorage.clear()
          }
        }
        localStorage.setItem('loginUrl',this.service)
        localStorage.removeItem('project')
        localStorage.removeItem('baseurl')
      } else {
        this.service = localStorage.getItem('loginUrl')
        this.service = this.service.replace('#','%23')
        this.project = localStorage.getItem('project')
        this.baseurl = localStorage.getItem('baseurl')
        if (this.ticket) {
          this.vertify()
        }
      }
    },
    created () {
      this.baseurlConfig = config.baseurl
      this.languageList = JSON.parse(sessionStorage.getItem('languageList'))
    }
  }
</script>
