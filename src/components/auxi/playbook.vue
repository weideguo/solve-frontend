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
      <Switch v-model="isWrap" @on-change="highlightCode()"></Switch>
    </div>
    <div style="position: relative;margin-top: 1%;font-size:20px">
      <div>
        <pre class="line-numbers" :style="{'white-space':isWrap?'pre-wrap':'pre'}"><code class="language-bash">{{content}}</code></pre> 
      </div>
    </div>
  </div>
</template>

<script setup>
//
import { ref, onMounted, nextTick, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/components/prism-bash'
import 'prismjs/plugins/line-numbers/prism-line-numbers'


import util from '@/libs/util'
import file from '@/api/file'

// 响应式数据
const title = ref('')
const playbook = ref('')
const content = ref('')
const isWrap = ref(true)

// 高亮函数
const highlightCode = async () => {
  // nextTick 确保在 DOM 更新后执行
  await nextTick()
  Prism.highlightAll()
}

// 监听内容变化，一旦内容更新就重新高亮
watch(content, () => {
  highlightCode()
})


// 在组件挂载后获取数据
onMounted(async () => {
  const result = util.parseUrlParams(window.location)
  title.value = result['title']
  playbook.value = result['playbook']
  
  try {
    const res = await file.getFileContent(playbook.value)
    if (res.data['status'] > 0) {
      content.value = res.data['content']
      // 数据赋值后，watch 会自动触发 highlightCode
    } else {
      util.notice(this, res.data['msg'], 'error')
    }
  } catch (error) {
    util.notice(this, error, 'error')
  }
})
</script>