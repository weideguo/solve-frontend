import request from '@/api/request'

export default {
  login: function (params) {
    return request({
      url: '/login/',
      method: 'post',
      data: params
    })
  },
  loginCAS: function (service) {
    return request({
      url: '/cas/login?service='+service,
      method: 'get',
    })
  },
  casServiceValidate: function (ticket, service) {
    return request({
      url: `/cas/serviceValidate?ticket=${ticket}&service=${service}`,
      method: 'get',
    })
  },
  logout: function (service) {
    return request({
      url: `/logout/?service=${service}`,
      method: 'get',
    })
  },
}