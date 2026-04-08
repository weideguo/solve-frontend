<style lang="css">
  @import './404.css';
</style>

<template>
  <div class="error404-body-con">
    <Card>
      <div class="error404-body-con-title">
        4
        <span ><Icon type="ios-navigate-outline"></Icon></span>
        4
      </div>
      <p class="error404-body-con-message">YOU&nbsp;&nbsp;LOOK&nbsp;&nbsp;LOST</p>
      <div class="error404-btn-con">
        <Button @click="goHome" size="large" style="width: 200px;" type="text">{{ $t('backToHome') }}</Button>
        <Button @click="backPage" size="large" style="width: 200px;margin-left: 40px;" type="primary">{{ $t('backToPre') }}</Button>
      </div>
    </Card>
  </div>
</template>

<script setup>
  //
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const backPage = () => {
    router.go(-2)
  }
  
  const goHome = () => {
    router.push({
      path: '/'
    })
  }
</script>
