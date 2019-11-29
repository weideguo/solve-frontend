<template>
  <div id="band" style="width:100%;">
    <p ><span style="font-weight: 900;font-size: 36px">will jump to 
      <a :href="full_cas_url"> cas </a></span>
    </p>
    <p>{{full_cas_url}}</p>
    <p>{{ticket}}</p>
    <br/><br/>
    <Button @click.native="vertify()">vertify ticket</Button>
    <br/><br/>
    <Button @click.native="logout()">logout</Button>
    </p>
    <br/><br/>
    <p ><span style="font-weight: 900;font-size: 36px">
      <a :href="logout_url"> logout </a></span>
    </p>
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
        // cas_url: "http://192.168.59.132:9095/cas/login?service=http://192.168.59.132:8080/#/about",
        cas_url: "http://192.168.59.132:9095/cas/login",
        current_href: window.location.href
      }
    },
    computed: {
      full_cas_url () {
        return this.cas_url+"?service="+this.current_href
      },
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
      vertify () {
        axios.get(`${this.baseurl}/cas/serviceValidate?ticket=${this.ticket}`)
          .then(res => {
            // util.notice(this, res.data, 'info');
            console.log(res.data)
          })
          .catch(error => {
            // util.notice(this, error, 'error');
            console.log(error)
          });
      },
      logout () {
        axios.get(`${this.baseurl}/logout/`)
          .then(res => {
            // util.notice(this, res.data, 'info');
            console.log(res.data)
          })
          .catch(error => {
            // util.notice(this, error, 'error');
            console.log(error)
          });
      }
    },
    mounted () {
      // window.location.href= this.cas_url
    }
  }
</script>