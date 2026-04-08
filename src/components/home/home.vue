<template>
  <div id="home">
    <Row>
      <Col span="16">
        <Row>
          <Col span="6">
            <info-card id-name="1" :end-val="count.order" iconType="md-cart" color="#f25e43" :intro-text="$t('orderNum')"></info-card>
          </Col>
          <Col span="6" style="padding-left:0.1vw">
            <info-card id-name="2" :end-val="count.realhost" iconType="md-laptop" color="#2d8cf0" :intro-text="$t('hostNum')"></info-card>
          </Col>
          <Col span="6" style="padding-left:0.1vw">
            <info-card id-name="3" :end-val="count.target" iconType="md-globe" color="#ffd572" :intro-text="$t('executeTargetNum')"></info-card>
          </Col>
          <Col span="6" style="padding-left:0.1vw">
            <info-card id-name="4" :end-val="count.exec" iconType="md-flower" color="#64d572" :intro-text="$t('executeNum')"></info-card>
          </Col>
        </Row>

        <Row style="margin-top: 1vh">
          <Col span="24">
            <Card>
              <div style="height: 74vh;">
                <data-chart></data-chart>
              </div>
            </Card>
          </Col>
        </Row>
      </Col>


      <Col span="8" style="padding-left:0.3vw">
        <Row>
          <Card style="height: 10vh; width: 100%; display: flex; align-items: center;">
            <Row style="width: 20vw;">
              <Col span="12">
                <b>{{ $t('loginDate') }}</b>
              </Col>
              <Col span="12">
                <b>{{time}}</b>
              </Col>
            </Row>
          </Card>
        </Row>

        <Row style="margin-top: 1vh;">
          <to-do-list cardHeight="78vh"></to-do-list>
        </Row>

      </Col>
    </Row>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import home from '@/api/home'
  import util from '@/libs/util'
  import toDoList from './components/toDoList.vue'
  import infoCard from './components/infoCard.vue'
  import dataChart from './components/dataChart.vue'
  
  const count = ref({
    user: 0,
    order: 0,
    exec: 0,
    target: 0,
    realhost: 0
  })
  
  const time = ref(util.formatDate(sessionStorage.getItem('loginTimestamp')))
  const username = ref(sessionStorage.getItem('user'))
  
  const getHomeinfo = () => {
    home.getHomeInfo()
      .then(res => {
        count.value = res.data
      })
      .catch(error => {
        util.notice(null, error, 'error')
      })
  }
  
  onMounted(() => {
    getHomeinfo()
  })
</script>
