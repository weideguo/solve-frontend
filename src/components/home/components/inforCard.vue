<template>
  <Card :padding="0">
    <div style="height: 100px;">
      <Col span="8" style="height: 100%;" :style="{backgroundColor: color, color: 'white'}">
        <Row style="height: 100%;" type="flex" align="middle" justify="center">
          <Icon :type="iconType" :size="iconSize"></Icon>
        </Row>
      </Col>
      <Col span="16" style="height: 100%;">
        <Row type="flex" align="middle" justify="center" style="height: 100%;">
          <count-up  :id-name="idName" :end-val="endVal" :color="color" :countSize="countSize" :countWeight="countWeight">
            <p style="font-size: 12px;font-weight: 500;color: #C8C8C8;" slot="intro">{{ introText }}</p>
          </count-up>
        </Row>
      </Col>
    </div>
  </Card>
</template>

<script>
import countUp from './countUp.vue';

export default {
  name: 'inforCard',
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
      default: '30px'
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
