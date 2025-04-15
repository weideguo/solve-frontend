<template>
  <Card :padding="0">
    <div style="height: 10vh;">
      <Row style="height: 100%;">
        <Col span="8" style="height: 100%;" :style="{backgroundColor: color, color: 'white'}">
          <Row style="height: 100%;" type="flex" align="middle" justify="center">
            <Icon :type="iconType" :size="iconSize"></Icon>
          </Row>
        </Col>
        <Col span="16" style="height: 100%;">
          <Row style="height: 100%;" type="flex" align="middle" justify="center">
            <count-up  :id-name="idName" :end-val="endVal" :color="color" :countSize="countSize" :countWeight="countWeight">
              <p style="font-size: 1vh;color: #C8C8C8;" slot="intro">{{ introText }}</p>
            </count-up>
          </Row>
        </Col>
      </Row>
    </div>
  </Card>
</template>

<script>
import countUp from './countUp.vue';

export default {
  name: 'infoCard',
  components: {
    countUp
  },
  props: {
    idName: String,
    endVal: Number,
    color: String,
    iconType: String,
    introText: String,
    countSize: {
      type: String,
      default: '3vh'
    },
    countWeight: {
      type: Number,
      default: 700
    },
    iconSize: {
      type: Number,
      default: 40
    }
  }
};
</script>
