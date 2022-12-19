const Layout = () => import('@/layout/index.vue');

export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '로그인',
      showLink: false,
      rank: 101,
    },
  },
  {
    path: '/redirect',
    component: Layout,
    meta: {
      icon: 'homeFilled',
      title: '메인화면',
      showLink: false,
      rank: 104,
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/layout/redirect.vue'),
      },
    ],
  },
] as Array<RouteConfigsTable>;
