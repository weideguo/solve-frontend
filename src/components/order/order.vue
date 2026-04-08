<template>
  <div>
    <Card>
      <Table border :columns="columns" :data="tableData" stripe @on-row-dblclick="orderDetail" size="small">
        <template #operation="{ row, index }">
          <Button type="success" size="small" style="margin-right: 20px" @click="orderDetail(row)">{{ $t('detail') }}</Button>
          <Button type="error" size="small" @click="deleteRow(row)">{{ $t('delete') }}</Button>
        </template>
      </Table>
      <br>
      <Page :total="pageNumber" @on-change="getCurrentPage" @on-page-size-change="getCurrentPageNew" :model-value="currentPage" :page-size="pagesize" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
    </Card>
  </div>
</template>

<script setup>
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import order from '@/api/order'
  import util from '@/libs/util'
  import { useAppStore } from '@/store'
  
  const router = useRouter()
  const { t } = useI18n()
  const appStore = useAppStore()
  const { proxy } = getCurrentInstance()
  
  const columns = ref([
    {
      title: t('jobID'),
      key: 'work_id',
      width: 300
    },
    {
      title: t('commitDate'),
      key: 'date',
      width: 150,
      sortType: 'desc',
      sortable: true
    },
    {
      title: t('committer'),
      key: 'user',
      align: 'center',
      width: 120,
      tooltip: true,
      sortable: true
    },
    {
      title: 'type',
      key: 'job_type',
      align: 'center',
      width: 100,
      sortable: true
    },
    {
      title: 'playbook',
      key: 'playbook',
      tooltip: true,
      sortable: true,
      minWidth: 300
    },
    {
      title: t('jobDesc'),
      width: 200,
      tooltip: true,
      key: 'comment',
      sortable: true
    },
    {
      title: t('operation'),
      slot: 'operation',
      align: 'center',
      width: 300,
    }
  ])
  
  const pagesize = ref(18)
  const pageNumber = ref(0)
  const currentPage = ref(1)
  const pageSizeOpts = ref([10,20,40,80,100,200])
  const tableData = ref([])
  
  const orderDetail = (paramsDict) => {
    router.push({name: 'orderDetail', query: {workid: paramsDict['work_id']}})
    appStore.setTagBreadBeforeOpen('orderDetail')
  }
  
  const deleteRow = (params) => {
    order.delOrder(`${params['work_id']}`)
      .then(res => {
        if (res.data['status'] === 1) {
          getCurrentPage()
          util.notice(proxy, `${params['work_id']} ` + t('deleteSuccess'), 'success')
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const getCurrentPageNew = (newPagesize) => {
    pagesize.value = newPagesize
    getCurrentPage(1)
  }
  
  const getCurrentPage = (vl) => {
    if (!vl) {
      vl = sessionStorage.getItem('orderCurrentpage')
    }
    if (!vl) {
      vl = 1
    }
    currentPage.value = parseInt(vl)
    sessionStorage.setItem('orderCurrentpage', vl)
    
    order.getOrder(vl, pagesize.value)
      .then(res => {
        tableData.value = res.data['data']
        tableData.value.forEach((item) => {
          item['date'] = util.formatDate(parseFloat(item['begin_time']))
        })
        pageNumber.value = parseInt(res.data['page'])
      })
      .catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  onMounted(() => {
    getCurrentPage()
  })
</script>
