<script setup lang="ts">
import { emitter } from '@/utils/mitt';
import { RouteConfigs } from '../../types';
import { useTags } from '../../hooks/useTag';
import { routerArrays } from '@/layout/types';
import { isEqual, isAllEmpty } from '@pureadmin/utils';
import { useSettingStoreHook } from '@/store/modules/settings';
import { ref, watch, unref, nextTick, onBeforeMount } from 'vue';
import { handleAliveRoute, delAliveRoutes } from '@/router/utils';
import { useMultiTagsStoreHook } from '@/store/modules/multiTags';
import { useResizeObserver, useDebounceFn, useFullscreen } from '@vueuse/core';

import ExitFullscreen from '@iconify-icons/ri/fullscreen-exit-fill';
import Fullscreen from '@iconify-icons/ri/fullscreen-fill';
import ArrowDown from '@iconify-icons/ri/arrow-down-s-line';
import ArrowRightSLine from '@iconify-icons/ri/arrow-right-s-line';
import ArrowLeftSLine from '@iconify-icons/ri/arrow-left-s-line';
import CloseBold from '@iconify-icons/ep/close-bold';

const {
  route,
  router,
  visible,
  showTags,
  instance,
  multiTags,
  tagsViews,
  buttonTop,
  buttonLeft,
  showModel,
  translateX,
  pureSetting,
  activeIndex,
  getTabStyle,
  iconIsActive,
  linkIsActive,
  currentSelect,
  scheduleIsActive,
  getContextMenuStyle,
  closeMenu,
  onMounted,
  onMouseenter,
  onMouseleave,
  onContentFullScreen,
} = useTags();

const tabDom = ref();
const containerDom = ref();
const scrollbarDom = ref();
const isShowArrow = ref(false);
const { isFullscreen, toggle } = useFullscreen();

const dynamicTagView = () => {
  const index = multiTags.value.findIndex((item) => {
    if (item.query) {
      return isEqual(route.query, item.query);
    } else if (item.params) {
      return isEqual(route.params, item.params);
    } else {
      return item.path === route.path;
    }
  });
  moveToView(index);
};

const moveToView = (index: number): void => {
  const tabNavPadding = 10;
  if (!instance.refs['dynamic' + index]) return;
  const tabItemEl = instance.refs['dynamic' + index][0];
  const tabItemElOffsetLeft = (tabItemEl as HTMLElement)?.offsetLeft;
  const tabItemOffsetWidth = (tabItemEl as HTMLElement)?.offsetWidth;
  // 탭 네비게이션 바 보기 길이 (오버플로 부분은 제외)
  const scrollbarDomWidth = scrollbarDom.value ? scrollbarDom.value?.offsetWidth : 0;
  // 기존 탭 길이 (오버플로 포함)
  const tabDomWidth = tabDom.value ? tabDom.value?.offsetWidth : 0;
  scrollbarDomWidth <= tabDomWidth ? (isShowArrow.value = true) : (isShowArrow.value = false);
  if (tabDomWidth < scrollbarDomWidth || tabItemElOffsetLeft === 0) {
    translateX.value = 0;
  } else if (tabItemElOffsetLeft < -translateX.value) {
    // 탭은 보이는 영역의 왼쪽에 있습니다
    translateX.value = -tabItemElOffsetLeft + tabNavPadding;
  } else if (
    tabItemElOffsetLeft > -translateX.value &&
    tabItemElOffsetLeft + tabItemOffsetWidth < -translateX.value + scrollbarDomWidth
  ) {
    // 탭이 보이는 곳에 있음
    translateX.value = Math.min(
      0,
      scrollbarDomWidth - tabItemOffsetWidth - tabItemElOffsetLeft - tabNavPadding,
    );
  } else {
    // 레이블이 보이는 영역의 오른쪽에 있음
    translateX.value = -(
      tabItemElOffsetLeft -
      (scrollbarDomWidth - tabNavPadding - tabItemOffsetWidth)
    );
  }
};

const handleScroll = (offset: number): void => {
  const scrollbarDomWidth = scrollbarDom.value ? scrollbarDom.value?.offsetWidth : 0;
  const tabDomWidth = tabDom.value ? tabDom.value.offsetWidth : 0;
  if (offset > 0) {
    translateX.value = Math.min(0, translateX.value + offset);
  } else {
    if (scrollbarDomWidth < tabDomWidth) {
      if (translateX.value >= -(tabDomWidth - scrollbarDomWidth)) {
        translateX.value = Math.max(translateX.value + offset, scrollbarDomWidth - tabDomWidth);
      }
    } else {
      translateX.value = 0;
    }
  }
};

