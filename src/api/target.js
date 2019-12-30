import request from '@/api/request'

export default {
  getTarget: function (searchWord,page,pageSize) {
    return request({
      url: `/target/get?filter=${searchWord}&page=${page}&pagesize=${pageSize}`,
      method: 'get'
    })
  },
  delTarget: function (delname) {
    return request({
      url: `/target/del?target=${delname}`,
      method: 'get'
    })
  },
  addTarget: function (params) {
    return request({
      url: `/target/`,
      method: 'post',
      data: params
    })
  },
  getNameList: function (filter) {
    return request({
      url: `/target/info?filter=${filter}`,
      method: 'get'
    })
  },
}


