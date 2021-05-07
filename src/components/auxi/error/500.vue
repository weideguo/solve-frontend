<style lang="css">
  @import './500.css';
</style>

<template>
  <div class="error500-body-con">
    <Card>
      <div class="error500-body-con-title">
        5
        <span class="error500-0-span"><Icon type="logo-freebsd-devil"></Icon></span>
        <span class="error500-0-span"><Icon type="logo-freebsd-devil"></Icon></span>
      </div>
      <p class="error500-body-con-message">{{ $t('msg500Tips') }}</p>
      <div class="error500-btn-con">
        <Button @click="goHome" size="large" style="width: 200px;" type="text">{{ $t('backToHome') }}</Button>
        <Button @click="backPage" size="large" style="width: 200px;margin-left: 40px;" type="primary">{{ $t('backToPre') }}</Button>
      </div>
    </Card>
  </div>
</template>

<script>
  // import VueI18n from 'vue-i18n'

  export default {
    name: 'Error500',
    methods: {
      backPage () {
        this.$router.go(-1)
      },
      goHome () {
        this.$router.push({
          name: 'home_index'
        })
      }
    }
  }
</script>
