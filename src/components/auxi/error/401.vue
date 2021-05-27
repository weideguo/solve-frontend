<style lang="css">
  @import './401.css';
</style>

<template>
  <div class="error401-body-con">
    <Card>
      <div class="error401-body-con-title">4
        <span class="error401-0-span"><Icon type="md-lock"></Icon></span>
        1
      </div>
      <p class="error401-body-con-message">{{ $t('msg401Tips') }}</p>
      <div class="error401-btn-con">
        <Button @click="goHome" size="large" style="width: 200px;" type="text">{{ $t('backToHome') }}</Button>
        <Button @click="backPage" size="large" style="width: 200px;margin-left: 40px;" type="primary">{{ $t('backToPre') }}</Button>
      </div>
    </Card>
  </div> 
</template>

<script>
  // import VueI18n from 'vue-i18n'

  export default {
    name: 'Error401',
    methods: {
      backPage () {
        this.$router.go(-2)
      },
      goHome () {
        this.$router.push({
          'path': '/'
        })
      }
    }
  }
</script>
