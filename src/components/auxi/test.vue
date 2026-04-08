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

<script setup>
  import { ref, onMounted, onBeforeMount, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import util from '@/libs/util'
  import request from '@/api/request'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const title = ref('aaa')
  const playbook = ref(t("i.select.placeholder"))
  
  onBeforeMount(() => {
    request.get("http://192.168.85.128:8000/api/v1/config/?key=job_type")
      .then(res => {
        console.log(res.data)
      }).catch(error => {
        util.notice(proxy, error, 'error')
      })
  })
  
  onMounted(() => {
    console.log(t("message.title"))
  })
</script>
