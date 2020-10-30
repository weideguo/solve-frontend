<template>
  <div id="band">
    <div style="position: relative;margin-left: 5%;margin-top: 2%;display:inline-block;width:90%;word-wrap:break-word;white-space:normal;">
      <div>
        <p>
          <span style="font-weight:900;font-size:24px;">
            {{title}} - {{playbook}} - {{ $t("i.select.placeholder") }}
          </span>
        </p>
        
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import util from '@/libs/util'
  // import VueI18n from 'vue-i18n'
  import request from '@/api/request'

  export default {
    name: 'test',
    data () {
      return {
        title: 'aaa',
        playbook: this.$t("i.select.placeholder"),
      }
    },
    mounted () {
      console.log(this.$t("message.title"))
    },
    created () {
      //axios.get("http://192.168.253.128:8000/api/v1/test/")
      request.get("http://192.168.253.128:8000/api/v1/config/?key=job_typesx")
        .then(res => {
          // this.title=res.data['path']
          console.log(res.data)
        }).catch(error => {
          util.notice(this, error, 'error')
        })
    }
  }
</script>
