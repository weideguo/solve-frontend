<template>
  <div>
    <Row>
      <Card>
        <Row>
          <Col span="24">
            <Table border :columns="columns" :data="tableData" stripe @on-row-dblclick="orderDetail" size="small"></Table>
          </Col>
        </Row>
        <br>
        <Page :total="pageNumber" @on-change="getCurrentPage" @on-page-size-change="getCurrentPageNew" :current="currentPage" :page-size="pagesize" :page-size-opts="pageSizeOpts" show-elevator show-total show-sizer></Page>
      </Card>
    </Row>
  </div>
</template>
<script>
  //
  // import axios from 'axios'
  import order from '@/api/order'
  import util from '@/libs/util'

  export default {
    name: 'order',
    data () {
      return {
        // baseurl: this.$store.getters.sessionGet('baseurl'),
        columns: [
          {
            title: '工单编号:',
            key: 'work_id',
            width: 300
          },
          {
            title: '提交时间:',
            key: 'date',
            width: 150,
            sortType: 'desc',
            sortable: true
          },
          {
            title: '提交人',
            key: 'user',
            align: 'center',
            width: 100,
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
            title: '工单说明',
            width: 200,
            tooltip: true,
            key: 'comment',
            sortable: true
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    type: 'success'
                  },
                  on: {
                    click: () => {
                      this.orderDetail(params.row);
                    }
                  }
                }, '详细')
              ])
            }
          },
          {
            title: '删除',
            key: 'action',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    type: 'error'
                  },
                  on: {
                    click: () => {
                      this.delete(params);
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        pagesize: 18,
        pageNumber: 0,
        currentPage: 1,
        pageSizeOpts: [10,20,40,80,100,200],
        tableData: []
      }
    },
    methods: {
      orderDetail (paramsDict) {
        util.openPageEx(this, 'orderDetail', {workid: paramsDict['work_id']});
      },
      delete (params) {
        // axios.get(`${this.baseurl}/order/del?workid=${params.row['work_id']}`)
        order.delOrder(`${params.row['work_id']}`)
          .then(res => {
            if (res.data['status'] === 1) {
              this.getCurrentPage();
              util.notice(this, `${params.row['work_id']} 删除成功`, 'success')
            } else {
              util.notice(this, '删除失败', 'error')
            }
          })
          .catch(error => {
            util.notice(this, error, 'error')
          });
      },
      getCurrentPageNew (pagesize) {
        this.pagesize=pagesize
        this.getCurrentPage(1)
      },
      getCurrentPage (vl) {
        if (!vl) {
          vl = sessionStorage.getItem('order_currentpage')
        }
        if (!vl) {
          vl = 1
        }
        this.currentPage = parseInt(vl)
        sessionStorage.setItem('order_currentpage', vl);
        // axios.get(`${this.baseurl}/order/?page=${vl}&pagesize=${this.pagesize}`)
        // axios.get(`${this.baseurl}/order/?page=${vl}&pagesize=${this.pagesize}`)
        order.getOrder(vl,this.pagesize)
          .then(res => {
            this.tableData = res.data['data']
            this.tableData.forEach((item) => {
              item['date'] = util.formatDate(parseFloat(item['begin_time']));
            })
            this.pageNumber = parseInt(res.data['page'])
          })
          .catch(error => {
            util.notice(this, error, 'error')
          })
      }
    },
    mounted () {
      this.getCurrentPage()
    }
  }
</script>

