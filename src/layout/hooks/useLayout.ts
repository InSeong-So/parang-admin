import { computed } from 'vue';
import { routerArrays } from '../types';
import { useGlobal } from '@pureadmin/utils';
import { useMultiTagsStore } from '@/store/modules/multiTags';

export function useLayout() {
  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();

  const initStorage = () => {
    /** 공유 */
    if (useMultiTagsStore().multiTagsCache && (!$storage.tags || $storage.tags.length === 0)) {
      $storage.tags = routerArrays;
    }
    /** 탐색 */
    if (!$storage.layout) {
      $storage.layout = {
        layout: $config?.Layout ?? 'vertical',
        theme: $config?.Theme ?? 'default',
        darkMode: $config?.DarkMode ?? false,
        sidebarStatus: $config?.SidebarStatus ?? true,
        epThemeColor: $config?.EpThemeColor ?? '#409EFF',
      };
    }
    /** 회색 모드, 색약 모드, 숨기기 탭 */
    if (!$storage.configure) {
      $storage.configure = {
        grey: $config?.Grey ?? false,
        weak: $config?.Weak ?? false,
        hideTabs: $config?.HideTabs ?? false,
        showLogo: $config?.ShowLogo ?? true,
        showModel: $config?.ShowModel ?? 'smart',
        multiTagsCache: $config?.MultiTagsCache ?? false,
      };
    }
  };

  /** 캐시를 비운 후 serverConfig.json에서 기본 설정을 읽고 storage에 할당 */
  const layout = computed(() => {
    return $storage?.layout.layout;
  });

  const layoutTheme = computed(() => {
    return $storage.layout;
  });

  return {
    layout,
    layoutTheme,
    initStorage,
  };
}
