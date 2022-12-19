import { defineStore } from 'pinia';
import { store } from '@/store';
import { cacheType } from './types';
import { constantMenus } from '@/router';
import { ascending, filterTree, filterNoPermissionTree } from '@/router/utils';

export const usePermissionStore = defineStore({
  id: 'pure-permission',
  state: () => ({
    // 정적 경로 생성 메뉴
    constantMenus,
    // 전체 라우팅 생성 메뉴(정적, 동적)
    wholeMenus: [],
    // 캐시 페이지 keepAlive
    cachePageList: [],
  }),
  actions: {
    /** 전체 경로 생성 메뉴 조립하기 */
    handleWholeMenus(routes: any[]) {
      this.wholeMenus = filterNoPermissionTree(
        filterTree(ascending(this.constantMenus.concat(routes))),
      );
    },
    cacheOperate({ mode, name }: cacheType) {
      switch (mode) {
        case 'add':
          this.cachePageList.push(name);
          this.cachePageList = [...new Set(this.cachePageList)];
          break;
        case 'delete':
          // eslint-disable-next-line no-case-declarations
          const delIndex = this.cachePageList.findIndex((v) => v === name);
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
          break;
      }
    },
    /** 캐시 페이지 비우기 */
    clearAllCachePage() {
      this.wholeMenus = [];
      this.cachePageList = [];
    },
  },
});

export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
