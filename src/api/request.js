import axios from 'axios'
import util from '@/libs/util'

const request = axios.create({
  // baseURL: 'http://192.168.59.132:8000/api/v1xx', 
  baseURL: sessionStorage.getItem('baseurl'),
})

request.interceptors.request.use(
  config => {
    config.headers['Accept-Language'] =  localStorage.getItem('language')
    config.headers['Authorization'] =  sessionStorage.getItem('jwt')
    return config
  },
  // error => {
  // }
)


request.interceptors.response.use(

    response => {
        return response
        // console.log(response.status)
    },
    // error => {
    //     return Promise.reject(error)
    // }
)

export default request