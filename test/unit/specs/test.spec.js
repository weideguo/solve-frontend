import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import main from '@/components/main/login.vue'

describe('main.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(main)
    const vm = new Constructor().$mount()
    // expect(vm.find('#main').exists()).toBeTruthy()
    // expect(vm.$el.querySelector('.hello h1').textContent)
    //  .toEqual('Welcome to Your Vue.js App')
  })
})
// describe('main', () => {
//   it('renders a message and responds correctly to user input', () => {
//     const wrapper = shallowMount(main, {
//       data() {
//         return {
//           project: 'testProject'
//         }
//       }
//     })
// 
//     // expect(wrapper.find('#band').exists()).toBeTruthy()
// 
//   })
// })