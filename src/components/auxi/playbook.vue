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
    <div style="margin-left: 5%;margin-top: 1%;">
      <i-switch v-model="isWrap" @on-change="reHighlight()" />
    </div>
    <div style="position: relative;margin-top: 1%;font-size:20px">
      <div>
        <pre class="line-numbers" :style="{'white-space':isWrap?'pre-wrap':'pre'}"><code class="language-bash">{{content}}</code></pre> 
      </div>
    </div>
  </div>
</template>

<script>
  import util from '@/libs/util'
  import file from '@/api/file'
  
  import 'prismjs/themes/prism-tomorrow.css'
  import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

  // 加载后立即渲染 数据之后才获取 因此导出出错 不用该方法引入
  import Prism from 'prismjs'
  import PrismBash from 'prismjs/components/prism-bash.js'
  import PrismLineNumber from 'prismjs/plugins/line-numbers/prism-line-numbers.js'

  export default {
    name: 'playbook',
    //components: {
    //  Prism
    //},
    data () {
      return {
        title: '',
        playbook: '',
        content: '',
        isWrap: true,
      }
    },
    methods: {
      reHighlight() {
        //this.isWrap = ! this.isWrap
        setTimeout(function() {
          Prism.highlightAll()
        }, 10)
      }
    },
    mounted () {
    },
    created () {
      //loadLanguages(['shell'])
      let result = util.parseUrlParams(window.location)
      this.title = result['title']
      this.playbook = result['playbook']
      file.getFileContent(this.playbook)
        .then(res => {
          if (res.data['status'] > 0) {
            // console.log(res.data)
            this.content = res.data['content']
            setTimeout(function() {
              // 必须延迟以确保css先加载
              Prism.highlightAll()
            }, 10)
          } else {
            util.notice(this, res.data['msg'], 'error')
          }
        }).catch(error => {
          util.notice(this, error, 'error')
        })
    }
  }
</script>

