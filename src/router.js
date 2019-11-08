import Main from './components/main/main.vue'

export const page404 = {
  path: '/*',
  name: 'error_404',
  title: '404',
  meta: {
    title: '404-页面不存在'
  },
  component: resolve => {
    require(['./components/auxi/error/404.vue'], resolve)
  }
}

export const page401 = {
  path: '/401',
  name: 'error_401',
  title: '401',
  meta: {
    title: '401-权限不足'
  },
  component: resolve => {
    require(['./components/auxi/error/401.vue'], resolve)
  }
}

export const page500 = {
  path: '/500',
  name: 'error_500x',
  title: '500',
  meta: {
    title: '500-服务端错误'
  },
  component: resolve => {
    require(['./components/auxi/error/500.vue'], resolve)
  }
}

export const version = {
  path: '/about',
  name: 'about',
  title: 'about',
  meta: {
    title: 'about'
  },
  component: resolve => {
    require(['./components/auxi/about.vue'], resolve)
  }
}

export const loginRouter = {
  path: '/login',
  name: 'login',
  title: '登录',
  meta: {
    title: 'login - 登录'
  },
  component: resolve => {
    require(['./components/main/login.vue'], resolve)
  }
}

export const locking = {
  path: '/locking',
  name: 'locking',
  title: '锁屏',
  component: resolve => {
    require(['./components/auxi/lock.vue'], resolve)
  }
}

export const appRouter = [
  {
    path: '/myorder',
    icon: 'md-cart',
    name: 'myorder',
    title: '工单',
    redirect: '/myorder/order',
    component: Main,
    children: [
      {
        path: 'order',
        name: 'order',
        title: '我的工单',
        icon: 'md-cart',
        meta: {
          title: '我的工单'
        },
        component: resolve => {
          require(['./components/order/myOrder.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/hostmanage',
    icon: 'md-laptop',
    name: 'hostmanage',
    title: '主机管理',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'realhost',
        name: 'realhost',
        title: '主机管理',
        meta: {
          title: '主机管理'
        },
        icon: 'md-laptop',
        component: resolve => {
          require(['./components/host/hostmanage.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/target',
    icon: 'md-globe',
    name: 'target',
    title: '执行对象',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'const',
        name: 'const',
        title: 'const',
        meta: {
          title: 'const'
        },
        icon: 'md-compass',
        component: resolve => {
          require(['./components/target/targetinfo.vue'], resolve)
        }
      },
      {
        path: 'host',
        name: 'host',
        title: 'host',
        meta: {
          title: 'host'
        },
        icon: 'md-desktop',
        component: resolve => {
          require(['./components/target/targetinfo.vue'], resolve)
        }
      },
      {
        path: 'server',
        name: 'server',
        title: 'server',
        meta: {
          title: 'server'
        },
        icon: 'md-code',
        component: resolve => {
          require(['./components/target/targetinfo.vue'], resolve)
        }
      },
      {
        path: 'cluster',
        name: 'cluster',
        title: 'cluster',
        meta: {
          title: 'cluster'
        },
        icon: 'md-grid',
        component: resolve => {
          require(['./components/target/targetinfo.vue'], resolve)
        }
      },
      {
        path: 'container',
        name: 'container',
        title: 'container',
        meta: {
          title: 'container'
        },
        icon: 'md-apps',
        component: resolve => {
          require(['./components/target/targetinfo.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/execution',
    icon: 'md-cog',
    name: 'execution',
    title: '任务执行',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'exec',
        name: 'exec',
        title: '可执行任务',
        meta: {
          title: '可执行任务'
        },
        icon: 'md-flower',
        component: resolve => {
          require(['./components/exec/preexec.vue'], resolve)
        }
      },
      {
        path: 'tmpl',
        name: 'tmpl',
        title: '任务模板',
        meta: {
          title: '任务模板'
        },
        icon: 'md-albums',
        component: resolve => {
          require(['./components/exec/tmplexec.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/file',
    icon: 'md-briefcase',
    name: 'file',
    title: '任务执行',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'myfile',
        name: 'myfile',
        title: '文件管理',
        meta: {
          title: '文件管理'
        },
        icon: 'md-briefcase',
        component: resolve => {
          require(['./components/file/file.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/user',
    icon: 'md-people',
    name: 'user',
    title: '管理',
    redirect: '/user/userlist',
    component: Main,
    children: [
      {
        path: 'userlist',
        name: 'userlist',
        title: '用户管理',
        meta: {
          title: '用户管理'
        },
        icon: 'md-people',
        component: resolve => {
          require(['./components/user/userInfo.vue'], resolve)
        }
      }
    ]
  }
]

export const home = {
  path: '/',
  name: 'myhome',
  title: '首页',
  redirect: '/home',
  component: Main,
  children: [
    {
      path: 'home',
      title: '首页',
      meta: {
        title: '首页'
      },
      name: 'home_index',
      component: resolve => {
        require(['./components/home/home.vue'], resolve)
      }
    }
  ]
}

export const orderList = {
  path: '/myorder',
  name: 'myorder',
  title: '工单',
  redirect: '/myorder/order',
  component: Main,
  children: [
    {
      path: 'orderlist',
      name: 'orderlist',
      title: '工单详情',
      meta: {
        title: '工单详情'
      },
      component: resolve => {
        require(['./components/order/components/myorderList.vue'], resolve)
      }
    }
  ]
}

export const myexec = {
  path: '/execution',
  name: 'execution',
  title: '任务执行',
  // redirect: '/',
  component: Main,
  children: [
    {
      path: 'execdetail',
      name: 'execdetail',
      title: '任务详情',
      meta: {
        title: '任务详情'
      },
      component: resolve => {
        require(['./components/exec/components/myexec.vue'], resolve)
      }
    }
  ]
}

export const MainRoute = [
  home,
  loginRouter,
  locking,
  ...appRouter,    // 将一个数组转为用逗号分隔的参数序列
  orderList,
  myexec,
  version,
  page401,
  page500,
  page404          // 由于路径匹配为/* 这个必须放在最后 否则都定向到这个路由
]