function dynamicRouteTag(value: string, parentPath: string): void {
  const hasValue = multiTags.value.some((item) => {
    return item.path === value;
  });

  function concatPath(arr: object[], value: string, parentPath: string) {
    if (!hasValue) {
      arr.forEach((arrItem: any) => {
        const pathConcat = parentPath + arrItem.path;
        if (arrItem.path === value || pathConcat === value) {
          useMultiTagsStoreHook().handleTags('push', {
            path: value,
            parentPath: `/${parentPath.split('/')[1]}`,
            meta: arrItem.meta,
            name: arrItem.name,
          });
        } else {
          if (arrItem.children && arrItem.children.length > 0) {
            concatPath(arrItem.children, value, parentPath);
          }
        }
      });
    }
  }
  concatPath(router.options.routes as any, value, parentPath);
}

/** 라우트 갱신 */
function onFresh() {
  const { fullPath, query } = unref(route);
  router.replace({
    path: '/redirect' + fullPath,
    query: query,
  });
}

function deleteDynamicTag(obj: any, current: any, tag?: string) {
  // 삭제된 캐시 라우트 저장하기
  let delAliveRouteList = [];
  const valueIndex: number = multiTags.value.findIndex((item: any) => {
    if (item.query) {
      if (item.path === obj.path) {
        return item.query === obj.query;
      }
    } else if (item.params) {
      if (item.path === obj.path) {
        return item.params === obj.params;
      }
    } else {
      return item.path === obj.path;
    }
  });

  const spliceRoute = (startIndex?: number, length?: number, other?: boolean): void => {
    if (other) {
      useMultiTagsStoreHook().handleTags('equal', [routerArrays[0], obj]);
    } else {
      delAliveRouteList = useMultiTagsStoreHook().handleTags('splice', '', {
        startIndex,
        length,
      }) as any;
    }
  };

  if (tag === 'other') {
    spliceRoute(1, 1, true);
  } else if (tag === 'left') {
    spliceRoute(1, valueIndex - 1);
  } else if (tag === 'right') {
    spliceRoute(valueIndex + 1, multiTags.value.length);
  } else {
    // 현재 일치하는 경로에서 삭제
    spliceRoute(valueIndex, 1);
  }
  const newRoute = useMultiTagsStoreHook().handleTags('slice');
  if (current === route.path) {
    // 캐시 경로 삭제
    tag ? delAliveRoutes(delAliveRouteList) : handleAliveRoute(route.matched, 'delete');
    // 현재 활성화된 태그를 삭제하면 자동으로 마지막 태그로 바뀝니다
    if (tag === 'left') return;
    if (newRoute[0]?.query) {
      router.push({ name: newRoute[0].name, query: newRoute[0].query });
    } else if (newRoute[0]?.params) {
      router.push({ name: newRoute[0].name, params: newRoute[0].params });
    } else {
      router.push({ path: newRoute[0].path });
    }
  } else {
    // 캐시 경로 삭제
    tag ? delAliveRoutes(delAliveRouteList) : delAliveRoutes([obj]);
    if (!multiTags.value.length) return;
    if (multiTags.value.some((item) => item.path === route.path)) return;
    if (newRoute[0]?.query) {
      router.push({ name: newRoute[0].name, query: newRoute[0].query });
    } else if (newRoute[0]?.params) {
      router.push({ name: newRoute[0].name, params: newRoute[0].params });
    } else {
      router.push({ path: newRoute[0].path });
    }
  }
}

function deleteMenu(item, tag?: string) {
  deleteDynamicTag(item, item.path, tag);
}

function onClickDrop(key, item, selectRoute?: RouteConfigs) {
  if (item && item.disabled) return;

  let selectTagRoute;
  if (selectRoute) {
    selectTagRoute = {
      path: selectRoute.path,
      meta: selectRoute.meta,
      name: selectRoute.name,
      query: selectRoute?.query,
      params: selectRoute?.params,
    };
  } else {
    selectTagRoute = { path: route.path, meta: route.meta };
  }

  // 현재 경로 정보
  switch (key) {
    case 0:
      // 라우팅 갱신
      onFresh();
      break;
    case 1:
      // 현재 탭 닫기
      deleteMenu(selectTagRoute);
      break;
    case 2:
      // 왼쪽 탭 닫기
      deleteMenu(selectTagRoute, 'left');
      break;
    case 3:
      // 오른쪽 탭 닫기
      deleteMenu(selectTagRoute, 'right');
      break;
    case 4:
      // 다른 탭 닫기
      deleteMenu(selectTagRoute, 'other');
      break;
    case 5:
      // 모든 탭 닫기
      useMultiTagsStoreHook().handleTags('splice', '', {
        startIndex: 1,
        length: multiTags.value.length,
      });
      router.push('/welcome');
      break;
    case 6:
      // 전체 페이지 전체 화면
      toggle();
      setTimeout(() => {
        if (isFullscreen.value) {
          tagsViews[6].icon = ExitFullscreen;
          tagsViews[6].text = '전체 화면 종료';
        } else {
          tagsViews[6].icon = Fullscreen;
          tagsViews[6].text = '전체 화면';
        }
      }, 100);
      break;
    case 7:
      // 콘텐츠 영역 전체 화면
      onContentFullScreen();
      setTimeout(() => {
        if (pureSetting.hiddenSideBar) {
          tagsViews[7].icon = ExitFullscreen;
          tagsViews[7].text = '콘텐츠 영역 전체 화면 종료';
        } else {
          tagsViews[7].icon = Fullscreen;
          tagsViews[7].text = '콘텐츠 영역 전체 화면';
        }
      }, 100);
      break;
  }
  setTimeout(() => {
    showMenuModel(route.fullPath, route.query);
  });
}

