// 백엔드 동적 생성 경로
import { MockMethod } from 'vite-plugin-mock';

/**
 * roles：페이지 레벨 권한. 여기에서는 "admin", "common" 두 종류를 시뮬레이션합니다.
 * admin: 관리자 권한
 * common: 일반 사용자
 */

const permissionRouter = {
  path: '/permission',
  meta: {
    title: '권한 관리',
    icon: 'lollipop',
    rank: 10,
  },
  children: [
    {
      path: '/permission/page/index',
      name: 'PermissionPage',
      meta: {
        title: '페이지 권한',
        roles: ['admin', 'common'],
      },
    },
    {
      path: '/permission/button/index',
      name: 'PermissionButton',
      meta: {
        title: '버튼 권한',
        roles: ['admin', 'common'],
        auths: ['btn_add', 'btn_edit', 'btn_delete'],
      },
    },
  ],
};

export default [
  {
    url: '/getAsyncRoutes',
    method: 'get',
    response: () => {
      return {
        success: true,
        data: [permissionRouter],
      };
    },
  },
] as MockMethod[];
