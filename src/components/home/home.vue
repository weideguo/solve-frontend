<template>
  <div id="home">
    <Row style="padding-left:2px;">
      <Col span="16">
        <Row>
          <Col span="6">
            <info-card id-name="1" :end-val="count.order" iconType="md-cart" color="#f25e43" :intro-text="$t('orderNum')"></info-card>
          </Col>
          <Col span="6" style="padding-left:5px">
            <info-card id-name="4" :end-val="count.realhost" iconType="md-laptop" color="#2d8cf0" :intro-text="$t('hostNum')"></info-card>
          </Col>
          <Col span="6" style="padding-left:5px">
            <info-card id-name="2" :end-val="count.target" iconType="md-globe" color="#ffd572" :intro-text="$t('executeTargetNum')"></info-card>
          </Col>
          <Col span="6" style="padding-left:5px">
            <info-card id-name="3" :end-val="count.exec" iconType="md-flower" color="#64d572" :intro-text="$t('executeNum')"></info-card>
          </Col>
        </Row>

        <Row style="margin-top:2vh">
          <Col span="24">
            <Card>
              <div style="height: 70vh;">
                <data-chart></data-chart>
              </div>
            </Card>
          </Col>
        </Row>
      </Col>


      <Col span="8" style="padding-left:5px">
        <Row >
          <Card style="height: 100px; width: 100%">
            <Row style="margin-top: 20px">
              <Col span="8">
                <b>{{ $t('loginDate') }}</b>
              </Col>
              <Col span="16" style="padding-left: 8px">
                <b>{{time}}</b>
              </Col>
            </Row>
          </Card>
        </Row>

        <Row style="margin-top:2vh;">
          <to-do-list cardHeight="74vh"></to-do-list>
        </Row>

      </Col>
    </Row>
  </div>
</template>

<script>
  // import axios from 'axios'
  import home from '@/api/home'
  import util from '@/libs/util'
  import config from '@/config/config'
  import toDoList from './components/toDoList.vue'
  import infoCard from './components/infoCard.vue'
  import dataChart from './components/dataChart.vue'
  

  export default {
    components: {
      toDoList,
      infoCard,
      dataChart
    },
    data () {
      return {
        count: {
          user: 0,
          order: 0,
          exec: 0,
          target: 0,
          realhost: 0
        },
        time: util.formatDate(sessionStorage.getItem('loginTimestamp')),
        username: sessionStorage.getItem('user')
      }
    },
    methods: {
      getHomeinfo () {
        home.getHomeInfo()
          .then(res => {
            this.count = res.data
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      }
    },
    mounted () {
      this.getHomeinfo()
    }
  }
</script>