function handleCommand(command: any) {
  const { key, item } = command;
  onClickDrop(key, item);
}

/** 오른쪽 버튼에서 메뉴 클릭 이벤트 발생 */
function selectTag(key, item) {
  onClickDrop(key, item, currentSelect.value);
}

function showMenus(value: boolean) {
  Array.of(1, 2, 3, 4, 5).forEach((v) => {
    tagsViews[v].show = value;
  });
}

function disabledMenus(value: boolean) {
  Array.of(1, 2, 3, 4, 5).forEach((v) => {
    tagsViews[v].disabled = value;
  });
}

/** 현재 오른쪽 버튼의 메뉴 양쪽에 다른 메뉴가 있는지 확인합니다. 왼쪽 메뉴가 첫 화면이면 왼쪽 탭 닫기, 오른쪽에 메뉴가 없으면 오른쪽 탭 닫기 */
function showMenuModel(currentPath: string, query: object = {}, refresh = false) {
  const allRoute = multiTags.value;
  const routeLength = multiTags.value.length;
  let currentIndex = -1;
  if (isAllEmpty(query)) {
    currentIndex = allRoute.findIndex((v) => v.path === currentPath);
  } else {
    currentIndex = allRoute.findIndex((v) => isEqual(v.query, query));
  }

  showMenus(true);

  if (refresh) {
    tagsViews[0].show = true;
  }

  /**
   * currentIndex가 1인 경우 왼쪽 메뉴가 첫 화면이면 왼쪽 탭 닫기 페이지가 표시되지 않습니다
   * 만약 currentIndex가 routeLength-1과 같다면 오른쪽에 메뉴가 없다면, 오른쪽 탭 닫기 탭이 표시되지 않습니다
   */
  if (currentIndex === 1 && routeLength !== 2) {
    // 왼쪽 메뉴가 메인 화면이고 오른쪽에는 다른 메뉴가 있습니다.
    tagsViews[2].show = false;
    Array.of(1, 3, 4, 5).forEach((v) => {
      tagsViews[v].disabled = false;
    });
    tagsViews[2].disabled = true;
  } else if (currentIndex === 1 && routeLength === 2) {
    disabledMenus(false);
    // 왼쪽 메뉴가 메인 화면이고 오른쪽에는 다른 메뉴가 없습니다.
    Array.of(2, 3, 4).forEach((v) => {
      tagsViews[v].show = false;
      tagsViews[v].disabled = true;
    });
  } else if (routeLength - 1 === currentIndex && currentIndex !== 0) {
    // 현재 경로가 모든 경로 중 마지막 경로입니다
    tagsViews[3].show = false;
    Array.of(1, 2, 4, 5).forEach((v) => {
      tagsViews[v].disabled = false;
    });
    tagsViews[3].disabled = true;
  } else if (currentIndex === 0 || currentPath === '/redirect/welcome') {
    // 현재 라우팅 첫 페이지
    disabledMenus(true);
  } else {
    disabledMenus(false);
  }
}

function openMenu(tag, e) {
  closeMenu();
  if (tag.path === '/welcome') {
    // 오른쪽 버튼 메뉴 첫 페이지로, 새로 고침만 표시
    showMenus(false);
    tagsViews[0].show = true;
  } else if (route.path !== tag.path && route.name !== tag.name) {
    // 오른쪽 단추 메뉴가 현재 경로와 일치하지 않습니다. 새로 고침 숨기기
    tagsViews[0].show = false;
    showMenuModel(tag.path, tag.query);
  } else if (
    // eslint-disable-next-line no-dupe-else-if
    multiTags.value.length === 2 &&
    route.path !== tag.path
  ) {
    showMenus(true);
    // 탭이 두 개뿐일 때 다른 탭 닫기 표시 안 함
    tagsViews[4].show = false;
  } else if (route.path === tag.path) {
    // 현재 활성화된 메뉴를 마우스 오른쪽 단추로 누르십시오
    showMenuModel(tag.path, tag.query, true);
  }

  currentSelect.value = tag;
  const menuMinWidth = 105;
  const offsetLeft = unref(containerDom).getBoundingClientRect().left;
  const offsetWidth = unref(containerDom).offsetWidth;
  const maxLeft = offsetWidth - menuMinWidth;
  const left = e.clientX - offsetLeft + 5;
  if (left > maxLeft) {
    buttonLeft.value = maxLeft;
  } else {
    buttonLeft.value = left;
  }
  useSettingStoreHook().hiddenSideBar
    ? (buttonTop.value = e.clientY)
    : (buttonTop.value = e.clientY - 40);
  nextTick(() => {
    visible.value = true;
  });
}

