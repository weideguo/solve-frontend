import request from '@/api/request'

export default {
  dura: function (workid) {
    return request({
      url: `/dura/?id=${workid}`,
      method: 'get'
    })
  },
}