// 반응형 스토리지
import { App } from 'vue';
import Storage from 'responsive-storage';
import { routerArrays } from '@/layout/types';

const nameSpace = 'responsive-';

export const injectResponsiveStorage = (app: App, config: ServerConfigs) => {
  const configObj = Object.assign(
    {
      // layout 모드와 테마
      layout: Storage.getData('layout', nameSpace) ?? {
        layout: config.Layout ?? 'vertical',
        theme: config.Theme ?? 'default',
        darkMode: config.DarkMode ?? false,
        sidebarStatus: config.SidebarStatus ?? true,
        epThemeColor: config.EpThemeColor ?? '#409EFF',
      },
      configure: Storage.getData('configure', nameSpace) ?? {
        grey: config.Grey ?? false,
        weak: config.Weak ?? false,
        hideTabs: config.HideTabs ?? false,
        showLogo: config.ShowLogo ?? true,
        showModel: config.ShowModel ?? 'smart',
        multiTagsCache: config.MultiTagsCache ?? false,
      },
    },
    config.MultiTagsCache
      ? {
          // 기본 첫 화면 태그 보이기
          tags: Storage.getData('tags', nameSpace) ?? routerArrays,
        }
      : {},
  );

  app.use(Storage, { nameSpace, memory: configObj });
};
