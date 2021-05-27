import Main from './components/main/main.vue'
// vue-i18n与路由同级 不能直接 import VueRouter from 'vue-router'
// 以下的title不是原始值，只作为变量在实际渲染时再翻译

export const page404 = {
  path: '/*',
  name: 'error_404',
  title: '404',
  meta: {
    title: '404-pageNotFound'
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
    title: '401-Unauthorized '
  },
  component: resolve => {
    require(['./components/auxi/error/401.vue'], resolve)
  }
}

export const page500 = {
  path: '/500',
  name: 'error_500',
  title: '500',
  meta: {
    title: '500-serverError'
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
    title: 'test.aaa'
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
  title: 'login',
  meta: {
    title: 'login'
  },
  component: resolve => {
    require(['./components/main/login.vue'], resolve)
  }
}

export const locking = {
  path: '/locking',
  name: 'locking',
  title: 'locking',
  component: resolve => {
    require(['./components/auxi/lock.vue'], resolve)
  }
}

export const appRouter = [
  {
    path: '/order',
    icon: 'md-cart',
    name: 'order',
    title: 'order',
    redirect: '/order/order',
    component: Main,
    children: [
      {
        path: 'order',
        name: 'myOrder',
        title: 'myOrder',
        icon: 'md-cart',
        meta: {
          title: 'myOrder'
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
    title: 'hostManage',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'realhost',
        name: 'realhost',
        title: 'hostManage',
        meta: {
          title: 'hostManage'
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
    title: 'executeTarget',
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
    title: 'jobExecute',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'exec',
        name: 'exec',
        title: 'execute',
        meta: {
          title: 'execute'
        },
        icon: 'md-flower',
        component: resolve => {
          require(['./components/exec/exec.vue'], resolve)
        }
      },
      {
        path: 'tmpl',
        name: 'tmpl',
        title: 'jobTmplate',
        meta: {
          title: 'jobTmplate'
        },
        icon: 'md-albums',
        component: resolve => {
          require(['./components/exec/tmplexec.vue'], resolve)
        }
      },
      {
        path: 'fast',
        name: 'fast',
        title: 'fastJob',
        meta: {
          title: 'fastJob'
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
    title: 'fileManage',
    redirect: '/',
    component: Main,
    children: [
      {
        path: 'file',
        name: 'file',
        title: 'fileManage',
        meta: {
          title: 'fileManage'
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
    title: 'manage',
    redirect: '/user/userlist',
    component: Main,
    children: [
      {
        path: 'userlist',
        name: 'userlist',
        title: 'userManage',
        meta: {
          title: 'userManage'
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
  title: 'mainPage',
  redirect: '/home',
  component: Main,
  children: [
    {
      path: 'home',
      title: 'mainPage',
      meta: {
        title: 'mainPage'
      },
      name: 'mainPage',
      component: resolve => {
        require(['./components/home/home.vue'], resolve)
      }
    }
  ]
}

export const orderDetail = {
  path: '/order',
  name: 'order',
  title: 'order',
  redirect: '/order/orderDetail',
  component: Main,
  children: [
    {
      path: 'orderDetail',
      name: 'orderDetail',
      title: 'orderDetail',
      meta: {
        title: 'orderDetail'
      },
      component: resolve => {
        require(['./components/order/components/orderDetail.vue'], resolve)
      }
    }
  ]
}

export const orderInfo = {
  path: '/orderInfo',
  name: 'orderInfo',
  title: 'orderInfo',
  meta: {
    title: 'orderInfo'
  },
  component: resolve => {
    require(['./components/order/components/orderDetail.vue'], resolve)
  }
}

export const execDetail = {
  path: '/execution',
  name: 'execution',
  title: 'jobExecute',
  // redirect: '/',
  component: Main,
  children: [
    {
      path: 'execDetail',
      name: 'execDetail',
      title: 'execDetail',
      meta: {
        title: 'execDetail'
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
  orderInfo,
  execDetail,
  playbook,
  about,
  test,
  page401,
  page500,
  page404          // 由于路径匹配为/* 这个必须放在最后 否则都定向到这个路由
]
