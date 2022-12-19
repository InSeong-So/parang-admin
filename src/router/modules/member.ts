// 가장 간단한 코드, 즉 이 필드들은 반드시 있어야 한다.
export default {
  path: '/member',
  meta: {
    title: '회원 관리',
    icon: 'ant-design:team-outlined',
  },
  children: [
    {
      path: '/member/index',
      name: 'Member',
      component: () => import('@/views/member/index.vue'),
      meta: {
        title: '회원 목록',
        // showParent를 true로 설정하여 부모 표시
        showParent: true,
      },
    },
    {
      path: '/member/score',
      name: 'UserScore',
      component: () => import('@/views/member/user_score.vue'),
      meta: {
        title: '포인트 관리',
        // showParent를 true로 설정하여 부모 표시
        showParent: true,
      },
    },
  ],
};
