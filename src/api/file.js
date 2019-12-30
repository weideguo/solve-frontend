import request from '@/api/request'

export default {
  createPath: function (path) {
    return request({
      url: `/file/create?path=${path}`,
      method: 'get'
    })
  },
  getFileList: function (path) {
    return request({
      url: `/file/list?path=${path}`,
      method: 'get'
    })
  }
}