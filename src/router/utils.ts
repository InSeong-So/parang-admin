import {
  RouterHistory,
  RouteRecordRaw,
  RouteComponent,
  createWebHistory,
  createWebHashHistory,
  RouteRecordNormalized,
} from 'vue-router';
import { router } from './index';
import { isProxy, toRaw } from 'vue';
import { loadEnv } from '../../build';
import { useTimeoutFn } from '@vueuse/core';
import { RouteConfigs } from '@/layout/types';
import {
  isString,
  cloneDeep,
  isAllEmpty,
  intersection,
  storageSession,
  isIncludeAllChildren,
} from '@pureadmin/utils';
import { getConfig } from '@/config';
import { buildHierarchyTree } from '@/utils/tree';
import { sessionKey, type DataInfo } from '@/utils/auth';
import { usePermissionStoreHook } from '@/store/modules/permission';
const IFrame = () => import('@/layout/frameView.vue');
// https://vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob('/src/views/**/*.{vue,tsx}');

// 동적 라우팅
import { getAsyncRoutes } from '@/api/routes';

function handRank(routeInfo: any) {
  const { name, path, parentId, meta } = routeInfo;
  return isAllEmpty(parentId)
    ? isAllEmpty(meta?.rank) || (meta?.rank === 0 && name !== 'Home' && path !== '/')
      ? true
      : false
    : false;
}

/** 라우팅 중 meta 아래의 rank 등급 오름차순에 따라 라우팅 순서를 정렬합니다. */
function ascending(arr: any[]) {
  arr.forEach((v, index) => {
    // rank가 존재하지 않을 때, 순서에 따라 자동으로 생성되며, 첫 화면 라우팅은 항상 1위입니다.
    if (handRank(v)) v.meta.rank = index + 2;
  });
  return arr.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
    return a?.meta.rank - b?.meta.rank;
  });
}

/** meta에서 showLink를 false로 필터링하는 메뉴 */
function filterTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter(
    (v: { meta: { showLink: boolean } }) => v.meta?.showLink !== false,
  );
  newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)));
  return newTree;
}

/**
 * children 길이가 0인 디렉터리를 필터링합니다.
 * 디렉터리에 메뉴가 없을 때 이 디렉터리를 필터링합니다.
 * 디렉터리에 roles 권한이 부여되지 않습니다.
 * 디렉터리에 메뉴에 액세스할 수 있는 권한이 하나라도 있으면 이 디렉터리가 표시됩니다.
 **/
function filterChildrenTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter((v: any) => v?.children?.length !== 0);
  newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)));
  return newTree;
}

/** 두 배열이 서로 같은 값이 있는지 여부를 판단합니다. */
function isOneOfArray(a: Array<string>, b: Array<string>) {
  return Array.isArray(a) && Array.isArray(b)
    ? intersection(a, b).length > 0
      ? true
      : false
    : true;
}

/** sessionStorage에서 현재 로그인한 사용자의 역할 roles를 꺼내 권한 없는 메뉴 필터링 */
function filterNoPermissionTree(data: RouteComponent[]) {
  const currentRoles = storageSession().getItem<DataInfo<number>>(sessionKey)?.roles ?? [];
  const newTree = cloneDeep(data).filter((v: any) => isOneOfArray(v.meta?.roles, currentRoles));
  newTree.forEach((v: any) => v.children && (v.children = filterNoPermissionTree(v.children)));
  return filterChildrenTree(newTree);
}

/** 캐시 경로 일괄 삭제(keepalive) */
function delAliveRoutes(delAliveRouteList: Array<RouteConfigs>) {
  delAliveRouteList.forEach((route) => {
    usePermissionStoreHook().cacheOperate({
      mode: 'delete',
      name: route?.name,
    });
  });
}

/** path를 통해 부모 경로 가져오기 */
function getParentPaths(path: string, routes: RouteRecordRaw[]) {
  function dfs(routes: RouteRecordRaw[], path: string, parents: string[]) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      // path를 찾으면 부모 path로 돌아가기
      if (item.path === path) return parents;
      // children이 없거나 비어 있으면 재귀하지 않음
      if (!item.children || !item.children.length) continue;
      // children이 있다면 현재 path를 스택에 넣습니다
      parents.push(item.path);

      if (dfs(item.children, path, parents).length) return parents;
      // 찾을 수 없을 때 현재 path 스택을 찾습니다.
      parents.pop();
    }
    // 찾을 수 없을 때 빈 배열로 돌아갑니다.
    return [];
  }

  return dfs(routes, path, []);
}

