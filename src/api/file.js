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
  },
  getFileContent: function (file) {
    return request({
      url: `/file/content?file=${file}`,
      method: 'get'
    })
  },
  download: function (file) {
    return request({
      url: `/file/download?file=${file}`,
      method: 'get',
      responseType: 'blob'
    })
  }
}