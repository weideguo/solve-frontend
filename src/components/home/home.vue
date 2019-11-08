<template>
  <div id="home">
    <Row style="padding-left:2px;padding-right:2px;">
      <Col span="16">
        <Row>
          <Col span="6">
            <infor-card id-name="1" :end-val="count.order" iconType="md-cart" color="#f25e43" intro-text="提交的工单"></infor-card>
          </Col>
          <Col span="6" style="padding-left:5px">
            <infor-card id-name="4" :end-val="count.realhost" iconType="md-laptop" color="#2d8cf0" intro-text="主机数量"></infor-card>
          </Col>
          <Col span="6" style="padding-left:5px">
            <infor-card id-name="2" :end-val="count.target" iconType="md-globe" color="#ffd572" intro-text="执行对象数量"></infor-card>
          </Col>
          <Col span="6" style="padding-left:5px">
            <infor-card id-name="3" :end-val="count.exec" iconType="md-flower" color="#64d572" intro-text="可执行任务数量"></infor-card>
          </Col>
        </Row>

        <Row style="margin-top:20px">
          <Col span="24">
            <Card>
              <div style="height: 700px;">
                <data-chart></data-chart>
              </div>
            </Card>
          </Col>
        </Row>
      </Col>


      <Col span="8" style="padding-left:5px">
        <Row>
          <Card style="height: 100px">
            <Row style="margin-top: 20px">
              <Col span="8">
                <b>登陆时间:</b>
              </Col>
              <Col span="16" style="padding-left: 8px">
                <b>{{time}}</b>
              </Col>
            </Row>
          </Card>
        </Row>

        <Row style="margin-top:20px">
          <!--to-do-list :content="toDoList"  @delTodo="delTodo"></to-do-list-->
          <to-do-list cardHeight="735px"></to-do-list>
        </Row>

      </Col>

    </Row>
  </div>
</template>

<script>
  import axios from 'axios'
  import util from '@/libs/util'
  import config from '@/config/config'
  import toDoList from './components/toDoList.vue'
  import inforCard from './components/inforCard.vue'
  import dataChart from './components/dataChart.vue'

  export default {
    components: {
      toDoList,
      inforCard,
      dataChart
    },
    data () {
      return {
        baseurl: this.$store.getters.sessionGet('baseurl'),
        count: {
          user: 0,
          order: 0,
          exec: 0,
          target: 0,
          realhost: 0
        },
        time: util.formatDate(sessionStorage.getItem('login_timestamp')),
        username: sessionStorage.getItem('user')
      }
    },
    methods: {
      getHomeinfo () {
        // axios.get(`${this.baseurl}/home/info`)
        // let url = this.$store.getters.sessionGet('baseurl')
        axios.get(`${this.baseurl}/home/info`)
        .then(res => {
          this.count = res.data
        })
        .catch(error => {
          util.notice(error, 'error')
        })
      }
    },
    mounted () {
      this.getHomeinfo()
      // window.particlesJS.load('home', '/static/particlesjs-config.json') // 控制不了canvas高度
    }
  }
</script>
