import request from '@/api/request'

export default {
  getKey: function (key) {
    return request({
      url: `/config/?key=${key}`,
      method: 'get'
    })
  },
  postKey: function (key,params,type='hash') {
    return request({
      url: `/config/?key=${key}&type=${type}`,
      method: 'post',
      data: params
    })
  },
}

