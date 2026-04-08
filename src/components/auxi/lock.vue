<style lang="css">
  @import './lock.css';
</style>

<template>
  <div id="band" style="width: 100%;height: 100%;">
    <transition name="show-unlock" >
      <div class="unlock-body-con" @keydown.enter="handleUnlock">
        <div class="unlock-avator-con" @click="handleClickAvator" :style="{marginLeft: avatorLeft}">
          <img class="unlock-avator-img" src="/favicon.ico">
          <div class="unlock-avator-cover">
            <span><Icon type="md-unlock" :size="30"></Icon></span>
            <p>{{currentUser}}</p>
          </div>
        </div>
        <div class="unlock-avator-under-back" :style="{marginLeft: avatorLeft}"></div>
        <div class="unlock-input-con">
          <div class="unlock-input-overflow-con">
            <div class="unlock-overflow-body" :style="{right: inputLeft}">
              <input class="unlock-input" ref="inputEle" v-model="password" type="password" :placeholder="$t('inputPasswordUnlock')"/>
              <button class="unlock-btn"  @click="handleUnlock" >
                <Icon color="white" type="md-key" :size="14"></Icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
  //
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import util from '@/libs/util'
  import login from '@/api/login'
  
  const router = useRouter()
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const avatorLeft = ref('0px')
  const inputLeft = ref('400px')
  const password = ref('')
  const showUnlock = ref(true)
  const currentUser = ref(sessionStorage.getItem('user'))
  const inputEle = ref(null)
  
  const handleClickAvator = () => {
    if (showUnlock.value) {
      avatorLeft.value = '-180px'
      inputLeft.value = '0px'
      inputEle.value.focus()
      showUnlock.value = false
    } else {
      avatorLeft.value = '0px'
      inputLeft.value = '400px'
      showUnlock.value = true
    }
  }
  
  const handleUnlock = () => {
    login.login({'username': sessionStorage.getItem('user'), 'password': password.value})
      .then(res => {
        if (res.data['token']) {
          sessionStorage.setItem('locking', '0')
          router.push({
            name: sessionStorage.getItem('lastPageName')
          })
        } else {
          util.notice(proxy, t('passwordError'), 'warning')
        }
      }).catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  onMounted(() => {
    sessionStorage.setItem('locking', '1')
  })
</script>
