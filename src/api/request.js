// src/utils/request.js (或者保持原有的路径)
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  // baseURL: 'http://192.168.59.132:8000/api/v1xx', 
  baseURL: sessionStorage.getItem('baseurl'), // 注意：确保这里获取到的值有效，否则 axios 会请求相对路径
  timeout: 5000 // 建议加上超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
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
    // 这里可以统一处理业务状态码，比如 200 才是成功
    // if (response.data.code !== 200) { ... }
    return response
  },
  error => {
    // 处理响应错误 (如 401, 500)
    // 可以在这里做统一跳转登录等操作
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

export default request