<style lang="css">
  @import './lock.css';
</style>

<template>
  <div id="band" style="width: 100%;height: 100%;">
    <transition name="show-unlock" >
      <div class="unlock-body-con" @keydown.enter="handleUnlock">
        <div class="unlock-avator-con" @click="handleClickAvator" :style="{marginLeft: avatorLeft}">
          <img class="unlock-avator-img" src="/static/favicon.ico">
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
//
<script>
  // import axios from 'axios'
  import util from '@/libs/util'
  import login from '@/api/login'
  // import VueI18n from 'vue-i18n'

  export default {
    data () {
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        avatorLeft: '0px',
        inputLeft: '400px',
        password: '',
        showUnlock: true,
        currentUser: sessionStorage.getItem('user')
      }
    },
    methods: {
      handleClickAvator () {
        if (this.showUnlock) {
          this.avatorLeft = '-180px'
          this.inputLeft = '0px'
          this.$refs.inputEle.focus()
          this.showUnlock = false
        } else {
          this.avatorLeft = '0px'
          this.inputLeft = '400px'
          this.showUnlock = true
        }
      },
      handleUnlock () {
        // axios.post(this.baseurl + '/login/', {
        //   'username': sessionStorage.getItem('user'),
        //   'password': this.password
        //   })
        let baseurl=''
        login.login(baseurl, {'username': sessionStorage.getItem('user'),'password': this.password})
          .then(res => {
            if (res.data['token']) {
              this.$store.commit('storeSet', ['jwt', `Bearer ${res.data['token']}`])
              this.$store.commit('sessionSet', ['locking', 0])
              sessionStorage.setItem('locking', '0')
              this.$router.push({
                name: sessionStorage.getItem('lastPageName')
              })
            } else {
              util.notice(this, this.$t('passwordError'), 'warning')
            }
          }).catch(error => {
            util.notice(this, error, 'error')
          })
      }
    },
    mounted () {
      this.$store.commit('storeSet', ['jwt', ''])
      this.$store.commit('sessionSet', ['locking', 1])
      window.particlesJS.load('band', '/static/particlesjs-config.json')
    }
  }
</script>
