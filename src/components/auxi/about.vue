<template>
  <div id="band" style="width:100%;">
    <div style="position: absolute;margin-left: 5%;margin-top: 2%">
      <div>
        <p>
          <a href="/">
            <span style="font-weight:900;font-size:36px">{{title}}</span>
          </a>
        </p>
      </div>

      <div style="margin-top: 10%;">
        <p v-for="(i,j) in word">
          <b>{{j+1}}.&nbsp;&nbsp;{{i}}</b>
        </p>
      </div>

      <div style="margin-top: 5%;">
        <p >
          <a href="#">by weideguo</a>
        </p>
      </div>    
    </div>
  </div>
</template>

<script>
  export default {
    name: 'version',
    data () {
      return {
        title: 'solve 0.17.x',
        word: [
          'SOLVE - Simple cOmmand deLiver serVEr',
          '开始于20181109',
          '基于SSH实现命令的分发',
          '灵活配置, 使用jinja模板变量，可以由配置信息进行替换',
          'playbook为命令集合，在单行shell语句中增加主机跳转、文件上下传、全局变量设置语法',
          '可以使用&后台运行多个命令，并由wait检测结果',
          'web前后端分离',
          '后端django-restful',
          '前端vue iviewui',
          '使用redis作为数据存储，账号使用sqlite存储',
          '可选使用mongodb作为持久化存储',
          '可选使用CAS进行账号认证',
          '多语言支持',
          '断点执行支持',
          '持续更新中......',

        ]
      }
    },
    mounted () {
      window.particlesJS.load('band', '/particlesjs-config.json')
    }
  }
</script>