/** path에 해당하는 경로 정보 찾기 */
function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  let res = routes.find((item: { path: string }) => item.path == path);
  if (res) {
    return isProxy(res) ? toRaw(res) : res;
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].children instanceof Array && routes[i].children.length > 0) {
        res = findRouteByPath(path, routes[i].children);
        if (res) {
          return isProxy(res) ? toRaw(res) : res;
        }
      }
    }
    return null;
  }
}

function addPathMatch() {
  if (!router.hasRoute('pathMatch')) {
    router.addRoute({
      path: '/:pathMatch(.*)',
      name: 'pathMatch',
      redirect: '/error/404',
    });
  }
}

/** 동적 라우팅 처리(백엔드에서 되돌아오는 라우팅) */
function handleAsyncRoutes(routeList) {
  if (routeList.length === 0) {
    usePermissionStoreHook().handleWholeMenus(routeList);
  } else {
    formatFlatteningRoutes(addAsyncRoutes(routeList)).map((v: RouteRecordRaw) => {
      // 중복 경로 추가 방지
      if (router.options.routes[0].children.findIndex((value) => value.path === v.path) !== -1) {
        return;
      } else {
        // 라우팅을 push에서 routes로 한 후에 addRoute를 사용해야 정상적으로 이동할 수 있다는 것을 명심하세요.
        router.options.routes[0].children.push(v);
        // 최종 경로 오름차순
        ascending(router.options.routes[0].children);
        if (!router.hasRoute(v?.name)) router.addRoute(v);
        const flattenRouters: any = router.getRoutes().find((n) => n.path === '/');
        router.addRoute(flattenRouters);
      }
    });
    usePermissionStoreHook().handleWholeMenus(routeList);
  }
  addPathMatch();
}

/** 경로 초기화(`new Promise`) 비동기 요청 시 무한 루프가 발생하지 않도록 쓰기 */
function initRouter() {
  if (getConfig()?.CachingAsyncRoutes) {
    // 동적 라우팅 로컬 sessionStorage 열기
    const key = 'async-routes';
    const asyncRouteList = storageSession().getItem(key) as any;
    if (asyncRouteList && asyncRouteList?.length > 0) {
      return new Promise((resolve) => {
        handleAsyncRoutes(asyncRouteList);
        resolve(router);
      });
    } else {
      return new Promise((resolve) => {
        getAsyncRoutes().then(({ data }) => {
          handleAsyncRoutes(cloneDeep(data));
          storageSession().setItem(key, data);
          resolve(router);
        });
      });
    }
  } else {
    return new Promise((resolve) => {
      getAsyncRoutes().then(({ data }) => {
        handleAsyncRoutes(cloneDeep(data));
        resolve(router);
      });
    });
  }
}

/**
 * 다단계 중첩 경로를 1차원 배열로 처리
 * @param routesList 수신 경로
 * @returns 처리된 1Depth 경로로 돌아가기
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  let hierarchyList = buildHierarchyTree(routesList);
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList
        .slice(0, i + 1)
        .concat(hierarchyList[i].children, hierarchyList.slice(i + 1));
    }
  }
  return hierarchyList;
}

/**
 * 1차원 배열은 다단계 중첩 배열로 처리한다(3단계 이상의 라우팅은 모두 2단계로 촬영하고 keep-alive는 2단계 캐시까지만 지원)
 * https://github.com/xiaoxian521/vue-pure-admin/issues/67
 * @param routesList 처리된 1D 라우팅 메뉴 배열
 * @returns 1D 배열을 지정된 경로로 재처리하는 형식을 반환합니다
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === '/') {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: [],
      });
    } else {
      newRoutesList[0]?.children.push({ ...v });
    }
  });
  return newRoutesList;
}

/** 캐시 경로 처리 (추가, 삭제, 새로 고침) */
function handleAliveRoute(matched: RouteRecordNormalized[], mode?: string) {
  switch (mode) {
    case 'add':
      matched.forEach((v) => {
        usePermissionStoreHook().cacheOperate({ mode: 'add', name: v.name });
      });
      break;
    case 'delete':
      usePermissionStoreHook().cacheOperate({
        mode: 'delete',
        name: matched[matched.length - 1].name,
      });
      break;
    default:
      usePermissionStoreHook().cacheOperate({
        mode: 'delete',
        name: matched[matched.length - 1].name,
      });
      useTimeoutFn(() => {
        matched.forEach((v) => {
          usePermissionStoreHook().cacheOperate({ mode: 'add', name: v.name });
        });
      }, 100);
  }
}

