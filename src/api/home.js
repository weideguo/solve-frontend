import request from '@/api/request'

export default {
  getHomeInfo: function () {
    return request({
      url: '/home/info',
      method: 'get'
    })
  },
  getHomeStats: function () {
    return request({
      url: '/home/stats',
      method: 'get'
    })
  }
}