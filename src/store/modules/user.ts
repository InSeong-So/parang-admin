import { defineStore } from 'pinia';
import { store } from '@/store';
import { userType } from './types';
import { routerArrays } from '@/layout/types';
import { router, resetRouter } from '@/router';
import { storageSession } from '@pureadmin/utils';
import { getLogin, refreshTokenApi } from '@/api/user';
import { UserResult, RefreshTokenResult } from '@/api/user';
import { useMultiTagsStoreHook } from '@/store/modules/multiTags';
import { type DataInfo, setToken, removeToken, sessionKey } from '@/utils/auth';

export const useUserStore = defineStore({
  id: 'pure-user',
  state: (): userType => ({
    // 아이디
    username: storageSession().getItem<DataInfo<number>>(sessionKey)?.username ?? '',
    // 페이지 권한
    roles: storageSession().getItem<DataInfo<number>>(sessionKey)?.roles ?? [],
  }),
  actions: {
    /** 사용자 이름 저장 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 사용자 권한 저장 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 로그인 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then((data) => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /** 프런트엔드 로그아웃 (인터페이스 호출 안 함) */
    logOut() {
      this.username = '';
      this.roles = [];
      removeToken();
      useMultiTagsStoreHook().handleTags('equal', [...routerArrays]);
      resetRouter();
      console.log('???');
      router.push('/login');
    },
    /** `token` 갱신 */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then((data) => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export function useUserStoreHook() {
  return useUserStore(store);
}
