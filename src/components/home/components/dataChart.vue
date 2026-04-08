<template>
<div ref="chartRef" style="width:100%;height:100%;" id="data_source_con"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import util from '@/libs/util'
  import home from '@/api/home'
  import * as echarts from 'echarts'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  // 模板引用
  const chartRef = ref(null)
  let chartInstance = null
  
  // 获取数据并渲染图表
  const fetchDataAndRender = () => {
    home.getHomeStats()
      .then(res => {
        const xdata = res.data.time
        const mylegend = []
        const myseries = []
  
        res.data.types.forEach((item) => {
          mylegend.push(item)
          myseries.push({
            name: item,
            type: 'line',
            smooth: true,
            data: res.data[item]
          })
        })
  
        const option = {
          title: {
            text: t('orderStats'), 
            left: '0px',
            top: '0px',
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
          legend: {
            data: mylegend,
            top: '0px'
          },
          series: myseries
        }
  
        chartInstance.setOption(option)
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  // 窗口大小改变处理
  const handleResize = () => {
    chartInstance?.resize()
  }
  
  onMounted(() => {
    // 初始化 ECharts
    if (chartRef.value) {
      chartInstance = echarts.init(chartRef.value)
      fetchDataAndRender()
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    }
  })
  
  onUnmounted(() => {
    // 组件卸载时清理，防止内存泄漏
    window.removeEventListener('resize', handleResize)
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })
</script>
