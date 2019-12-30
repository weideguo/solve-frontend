import request from '@/api/request'

export default {
  login: function (baseurl, params) {
    return request({
      url: baseurl+'/login/',
      method: 'post',
      data: params
    })
  },
  loginCAS: function (baseurl, service) {
    return request({
      url: baseurl+'/cas/login?service='+service,
      method: 'get',
    })
  },
  casServiceValidate: function (baseurl, ticket, service) {
    return request({
      url: baseurl+`/cas/serviceValidate?ticket=${ticket}&service=${service}`,
      method: 'get',
    })
  },
  logout: function (baseurl, service) {
    return request({
      url: baseurl+`/logout/?service=${service}`,
      method: 'get',
    })
  },
}