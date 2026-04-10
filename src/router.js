import { createRouter, createWebHistory } from 'vue-router'
import Main from './components/main/main.vue'
// 以下的title不是原始值，只作为变量在实际渲染时再翻译

export const page404 = {
  path: '/:pathMatch(.*)*',
  name: 'error_404',
  title: '404',
  meta: {
    title: '404-pageNotFound'
  },
  component: () => import('./components/auxi/error/404.vue')
}

export const page401 = {
  path: '/401',
  name: 'error_401',
  title: '401',
  meta: {
    title: '401-Unauthorized '
  },
  component: () => import('./components/auxi/error/401.vue')
}

export const page500 = {
  path: '/500',
  name: 'error_500',
  title: '500',
  meta: {
    title: '500-serverError'
  },
  component: () => import('./components/auxi/error/500.vue')
}

export const about = {
  path: '/about',
  name: 'about',
  title: 'about',
  meta: {
    title: 'about'
  },
  component: () => import('./components/auxi/about.vue')
}

export const test = {
  path: '/test',
  name: 'test',
  title: 'test',
  meta: {
    title: 'test.aaa'
  },
  component: () => import('./components/auxi/test.vue')
}

export const playbook = {
  path: '/playbook',
  name: 'playbook',
  title: 'playbook',
  meta: {
    title: 'playbook'
  },
  component: () => import('./components/auxi/playbook.vue')
}

export const execDetailViewer = {
  path: '/execDetailViewer',
  name: 'execDetailViewer',
  title: 'execDetailViewer',
  meta: {
    title: 'execDetailViewer'
  },
  component: () => import('./components/auxi/execDetailViewer.vue')
}

export const loginRouter = {
  path: '/login',
  name: 'login',
  title: 'login',
  meta: {
    title: 'login'
  },
  component: () => import('./components/main/login.vue')
}

export const locking = {
  path: '/locking',
  name: 'locking',
  title: 'locking',
  component: () => import('./components/auxi/lock.vue')
}

export const orderInfo = {
  path: '/orderInfo',
  name: 'orderInfo',
  title: 'orderInfo',
  meta: {
    title: 'orderInfo'
  },
  component: () => import('./components/order/components/orderDetail.vue')
}

export const appRouter = [
  {
    path: '/order',
    icon: 'md-cart',
    name: 'order',
    title: 'order',
    redirect: '/order/orderList',
    component: Main,
    children: [
      {
        path: 'orderList',
        name: 'orderList',
        title: 'orderList',
        icon: 'md-cart',
        meta: {
          title: 'orderList'
        },
        component: () => import('./components/order/order.vue')
      }
    ]
  },
  {
    path: '/host',
    icon: 'md-laptop',
    title: 'hostManage',
    redirect: '/host/realhost',
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
        component: () => import('./components/host/host.vue')
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
        component: () => import('./components/target/target.vue')
      },
      {
        path: 'host',
        name: 'host',
        title: 'host',
        meta: {
          title: 'host'
        },
        icon: 'md-desktop',
        component: () => import('./components/target/target.vue')
      },
      {
        path: 'server',
        name: 'server',
        title: 'server',
        meta: {
          title: 'server'
        },
        icon: 'md-code',
        component: () => import('./components/target/target.vue')
      },
      {
        path: 'cluster',
        name: 'cluster',
        title: 'cluster',
        meta: {
          title: 'cluster'
        },
        icon: 'md-grid',
        component: () => import('./components/target/target.vue')
      },
      {
        path: 'container',
        name: 'container',
        title: 'container',
        meta: {
          title: 'container'
        },
        icon: 'md-apps',
        component: () => import('./components/target/target.vue')
      }
    ]
  },
  {
    path: '/execution',
    icon: 'md-cog',
    name: 'execution',
    title: 'execution',
    redirect: '/execution/exec',
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
        component: () => import('./components/exec/exec.vue')
      },
      {
        path: 'tmpl',
        name: 'tmpl',
        title: 'jobTmplate',
        meta: {
          title: 'jobTmplate'
        },
        icon: 'md-albums',
        component: () => import('./components/exec/tmplexec.vue')
      },
      {
        path: 'fast',
        name: 'fast',
        title: 'fastJob',
        meta: {
          title: 'fastJob'
        },
        icon: 'md-plane',
        component: () => import('./components/exec/fast.vue')
      }
    ]
  },
  {
    path: '/file',
    icon: 'md-briefcase',
    title: 'fileManage',
    redirect: '/file/file',
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
        component: () => import('./components/file/file.vue')
      }
    ]
  },
  {
    path: '/user',
    icon: 'md-people',
    name: 'user',
    title: 'userManage',
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
        component: () => import('./components/user/userInfo.vue')
      }
    ]
  }
]

export const home = {
  path: '/',
  name: 'home',
  title: 'home',
  redirect: '/mainPage',
  component: Main,
  children: [
    {
      path: 'mainPage',
      title: 'mainPage',
      meta: {
        title: 'mainPage'
      },
      name: 'mainPage',
      component: () => import('./components/home/home.vue')
    }
  ]
}

export const orderDetail = {
  path: '/order',
  title: 'order',
  component: Main,
  children: [
    {
      path: 'orderDetail',
      name: 'orderDetail',
      title: 'orderDetail',
      meta: {
        title: 'orderDetail'
      },
      component: () => import('./components/order/components/orderDetail.vue')
    }
  ]
}

export const execDetail = {
  path: '/execution',
  title: 'execution',
  component: Main,
  children: [
    {
      path: 'execDetail',
      name: 'execDetail',
      title: 'execDetail',
      meta: {
        title: 'execDetail'
      },
      component: () => import('./components/exec/components/execDetail.vue')
    }
  ]
}

const MainRoute = [
  home,
  loginRouter,
  locking,
  ...appRouter,    // 将一个数组转为用逗号分隔的参数序列
  orderDetail,
  orderInfo,
  execDetail,
  playbook,
  execDetailViewer,
  about,
  test,
  page401,
  page500,
  page404          // 由于路径匹配为/* 这个必须放在最后 否则都定向到这个路由
]

const router = createRouter({
  history: createWebHistory(), // 对应 mode: 'history'
  routes: MainRoute
})

export { router }
