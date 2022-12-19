// 권한별 동적 경로 생성
import { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/login',
    method: 'post',
    response: ({ body }) => {
      if (body.username === 'admin') {
        return {
          success: true,
          data: {
            username: 'admin',
            // 한 사용자가 여러 개의 역할을 가질 수 있습니다.
            roles: ['admin'],
            accessToken: 'eyJhbGciOiJIUzUxMiJ9.admin',
            refreshToken: 'eyJhbGciOiJIUzUxMiJ9.adminRefresh',
            expires: '2023/10/30 00:00:00',
          },
        };
      } else {
        return {
          success: true,
          data: {
            username: 'common',
            // 한 사용자가 여러 개의 역할을 가질 수 있습니다.
            roles: ['common'],
            accessToken: 'eyJhbGciOiJIUzUxMiJ9.common',
            refreshToken: 'eyJhbGciOiJIUzUxMiJ9.commonRefresh',
            expires: '2023/10/30 00:00:00',
          },
        };
      }
    },
  },
] as MockMethod[];
