<template>
<div style="width:100%;height:100%;" id="data_source_con"></div>
</template>

<script>
// import axios from 'axios'
import util from '@/libs/util'
import home from '@/api/home'

const echarts = require('echarts');
export default {
  name: 'dataChart',
  data () {
      return {
        // baseurl: this.$store.getters.sessionGet('baseurl'),
      }
  },
  mounted () {
    // Vue 异步执行 DOM 更新
    this.$nextTick(() => {
      var dataSourcePie = echarts.init(document.getElementById('data_source_con'));
      // axios.get(`${this.baseurl}/home/stats`)
      home.getHomeStats()
        .then(res => {
          let xdata = res.data.time
          let ydata = res.data.all
          let mylegend = []
          let myseries = []
          res.data.types.forEach((item,i) => {
            mylegend.push(item)
            myseries.push({
              name: item,
              type: 'line',
              smooth: true,
              data: res.data[item]
            })
          })
          let option = {
          title: {
              text: this.$t('orderStats')
          },
          tooltip: {
              trigger: 'axis'
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          toolbox: {
              feature: {
                  saveAsImage: {}
              }
          },
          xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xdata
          },
          yAxis: {
              type: 'value'
          },
          legend: {data: mylegend},
          series: myseries
          };
          dataSourcePie.setOption(option);
          window.addEventListener('resize', function () {
            dataSourcePie.resize();
          });
      })
      .catch(error => {
        util.err_notice(error)
      })
    });
  }
};
</script>
