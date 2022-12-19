import {
  ref,
  unref,
  watch,
  computed,
  reactive,
  onMounted,
  CSSProperties,
  getCurrentInstance,
} from 'vue';
import { tagsViewsType } from '../types';
import { useEventListener } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import { isEqual, isBoolean } from '@pureadmin/utils';
import { useSettingStoreHook } from '@/store/modules/settings';
import { useMultiTagsStoreHook } from '@/store/modules/multiTags';
import { storageLocal, toggleClass, hasClass } from '@pureadmin/utils';

import Fullscreen from '@iconify-icons/ri/fullscreen-fill';
import CloseAllTags from '@iconify-icons/ri/subtract-line';
import CloseOtherTags from '@iconify-icons/ri/text-spacing';
import CloseRightTags from '@iconify-icons/ri/text-direction-l';
import CloseLeftTags from '@iconify-icons/ri/text-direction-r';
import RefreshRight from '@iconify-icons/ep/refresh-right';
import Close from '@iconify-icons/ep/close';

export function useTags() {
  const route = useRoute();
  const router = useRouter();
  const instance = getCurrentInstance();
  const pureSetting = useSettingStoreHook();

  const buttonTop = ref(0);
  const buttonLeft = ref(0);
  const translateX = ref(0);
  const visible = ref(false);
  const activeIndex = ref(-1);
  // 현재 오른쪽 버튼으로 선택된 경로 정보
  const currentSelect = ref({});

  /** 보기 모드, 기본 동작 모드 */
  const showModel = ref(
    storageLocal().getItem<StorageConfigs>('responsive-configure')?.showModel || 'smart',
  );
  /** 탭 숨기기, 기본 보기 */
  const showTags =
    ref(storageLocal().getItem<StorageConfigs>('responsive-configure').hideTabs) ?? ref('false');
  const multiTags: any = computed(() => {
    return useMultiTagsStoreHook().multiTags;
  });

  const tagsViews = reactive<Array<tagsViewsType>>([
    {
      icon: RefreshRight,
      text: '다시 불러오기',
      divided: false,
      disabled: false,
      show: true,
    },
    {
      icon: Close,
      text: '현재 탭 닫기',
      divided: false,
      disabled: multiTags.value.length > 1 ? false : true,
      show: true,
    },
    {
      icon: CloseLeftTags,
      text: '왼쪽 탭 닫기',
      divided: true,
      disabled: multiTags.value.length > 1 ? false : true,
      show: true,
    },
    {
      icon: CloseRightTags,
      text: '오른쪽 탭 닫기',
      divided: false,
      disabled: multiTags.value.length > 1 ? false : true,
      show: true,
    },
    {
      icon: CloseOtherTags,
      text: '다른 탭 닫기',
      divided: true,
      disabled: multiTags.value.length > 2 ? false : true,
      show: true,
    },
    {
      icon: CloseAllTags,
      text: '모든 탭 닫기',
      divided: false,
      disabled: multiTags.value.length > 1 ? false : true,
      show: true,
    },
    {
      icon: Fullscreen,
      text: '모든 페이지 전체 화면',
      divided: true,
      disabled: false,
      show: true,
    },
    {
      icon: Fullscreen,
      text: '콘텐츠 영역 전체 화면',
      divided: false,
      disabled: false,
      show: true,
    },
  ]);

  function conditionHandle(item, previous, next) {
    if (isBoolean(route?.meta?.showLink) && route?.meta?.showLink === false) {
      if (Object.keys(route.query).length > 0) {
        return isEqual(route.query, item.query) ? previous : next;
      } else {
        return isEqual(route.params, item.params) ? previous : next;
      }
    } else {
      return route.path === item.path ? previous : next;
    }
  }

  const iconIsActive = computed(() => {
    return (item, index) => {
      if (index === 0) return;
      return conditionHandle(item, true, false);
    };
  });

  const linkIsActive = computed(() => {
    return (item) => {
      return conditionHandle(item, 'is-active', '');
    };
  });

  const scheduleIsActive = computed(() => {
    return (item) => {
      return conditionHandle(item, 'schedule-active', '');
    };
  });

  const getTabStyle = computed((): CSSProperties => {
    return {
      transform: `translateX(${translateX.value}px)`,
    };
  });

  const getContextMenuStyle = computed((): CSSProperties => {
    return { left: buttonLeft.value + 'px', top: buttonTop.value + 'px' };
  });

  const closeMenu = () => {
    visible.value = false;
  };

  /** 마우스 enter 시 스타일 추가 */
  function onMouseenter(index) {
    if (index) activeIndex.value = index;
    if (unref(showModel) === 'smart') {
      if (hasClass(instance.refs['schedule' + index][0], 'schedule-active')) return;
      toggleClass(true, 'schedule-in', instance.refs['schedule' + index][0]);
      toggleClass(false, 'schedule-out', instance.refs['schedule' + index][0]);
    } else {
      if (hasClass(instance.refs['dynamic' + index][0], 'card-active')) return;
      toggleClass(true, 'card-in', instance.refs['dynamic' + index][0]);
      toggleClass(false, 'card-out', instance.refs['dynamic' + index][0]);
    }
  }

  /** 마우스 leave 시 스타일 복원 */
  function onMouseleave(index) {
    activeIndex.value = -1;
    if (unref(showModel) === 'smart') {
      if (hasClass(instance.refs['schedule' + index][0], 'schedule-active')) return;
      toggleClass(false, 'schedule-in', instance.refs['schedule' + index][0]);
      toggleClass(true, 'schedule-out', instance.refs['schedule' + index][0]);
    } else {
      if (hasClass(instance.refs['dynamic' + index][0], 'card-active')) return;
      toggleClass(false, 'card-in', instance.refs['dynamic' + index][0]);
      toggleClass(true, 'card-out', instance.refs['dynamic' + index][0]);
    }
  }

  function onContentFullScreen() {
    pureSetting.hiddenSideBar
      ? pureSetting.changeSetting({ key: 'hiddenSideBar', value: false })
      : pureSetting.changeSetting({ key: 'hiddenSideBar', value: true });
  }

  onMounted(() => {
    if (!showModel.value) {
      const configure = storageLocal().getItem<StorageConfigs>('responsive-configure');
      configure.showModel = 'card';
      storageLocal().setItem('responsive-configure', configure);
    }
  });

  watch(
    () => visible.value,
    () => {
      useEventListener(document, 'click', closeMenu);
    },
  );

  return {
    route,
    router,
    visible,
    showTags,
    instance,
    multiTags,
    showModel,
    tagsViews,
    buttonTop,
    buttonLeft,
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
  };
}