/** 백엔드에서 오는 동적 라우팅 필터링 규격 라우팅 재생성 */
function addAsyncRoutes(arrRoutes: Array<RouteRecordRaw>) {
  if (!arrRoutes || !arrRoutes.length) return;
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  arrRoutes.forEach((v: RouteRecordRaw) => {
    // backstage 속성을 meta에 추가하여 백엔드 리턴 경로로 표시
    v.meta.backstage = true;
    // 부모 redirect 속성 값: 만약 자녀가 존재하고 부모 redirect 속성이 존재하지 않는다면, 기본값은 첫 번째 자녀의 path입니다. 자녀가 존재하고 부모 redirect 속성이 존재한다면, 존재하는 redirect 속성을 가져오면 기본값은 덮어씁니다.
    if (v?.children && v.children.length && !v.redirect) v.redirect = v.children[0].path;
    // 부모 name 속성 값을 가져옵니다. 자녀가 존재하고 부모 name 속성이 존재하지 않는 경우 기본값은 첫 번째 자녀입니다. 자녀가 존재하고 부모 name 속성이 존재하는 경우 기본값은 덮어씁니다. (참고: 부모 name이 테스트 중에 자녀 name과 중복될 수 없습니다. 중복되면 리디렉션되지 않습니다(점프 404). 여기서 부모 name 이름을 붙일 때 뒤에 자동으로 `Parent`가 붙습니다. 중복되지 않습니다.)
    if (v?.children && v.children.length && !v.name)
      v.name = (v.children[0].name as string) + 'Parent';
    if (v.meta?.frameSrc) {
      v.component = IFrame;
    } else {
      // 백엔드 컴포넌트 경로와 백엔드 컴포넌트 경로의 호환(백엔드 컴포넌트 경로의 경우 path는 자유롭게 쓸 수 있으며, 전송하지 않을 경우 컴포넌트 경로는 path와 일치합니다.
      const index = v?.component
        ? modulesRoutesKeys.findIndex((ev) => ev.includes(v.component as any))
        : modulesRoutesKeys.findIndex((ev) => ev.includes(v.path));
      v.component = modulesRoutes[modulesRoutesKeys[index]];
    }
    if (v?.children && v.children.length) {
      addAsyncRoutes(v.children);
    }
  });
  return arrRoutes;
}

/** 경로 기록 모드 가져오기 https://next.router.vuejs.org/guide/essentials/history-mode.html */
function getHistoryMode(): RouterHistory {
  const routerHistory = loadEnv().VITE_ROUTER_HISTORY;
  // len은 1입니다. 과거 모드만 2입니다. 과거 모드에 base 인자가 있음을 나타냅니다. https://next.router.vuejs.org/api/#%E5%8F%82%E6%95%B0-1
  const historyMode = routerHistory.split(',');
  const leftMode = historyMode[0];
  const rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === 'hash') {
      return createWebHashHistory('');
    } else if (leftMode === 'h5') {
      return createWebHistory('');
    }
  } // has param
  else if (historyMode.length === 2) {
    if (leftMode === 'hash') {
      return createWebHashHistory(rightMode);
    } else if (leftMode === 'h5') {
      return createWebHistory(rightMode);
    }
  }
}

/** 현재 페이지 버튼의 권한을 가져옵니다 */
function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

/** 버튼 권한이 있는지 여부 */
function hasAuth(value: string | Array<string>): boolean {
  if (!value) return false;
  /** 현재 경로의 `meta` 필드에서 버튼 수준의 모든 사용자 정의 `code` 값을 가져옵니다. */
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  const isAuths = isString(value)
    ? metaAuths.includes(value)
    : isIncludeAllChildren(value, metaAuths);
  return isAuths ? true : false;
}

export {
  hasAuth,
  getAuths,
  ascending,
  filterTree,
  initRouter,
  isOneOfArray,
  getHistoryMode,
  addAsyncRoutes,
  delAliveRoutes,
  getParentPaths,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
  filterNoPermissionTree,
};
