import { http } from '@/utils/http';

export type UserResult = {
  success: boolean;
  data: {
    /** 아이디 */
    email: string;
    /** 현재 로그인한 사용자의 권한 */
    roles: Array<string>;
    /** `token` */
    accessToken: string;
    /** `accessToken`을 새로 고치는 인터페이스를 호출할 때 필요한 `token` */
    refreshToken: string;
    /** `accessToken` 의 만료 시간 ('xxxx/xx/xx:xx:xx' 형식) */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** `accessToken`을 새로 고치는 인터페이스를 호출할 때 필요한 `token` */
    refreshToken: string;
    /** `accessToken` 의 만료 시간 ('xxxx/xx/xx:xx:xx' 형식) */
    expires: Date;
  };
};

/** 로그인 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>('post', '/auth/login', { data });
};

/** 토큰 새로 고침 */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>('post', '/refreshToken', { data });
};
