import request from '@/api/request'

export default {
  getOnline: function () {
    return request({
      url: '/host/online',
      method: 'get'
    })
  },
  kill: function (ip) {
    return request({
      url: `/host/kill?ip=${ip}`,
      method: 'get'
    })
  },
  conn: function (ip) {
    return request({
      url: `/host/conn?ip=${ip}`,
      method: 'get'
    })
  },
  getOnlinedetail: function (ip) {
    return request({
      url: '/host/onlinedetail',
      method: 'get'
    })
  },
}
