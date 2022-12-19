const Layout = () => import('@/layout/index.vue');

export default {
  path: '/',
  name: 'Home',
  component: Layout,
  redirect: '/welcome',
  meta: {
    icon: 'homeFilled',
    title: '메인 화면',
    rank: 0,
  },
  children: [
    {
      path: '/welcome',
      name: 'Welcome',
      component: () => import('@/views/welcome/index.vue'),
      meta: {
        title: '메인 화면',
      },
    },
  ],
} as RouteConfigsTable;
