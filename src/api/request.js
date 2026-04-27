import axios from 'axios'

import { router } from '@/router.js'

// 创建 axios 实例
const request = axios.create({
  timeout: 15000 // 超时时间，注意要大于后端的最大返回时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    config.baseURL = sessionStorage.getItem('baseurl')

    // 设置语言
    config.headers['Accept-Language'] = localStorage.getItem('language')
    // 设置 Token
    config.headers['Authorization'] = sessionStorage.getItem('jwt')
    return config
  },
  error => {
    // 处理请求错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // if (response.data.code !== 200) { ... }
    return response
  },
  error => {
    // 在这里做统一跳转登录等操作
    console.log(error.response,error.message)
    if ( error.response.status === 401 ) {
      router.push({ name: 'login'}) 
    } else {
      console.error('响应错误:', error)
    }
    
    return Promise.reject(error)
  }
)

export default request