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
    <div style="position: relative;margin-left: 5%;margin-top: 2%;width:90%;font-size:20px">
      <div>
        <pre class="line-numbers"><code class="language-bash">{{content}}</code></pre> 
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
  // import Prism from 'prismjs'
  // import PrismLineNumber from 'prismjs/plugins/line-numbers/prism-line-numbers.js'

  export default {
    name: 'playbook',
    // components: {
    //   Prism
    // },
    data () {
      return {
        title: '',
        playbook: '',
        content: '',
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

            // 不使用import实现在加载数据后再高亮渲染
            // const Prism = require('prismjs')
            require('prismjs')
            // 需要引入对应语言的模块 默认只加载markup, css, clike, javascript, 其他语言需要单独加载
            require('prismjs/components/prism-bash.js')
            // 显示行号
            require('prismjs/plugins/line-numbers/prism-line-numbers.js')
          } else {
            util.notice(this, res.data['msg'], 'error')
          }
        }).catch(error => {
          util.notice(this, error, 'error')
        })
    }
  }
</script>

