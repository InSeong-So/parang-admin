import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { getConfig } from '@/config';
import { emitter } from '@/utils/mitt';
import { routeMetaType } from '../types';
import { useGlobal } from '@pureadmin/utils';
import { useRouter, useRoute } from 'vue-router';
import { router, remainingPaths } from '@/router';
import { useAppStoreHook } from '@/store/modules/app';
import { useUserStoreHook } from '@/store/modules/user';
import { usePermissionStoreHook } from '@/store/modules/permission';

const errorInfo = '当前路由配置不正确，请检查配置';

export function useNav() {
  const route = useRoute();
  const pureApp = useAppStoreHook();
  const routers = useRouter().options.routes;
  const { wholeMenus } = storeToRefs(usePermissionStoreHook());
  /** 플랫폼 `layout`의 모든 `el-tooltip`의 `effect` 사양, 기본 `light` */
  const tooltipEffect = getConfig()?.TooltipEffect ?? 'light';

  /** 아이디 */
  const email = computed(() => {
    return useUserStoreHook()?.email;
  });

  const avatarsStyle = computed(() => {
    return email.value ? { marginRight: '10px' } : '';
  });

  const isCollapse = computed(() => {
    return !pureApp.getSidebarStatus;
  });

  const device = computed(() => {
    return pureApp.getDevice;
  });

  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();
  const layout = computed(() => {
    return $storage?.layout?.layout;
  });

  const title = computed(() => {
    return $config.Title;
  });

  /** 동적 title */
  function changeTitle(meta: routeMetaType) {
    const Title = getConfig().Title;
    if (Title) document.title = `${meta.title} | ${Title}`;
    else document.title = meta.title;
  }

  /** 로그아웃 */
  function logout() {
    useUserStoreHook().logOut();
  }

  function backHome() {
    router.push('/welcome');
  }

  function onPanel() {
    emitter.emit('openPanel');
  }

  function toggleSideBar() {
    pureApp.toggleSideBar();
  }

  function handleResize(menuRef) {
    menuRef?.handleResize();
  }

  function resolvePath(route) {
    if (!route.children) return console.error(errorInfo);
    const httpReg = /^http(s?):\/\//;
    const routeChildPath = route.children[0]?.path;
    if (httpReg.test(routeChildPath)) {
      return route.path + '/' + routeChildPath;
    } else {
      return routeChildPath;
    }
  }

  function menuSelect(indexPath: string, routers): void {
    if (wholeMenus.value.length === 0) return;
    if (isRemaining(indexPath)) return;
    let parentPath = '';
    const parentPathIndex = indexPath.lastIndexOf('/');
    if (parentPathIndex > 0) {
      parentPath = indexPath.slice(0, parentPathIndex);
    }
    /** 현재 경로 정보를 찾습니다 */
    function findCurrentRoute(indexPath: string, routes) {
      if (!routes) return console.error(errorInfo);
      return routes.map((item) => {
        if (item.path === indexPath) {
          if (item.redirect) {
            findCurrentRoute(item.redirect, item.children);
          } else {
            /** 왼쪽 메뉴 알림 탭 전환 */
            emitter.emit('changLayoutRoute', {
              indexPath,
              parentPath,
            });
          }
        } else {
          if (item.children) findCurrentRoute(indexPath, item.children);
        }
      });
    }
    findCurrentRoute(indexPath, routers);
  }

  /** 경로 참여 여부 판단 메뉴 */
  function isRemaining(path: string): boolean {
    return remainingPaths.includes(path);
  }

  return {
    route,
    title,
    device,
    layout,
    logout,
    routers,
    $storage,
    backHome,
    onPanel,
    changeTitle,
    toggleSideBar,
    menuSelect,
    handleResize,
    resolvePath,
    isCollapse,
    pureApp,
    email,
    avatarsStyle,
    tooltipEffect,
  };
}
