import Cookies from 'js-cookie';
import { storageSession } from '@pureadmin/utils';
import { useUserStoreHook } from '@/store/modules/user';

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`의 만료 시간(타임스탬프) */
  expires: T;
  /** 액세스 토큰을 새로 고치는 데 필요한 인터페이스 */
  refreshToken: string;
  /** 아이디 */
  username?: string;
  /** 현재 로그인한 사용자의 권한 */
  roles?: Array<string>;
}

export const sessionKey = 'user-info';
export const TokenKey = 'authorized-token';

/** `token` 획득 */
export function getToken(): DataInfo<number> {
  // 여기서는 `TokenKey`와 같으며, 이 쓰기는 초기화를 해결할 때 `Cookies`에 `TokenKey` 에 오류가 없습니다.
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageSession().getItem(sessionKey);
}

/**
 * @description `token` 및 필요한 정보를 설정
 */
export function setToken(data: DataInfo<Date>) {
  let expires = 0;
  const { accessToken, refreshToken } = data;
  expires = new Date(data.expires).getTime(); // 백엔드에서 직접 타임스탬프를 설정하면, 여기 코드를 expires = data.expires로 변경하고, 위의 DataInfo<Date>를 DataInfo<number>로 변경하시면 됩니다.
  const cookieString = JSON.stringify({ accessToken, expires });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: (expires - Date.now()) / 86400000,
      })
    : Cookies.set(TokenKey, cookieString);

  function setSessionKey(username: string, roles: Array<string>) {
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_ROLES(roles);
    storageSession().setItem(sessionKey, {
      refreshToken,
      expires,
      username,
      roles,
    });
  }

  if (data.username && data.roles) {
    const { username, roles } = data;
    setSessionKey(username, roles);
  } else {
    const username = storageSession().getItem<DataInfo<number>>(sessionKey)?.username ?? '';
    const roles = storageSession().getItem<DataInfo<number>>(sessionKey)?.roles ?? [];
    setSessionKey(username, roles);
  }
}

/** `token` 및 key 값이 `user-info`인 session 정보를 삭제하다 */
export function removeToken() {
  Cookies.remove(TokenKey);
  sessionStorage.clear();
}

/** 토큰 포맷(jwt 형식) */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token;
};
