<template>
  <div id="band" style="width:100%">
    <div style="margin-left: 50px">
      <br/><br/>
      <p><span style="font-size: 50px">CAS使用测试</span></p>
      
      <br/><br/>
      <p>ticket: {{ticket}}</p>

      <br/><br/>
      <Button @click.native="verify_as_proxy()">verify as proxy</Button>
      <span>跟vertify ticket类似，但增加回调地址以获取pgtId。可以由pgtId获取proxyTicket，由proxyTicket可以让其他服务验证这个服务的登陆状态。</span>
      <br/><br/>
      <hr/>
      
      <br/><br/>
      <Button @click.native="login()">login</Button>
      <span>访问后端获取cas的登陆地址。然后前端重定向到cas的地址。cas登陆后重新返回前端页面(由url中的指定返回页面)，cas登陆状态由cas的cookie/session机制保持。</span>

      <br/><br/>
      <Button @click.native="verify()">vertify ticket</Button>
      <span>连接后端验证cas登陆后传过来的ticket，后端验证通过后返回jwt。在jwt有效期内前后端通过jwt维持登陆信息，不必再通过cas验证。</span>

      <br/><br/>
      <Button @click.native="logout()">logout</Button>
      <span>登出。连接后端清空jwt，获取cas的登出地址。然后前端重定向至cas的地址。cas清空登陆状态后重定向至前端页面。</span>

      <br/><br/>
      <Button @click.native="test()">test</Button>
      <span>测试使用jwt连接后端</span>


    </div>
  </div>
</template>

<script>
  import util from '@/libs/util'
  import axios from 'axios'
  // 
  export default {
    name: 'version',
    data () {
      return {
        // 后端api只能由登陆页面的表单选择
        // 登陆页面(选择api并确定) -> cas -> 登陆页面 ->首页
        baseurl: 'http://192.168.59.132:8000/api/v1',
        jwt: '',
        service: ''
      }
    },
    computed: {
      ticket () {
        let result=this.parseUrlParams()
        return result["ticket"]
      },
      logout_url () {
        return this.baseurl+"/logout/"
      }
    },
    methods: {
      parseUrlParams() {
        if (window.location.search.length <= 0) return false;
        let info = window.location.search.slice(1)
        let result = {}
        info.split('&').forEach((item,i) => {
          result[decodeURIComponent(item.split('=')[0])] = decodeURIComponent(item.split('=')[1])
        })
        return result
      },
      login () {
        axios.get(`${this.baseurl}/cas/login?service=${this.service}`)
          .then(res => {
            console.log(`${this.baseurl}/cas/login?service=${this.service}`)
            if (res.data['status'] === 1) {
              window.location = res.data['cas_login_url']
            }
          })
          .catch(error => {
            console.log(error)
          })
      },
      verify () {
        axios.get(`${this.baseurl}/cas/serviceValidate?ticket=${this.ticket}&service=${this.service}`)
          .then(res => {
            this.jwt = 'JWT '+res.data['token']
          })
          .catch(error => {
            // util.notice(this, error, 'error');
            console.log(error)
          });
      },
      logout () {
        axios.defaults.headers.common['Authorization'] = this.jwt
        axios.get(`${this.baseurl}/logout/?service=${this.service}`)
          .then(res => {
            // util.notice(this, res.data, 'info');
            console.log(res.data)
            if (res.data['status'] === 1) {
              window.location = res.data['cas_logout_url'] 
            }
          })
          .catch(error => {
            // util.notice(this, error, 'error');
            console.log(error)
          });
      },

      verify_as_proxy () {
        let pgtUrl='https://192.168.59.132:9000/api/v1/cas/callback'
        axios.get(`${this.baseurl}/cas/serviceValidate?ticket=${this.ticket}&service=${this.service}&pgtUrl=${pgtUrl}`)
          .then(res => {
            this.jwt = 'JWT '+res.data['token']
            console.log(res.data)
          })
          .catch(error => {
            // util.notice(this, error, 'error');
            console.log(error)
          });
      },
      test () {
        axios.defaults.headers.common['Authorization'] = this.jwt 
        axios.get(`${this.baseurl}/test/`)
          .then(res => {
            console.log(res.data)
          })
          .catch(error => {
            console.log(error)
          });
      }
    },
    mounted () {
      // window.location.href= this.cas_url
      if ( window.location.search.length === 0 ) {
        this.service = window.location.href
        localStorage.setItem('login_url',this.service)
      } else {
        this.service=localStorage.getItem('login_url')
      }
      // 原始#后面的字符不会传输到后端
      this.service=this.service.replace('#','%23')
    }
  }
</script>