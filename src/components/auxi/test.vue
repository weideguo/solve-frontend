<template>
  <div id="band">
    <div style="position: relative;margin-left: 5%;margin-top: 2%;display:inline-block;width:90%;word-wrap:break-word;white-space:normal;">
      <div>
        <p>
          <span style="font-weight:900;font-size:24px;">
            {{title}} - {{playbook}}
          </span>
        </p>
        
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import util from '@/libs/util'

  export default {
    name: 'test',
    data () {
      return {
        title: 'aaa',
        playbook: 'bbb',
      }
    },
    mounted () {
    },
    created () {
      axios.get("http://192.168.253.128:9000/file/list?path=/tmpx")
        .then(res => {
          this.title=res.data['path']
          console.log(res.data)
        }).catch(error => {
          util.notice(this, error, 'error')
        })
    }
  }
</script>
