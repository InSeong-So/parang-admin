// 가장 간단한 코드, 즉 이 필드들은 반드시 있어야 한다.
export default {
  path: '/member',
  meta: {
    title: '유저 관리',
    icon: 'ant-design:team-outlined',
  },
  children: [
    {
      path: '/member',
      name: 'Member',
      component: () => import('@/views/member/index.vue'),
      meta: {
        title: '유저 전체 조회',
        // showParent를 true로 설정하여 부모 표시
        showParent: true,
      },
    },
    {
      path: '/member/detail',
      name: 'MemberDetail',
      component: () => import('@/views/member/detail.vue'),
      meta: {
        title: '유저 상세 조회',
        // showParent를 true로 설정하여 부모 표시
        showParent: true,
      },
    },
    {
      path: '/member/certificate',
      name: 'MemberCertificate',
      component: () => import('@/views/member/certificate.vue'),
      meta: {
        title: '자격증 승인 관리',
        // showParent를 true로 설정하여 부모 표시
        showParent: true,
      },
    },
  ],
};
