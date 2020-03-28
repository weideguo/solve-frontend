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

export const about = {
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

export const test = {
  path: '/test',
  name: 'test',
  title: 'test',
  meta: {
    title: 'test'
  },
  component: resolve => {
    require(['./components/auxi/test.vue'], resolve)
  }
}

export const playbook = {
  path: '/playbook',
  name: 'playbook',
  title: 'playbook',
  meta: {
    title: 'playbook'
  },
  component: resolve => {
    require(['./components/auxi/playbook.vue'], resolve)
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
    path: '/order',
    icon: 'md-cart',
    name: 'order',
    title: '工单',
    redirect: '/order/order',
    component: Main,
    children: [
      {
        path: 'order',
        name: 'orderInfo',
        title: '我的工单',
        icon: 'md-cart',
        meta: {
          title: '我的工单'
        },
        component: resolve => {
          require(['./components/order/order.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/host',
    icon: 'md-laptop',
    name: 'ohost',
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
          require(['./components/host/host.vue'], resolve)
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
          require(['./components/target/target.vue'], resolve)
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
          require(['./components/target/target.vue'], resolve)
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
          require(['./components/target/target.vue'], resolve)
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
          require(['./components/target/target.vue'], resolve)
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
          require(['./components/target/target.vue'], resolve)
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
        title: '执行任务',
        meta: {
          title: '执行任务'
        },
        icon: 'md-flower',
        component: resolve => {
          require(['./components/exec/exec.vue'], resolve)
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
      },
      {
        path: 'fast',
        name: 'fast',
        title: '快速任务',
        meta: {
          title: '快速任务'
        },
        icon: 'md-plane',
        component: resolve => {
          require(['./components/exec/fast.vue'], resolve)
        }
      }
    ]
  },
  {
    path: '/file',
    icon: 'md-briefcase',
    name: 'ofile',
    title: '任务执行',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'file',
        name: 'file',
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
  name: 'home',
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

export const orderDetail = {
  path: '/order',
  name: 'order',
  title: '工单',
  redirect: '/order/orderDetail',
  component: Main,
  children: [
    {
      path: 'orderDetail',
      name: 'orderDetail',
      title: '工单详情',
      meta: {
        title: '工单详情'
      },
      component: resolve => {
        require(['./components/order/components/orderDetail.vue'], resolve)
      }
    }
  ]
}

export const execDetail = {
  path: '/execution',
  name: 'execution',
  title: '任务执行',
  // redirect: '/',
  component: Main,
  children: [
    {
      path: 'execDetail',
      name: 'execDetail',
      title: '任务详情',
      meta: {
        title: '任务详情'
      },
      component: resolve => {
        require(['./components/exec/components/execDetail.vue'], resolve)
      }
    }
  ]
}

export const MainRoute = [
  home,
  loginRouter,
  locking,
  ...appRouter,    // 将一个数组转为用逗号分隔的参数序列
  orderDetail,
  execDetail,
  playbook,
  about,
  test,
  page401,
  page500,
  page404          // 由于路径匹配为/* 这个必须放在最后 否则都定向到这个路由
]
