import request from '@/api/request'

export default {
  getToken: function (page,pagesize) {
    return request({
      url: `/permanentToken/?page=${page}&pagesize=${pagesize}`,
      method: 'get',
    })
  },
  generateToken: function () {
    return request({
      url: `/permanentToken/generate`,
      method: 'get',
    })
  },
  deleteToken: function (params) {
    return request({
      url: '/permanentToken/delete',
      method: 'post',
      data: params
    })
  },
  updateToken: function (params) {
    return request({
      url: '/permanentToken/update',
      method: 'post',
      data: params
    })
  },
  
  getInvokeRule: function (page,pagesize) {
    return request({
      url: `/apiInvokeRule/?page=${page}&pagesize=${pagesize}`,
      method: 'get',
    })
  },
  getInvokeRuleIdList: function () {
    return request({
      url: `/apiInvokeRule/idList`,
      method: 'get',
    })
  },
  deleteInvokeRule: function (params) {
    return request({
      url: '/apiInvokeRule/delete',
      method: 'post',
      data: params
    })
  },
  createInvokeRule: function (params) {
    return request({
      url: '/apiInvokeRule/create',
      method: 'post',
      data: params
    })
  },
  updateInvokeRule: function (params) {
    return request({
      url: '/apiInvokeRule/update',
      method: 'post',
      data: params
    })
  },
}