<template>
  <div>
    <p :style="{textAlign: 'center', color: color, fontSize: countSize, fontWeight: countWeight}">
      <span v-cloak :id="idName">{{ startVal }}</span>
      <span>{{ unit }}</span>
    </p>
    <p style="font-size: 1vh; color: rgb(200, 200, 200);">{{ introText }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { CountUp } from 'countup.js';

const props = defineProps({
  idName: String,
  introText: String,
  endVal: {
    type: Number,
    required: true
  },
  startVal: {
    type: Number,
    default: 0
  },
  options: {
    type: Object,
    default: () => ({ duration: 2 })
  },
  delay: {
    type: Number,
    default: 500
  },
  color: String,
  countSize: {
    type: String,
    default: '30px'
  },
  countWeight: {
    type: Number,
    default: 700
  }
});


const unit = ref('');

function transformValue(val) {
  let endVal = 0;
  let unit = '';
  if (val < 1000) {
    endVal = val;
  } else if (val >= 1000 && val < 1000000) {
    endVal = parseInt(val / 1000);
    unit = 'K+';
  } else if (val >= 1000000 && val < 10000000000) {
    endVal = parseInt(val / 1000000);
    unit = 'M+';
  } else {
    endVal = parseInt(val / 1000000000);
    unit = 'B+';
  }
  return {
    val: endVal,
    unit: unit
  };
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      const res = transformValue(props.endVal);
      const endVal = res.val;
      unit.value = res.unit;

      if (document.getElementById(props.idName)) {
        let myCountUp = new CountUp(props.idName, endVal, props.options);
        if (!myCountUp.error) {
          myCountUp.start();
        }
      }
    }, props.delay);
  });
});
</script>