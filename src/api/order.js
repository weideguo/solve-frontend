import request from '@/api/request'

export default {
  getOrder: function (page,pagesize) {
    return request({
      url: `/order/?page=${page}&pagesize=${pagesize}`,
      method: 'get'
    })
  },
  delOrder: function (workid) {
    return request({
      url: `/order/del?workid=${workid}`,
      method: 'get'
    })
  },
  abort: function (targetid) {
    return request({
      url: `/order/abort?target_id=${targetid}`,
      method: 'get'
    })
  },
  exelist: function (targetid) {
    return request({
      url: `/order/exelist?id=${targetid}`,
      method: 'get'
    })
  },
  exedetail: function (logid) {
    return request({
      url: `/order/exedetail?id=${logid}`,
      method: 'get'
    })
  },
  summary: function (workid) {
    return request({
      url: `/order/summary?workid=${workid}`,
      method: 'get'
    })
  },
  detail: function (workid,exclude) {
    return request({
      url: `/order/detail?workid=${workid}&exclude=${exclude}`,
      method: 'get'
    })
  },
}