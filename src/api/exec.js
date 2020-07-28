import request from '@/api/request'

export default {
  getExecutionInfo: function (filter,page=1,pagesize=16,orderby='') {
    return request({
      url: `/executionInfo/get?filter=${filter}&page=${page}&pagesize=${pagesize}&orderby=${orderby}`,
      method: 'get'
    })
  },
  delExecutionInfo: function (target) {
    return request({
      url: `/executionInfo/del?target=${target}`,
      method: 'get'
    })
  },
  postExecutionInfo: function (params) {
    return request({
      url: '/executionInfo/',
      method: 'post',
      data: params
    })
  },
  getNameList: function (filter) {
    return request({
      url: `/executionInfo/info?filter=${filter}`,
      method: 'get',
    })
  },
  postSession: function (filter,params) {
    return request({
      url: `/session/?filter=${filter}`,
      method: 'post',
      data: params
    })
  },
  postTempSession: function (params) {
    return request({
      url: `/session/temp`,
      method: 'post',
      data: params
    })
  },
  getSession: function (filter) {
    return request({
      url: `/session/extend?filter=${filter}`,
      method: 'get',
    })
  },
  postExecution: function (filter,params,debug=0) {
    return request({
      url: `/execution/?filter=${filter}&debug=${debug}`,
      method: 'post',
      data: params
    })
  },
  postFastExecution: function (params) {
    return request({
      url: `/fast/`,
      method: 'post',
      data: params
    })
  },
  getRerunInfo: function (workid,target,targetid) {
    return request({
      url: `/execution/rerun_info?work_id=${workid}&target=${target}&target_id=${targetid}`,
      method: 'get',
    })
  },
  rerun: function (workid,target,targetid,begin_line,new_job_id='') {
    return request({
      url: `/execution/rerun?work_id=${workid}&target=${target}&target_id=${targetid}&begin_line=${begin_line}&new_job_id=${new_job_id}`,
      method: 'get',
    })
  },
  pauseRun: function(targetid, type) {
    return request({
      url: `/pauseRun/?target_id=${targetid}&type=${type}`,
      method: 'get',
    })  
  } 
}

