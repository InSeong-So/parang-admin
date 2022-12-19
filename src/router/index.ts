// import "@/utils/sso";
import { getConfig } from '@/config';
import NProgress from '@/utils/progress';
import { sessionKey, type DataInfo } from '@/utils/auth';
import { useMultiTagsStoreHook } from '@/store/modules/multiTags';
import { usePermissionStoreHook } from '@/store/modules/permission';
import { Router, createRouter, RouteRecordRaw, RouteComponent } from 'vue-router';
import {
  ascending,
  initRouter,
  isOneOfArray,
  getHistoryMode,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
} from './utils';
import { buildHierarchyTree } from '@/utils/tree';
import { isUrl, openLink, storageSession } from '@pureadmin/utils';

import remainingRouter from './modules/remaining';

/**
 * 수동으로 가져올 필요 없이 모든 정적 경로를 자동으로 가져옵니다.
 * src/router/modules 디렉터리에 .ts 확장자가 있는 모든 파일, remaining.ts 파일을 제외한 모든 파일
 * 모든 파일을 일치시키는 방법은 https://github.com/mrmlnc/fast-glob#basic-syntax를 참조하십시오.
 * 파일 제외 방법: https://vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ['./modules/**/*.ts', '!./modules/**/remaining.ts'],
  {
    eager: true,
  },
);

/** 원래 정적 경로 (아무것도 처리되지 않음) */
const routes = [];

Object.keys(modules).forEach((key) => {
  routes.push(modules[key].default);
});

/** 처리된 정적 라우팅 내보내기(3단계 이상의 라우팅은 모두 2단계로 촬영) */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes))),
);

/** 메뉴를 렌더링할 때 사용합니다. 원래 계층은 그대로 사용 */
export const constantMenus: Array<RouteComponent> = ascending(routes).concat(...remainingRouter);

/** 메뉴에 참여하지 않는 경로 */
export const remainingPaths = Object.keys(remainingRouter).map((v) => {
  return remainingRouter[v].path;
});

/** 경로 인스턴스 만들기 */
export const router: Router = createRouter({
  history: getHistoryMode(),
  routes: constantRoutes.concat(...(remainingRouter as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number = document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  },
});

/** 경로 재설정 */
export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name);
      router.options.routes = formatTwoStageRoutes(
        formatFlatteningRoutes(buildHierarchyTree(ascending(routes))),
      );
    }
  });
  usePermissionStoreHook().clearAllCachePage();
}

/** 라우팅 화이트리스트 */
const whiteList = ['/login'];

router.beforeEach((to: toRouteType, _from, next) => {
  if (to.meta?.keepAlive) {
    const newMatched = to.matched;
    handleAliveRoute(newMatched, 'add');
    // 페이지 전체 새로 고침 및 탭 새로 고침
    if (_from.name === undefined || _from.name === 'Redirect') {
      handleAliveRoute(newMatched);
    }
  }
  const userInfo = storageSession().getItem<DataInfo<number>>(sessionKey);
  NProgress.start();
  const externalLink = isUrl(to?.name as string);
  if (!externalLink) {
    to.matched.some((item) => {
      if (!item.meta.title) return '';
      const Title = getConfig().Title;
      if (Title) document.title = `${item.meta.title} | ${Title}`;
      else document.title = item.meta.title as string;
    });
  }
  /** 이미 로그인되어 있고 로그인 정보가 있는 경우 라우팅 화이트리스트로 이동할 수 없으며 현재 페이지로 계속 유지됩니다. */
  function toCorrectRoute() {
    whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
  }
  if (userInfo) {
    // 권한이 없다면 403 페이지로 이동
    if (to.meta?.roles && !isOneOfArray(to.meta?.roles, userInfo?.roles)) {
      next({ path: '/error/403' });
    }
    if (_from?.name) {
      // name은 하이퍼링크입니다.
      if (externalLink) {
        openLink(to?.name as string);
        NProgress.done();
      } else {
        toCorrectRoute();
      }
    } else {
      // 갱신
      if (usePermissionStoreHook().wholeMenus.length === 0 && to.path !== '/login')
        initRouter().then((router: Router) => {
          if (!useMultiTagsStoreHook().getMultiTagsCache) {
            const { path } = to;
            const route = findRouteByPath(path, router.options.routes[0].children);
            // query, params 모드 라우팅 매개 변수 탭은 여기에서 처리되지 않습니다.
            if (route && route.meta?.title) {
              useMultiTagsStoreHook().handleTags('push', {
                path: route.path,
                name: route.name,
                meta: route.meta,
              });
            }
          }
          router.push(to.fullPath);
        });
      toCorrectRoute();
    }
  } else {
    if (to.path !== '/login') {
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        next({ path: '/login' });
      }
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
