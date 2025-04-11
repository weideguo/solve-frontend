<style>
  #id {
    position: relative;
    width: 100%;
  }

  #login-form {
    position: absolute;
    left: 33%;
    top: 15%;
    width: 35%;
    height: 40%

  }
</style>

<template>
  <div id="band">
    <div id="login-form">
      <Card>
        <div style='margin-left: 30%'>
        <img src="/favicon.ico" style="max-width:50%">
        <br>
      </div>
        <Tabs>
          <TabPane label="简单命令分发系统" name="custom">
          
            <Form ref="formLogin" :model="formInline" :rules="ruleInline" inline>
              <FormItem prop="user" style="width: 100%">
                <Input v-model="formInline.user" placeholder="username" clearable></Input>
              </FormItem>
              <FormItem prop="password" style="width: 100%">
                <Input type="password" v-model="formInline.password" placeholder="password" clearable></Input>
              </FormItem>
              
              <FormItem prop="baseurl" style="width: 100%">
                <Select v-model="formInline.baseurl" placeholder="project & baseurl" clearable :transfer="true">
                  <Option v-for="i in baseurlConfig" :value="JSON.stringify(i)" :key="i[0]">
                    {{ i[0] }} ---- {{ i[1] }}
                  </Option>
                </Select>
              </FormItem>
              
              <FormItem style="width: 100%">
                <Button type="primary" @click="authdata()" style="width: 100%" size="large">登录</Button>
              </FormItem>
            </Form> 
        
        </TabPane>
        </Tabs>


        <p style="margin-left: 25%;">
          2019 © Powerd By <a href="/#/about">wdg</a> 使用chrome获得最佳体验
        </p>

      </Card>
    </div>
  </div>
</template>

<script>
  // import axios from 'axios'
  import util from '@/libs/util'
  import config from '@/config/config'
  //
  export default {
    name: 'login',
    data () {
      return {
        baseurlConfig: [[]],
        formInline: {
          user: '',
          password: '',
          baseurl: JSON.stringify(config.baseurl[0])
        },
        ruleInline: {
          user: [{
            required: true,
            message: '请填写用户名',
            trigger: 'blur'
          }],
          password: [{
            required: true,
            message: '请填写密码',
            trigger: 'blur'
          },
          {
            type: 'string',
            min: 6,
            message: '密码长度不能小于6位',
            trigger: 'blur'
          }
          ],
          baseurl: [{
            type: 'string',
            required: true,
            message: '请选择项目',
            trigger: 'blur'
          }],
        }
      }
    },
    methods: {
      authdata () {
        this.$refs['formLogin'].validate((valid) => {
          if (valid) {
            let project = JSON.parse(this.formInline.baseurl)[0]
            let baseurl = JSON.parse(this.formInline.baseurl)[1]
            // axios.post(baseurl + '/api-token-auth/', {
            //     'username': this.formInline.user,
            //     'password': this.formInline.password
            //   })
            login.login(baseurl, {'username': this.formInline.user, 'password': this.formInline.password})
              .then(res => {
                if (res.data['token']) {
                  this.$store.commit('sessionSet', ['jwt', `Bearer ${res.data['token']}`])
                  // this.$store.commit('storeSet', ['jwt', `JWT ${res.data['token']}`])    // 用state存储右击刷新会清空 所以不用
                  this.$store.commit('sessionSet', ['baseurl', baseurl])
                  this.$store.commit('sessionSet', ['project', project])
                  this.$store.commit('sessionSet', ['hasLogin', 1])
                  this.$store.commit('sessionSet', ['user', this.formInline.user])
                  this.$store.commit('sessionSet', ['loginTimestamp', (new Date().getTime()) / 1000])
                  this.$router.push({
                    name: 'home_index'
                  })
                } else {
                  util.notice(this, res.data['msg'], 'warning')
                }
              })
              .catch(error => {
                util.notice(this, error, 'error')
              })                
          } else {
            this.$Message.error('表单检查失败')
          }
        })
      }
    },
    mounted () {
      window.particlesJS.load('band', '/particlesjs-config.json')
      sessionStorage.clear()
      document.onkeydown = (e) => {
        if(e.keyCode == 13 && this.$route.name === 'login') {
            this.authdata()
        }
      }
    },
    created () {
      this.baseurlConfig = config.baseurl
    }
  }
</script>
