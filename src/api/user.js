import request from '@/api/request'

export default {
  postUserinfo: function (params) {
    return request({
      url: '/userinfo/',
      method: 'post',
      data: params
    })
  },
  getUserinfo: function (page,pagesize) {
    return request({
      url: `/userinfo/?page=${page}&pagesize=${pagesize}`,
      method: 'get',
    })
  },
  putUserinfo: function (params) {
    return request({
      url: '/userinfo/',
      method: 'put',
      data: params
    })
  },
  deleteUserinfo: function (username) {
    return request({
      url: '/userinfo/'+username,
      method: 'delete',
    })
  },
}