/** tags 태그 전환 트리거 */
function tagOnClick(item) {
  const { name, path } = item;
  if (name) {
    if (item.query) {
      router.push({
        name,
        query: item.query,
      });
    } else if (item.params) {
      router.push({
        name,
        params: item.params,
      });
    } else {
      router.push({ name });
    }
  } else {
    router.push({ path });
  }
  // showMenuModel(item?.path, item?.query);
}

onBeforeMount(() => {
  if (!instance) return;

  // 현재 라우팅 초기화 작업 탭 사용 안 함 상태
  showMenuModel(route.fullPath);

  // 触发隐藏标签页
  emitter.on('tagViewsChange', (key: any) => {
    if (unref(showTags as any) === key) return;
    (showTags as any).value = key;
  });

  // 태그 스타일 바꾸기
  emitter.on('tagViewsShowModel', (key) => {
    showModel.value = key;
  });

  //  사이드바 전환으로 전달된 인자 받기
  emitter.on('changLayoutRoute', ({ indexPath, parentPath }) => {
    dynamicRouteTag(indexPath, parentPath);
    setTimeout(() => {
      showMenuModel(indexPath);
    });
  });
});

watch([route], () => {
  activeIndex.value = -1;
  dynamicTagView();
});

onMounted(() => {
  useResizeObserver(
    scrollbarDom,
    useDebounceFn(() => {
      dynamicTagView();
    }, 200),
  );
});
</script>

<template>
  <div ref="containerDom" class="tags-view" v-if="!showTags">
    <span v-show="isShowArrow" class="arrow-left">
      <IconifyIconOffline :icon="ArrowLeftSLine" @click="handleScroll(200)" />
    </span>
    <div ref="scrollbarDom" class="scroll-container">
      <div class="tab select-none" ref="tabDom" :style="getTabStyle">
        <div
          :ref="'dynamic' + index"
          v-for="(item, index) in multiTags"
          :key="index"
          :class="[
            'scroll-item is-closable',
            linkIsActive(item),
            $route.path === item.path && showModel === 'card' ? 'card-active' : '',
          ]"
          @contextmenu.prevent="openMenu(item, $event)"
          @mouseenter.prevent="onMouseenter(index)"
          @mouseleave.prevent="onMouseleave(index)"
          @click="tagOnClick(item)"
        >
          <router-link
            :to="item.path"
            class="dark:!text-text_color_primary dark:hover:!text-primary"
          >
            {{ item.meta.title }}
          </router-link>
          <span
            v-if="iconIsActive(item, index) || (index === activeIndex && index !== 0)"
            class="el-icon-close"
            @click.stop="deleteMenu(item)"
          >
            <IconifyIconOffline :icon="CloseBold" />
          </span>
          <div
            :ref="'schedule' + index"
            v-if="showModel !== 'card'"
            :class="[scheduleIsActive(item)]"
          />
        </div>
      </div>
    </div>
    <span v-show="isShowArrow" class="arrow-right">
      <IconifyIconOffline :icon="ArrowRightSLine" @click="handleScroll(-200)" />
    </span>
    <transition name="el-zoom-in-top">
      <ul v-show="visible" :key="Math.random()" :style="getContextMenuStyle" class="contextmenu">
        <div
          v-for="(item, key) in tagsViews.slice(0, 6)"
          :key="key"
          style="display: flex; align-items: center"
        >
          <li v-if="item.show" @click="selectTag(key, item)">
            <IconifyIconOffline :icon="item.icon" />
            {{ item.text }}
          </li>
        </div>
      </ul>
    </transition>
    <el-dropdown trigger="click" placement="bottom-end" @command="handleCommand">
      <span class="arrow-down">
        <IconifyIconOffline :icon="ArrowDown" class="dark:text-white" />
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(item, key) in tagsViews"
            :key="key"
            :command="{ key, item }"
            :divided="item.divided"
            :disabled="item.disabled"
          >
            <IconifyIconOffline :icon="item.icon" />
            {{ item.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style lang="scss" scoped>
@import './index.scss';
</style>
