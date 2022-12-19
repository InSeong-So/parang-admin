import { MockMethod } from 'vite-plugin-mock';

// 토큰 인터페이스 시뮬레이트
export default [
  {
    url: '/refreshToken',
    method: 'post',
    response: ({ body }) => {
      if (body.refreshToken) {
        return {
          success: true,
          data: {
            accessToken: 'eyJhbGciOiJIUzUxMiJ9.newAdmin',
            refreshToken: 'eyJhbGciOiJIUzUxMiJ9.newAdminRefresh',
            // `expires`는 디버깅을 용이하게 하기 위해 이 날짜 형식을 선택했으며,
            // 백엔드에서 직접 타임스탬프를 설정하는 것이 더 편리할 수 있습니다(매번 증가해야 합니다).
            // 백엔드가 타임스탬프 포맷으로 되돌아갔다면, 프론트 개발은 이 디렉토리 `src/utils/auth.ts`로 와서 `38`번째 줄의 코드를 expires = data.expires로 바꾸면 됩니다.
            expires: '2023/10/30 23:59:59',
          },
        };
      } else {
        return {
          success: false,
          data: {},
        };
      }
    },
  },
] as MockMethod[];
