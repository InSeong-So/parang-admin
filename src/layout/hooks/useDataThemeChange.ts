import { ref } from 'vue';
import { getConfig } from '@/config';
import { useLayout } from './useLayout';
import { themeColorsType } from '../types';
import { useGlobal } from '@pureadmin/utils';
import { useEpThemeStoreHook } from '@/store/modules/epTheme';
import { darken, lighten, toggleTheme } from '@pureadmin/theme/dist/browser-utils';

export function useDataThemeChange() {
  const { layoutTheme, layout } = useLayout();
  const themeColors = ref<Array<themeColorsType>>([
    { color: '#1b2a47', themeColor: 'default' },
    { color: '#ffffff', themeColor: 'light' },
    { color: '#f5222d', themeColor: 'dusk' },
    { color: '#fa541c', themeColor: 'volcano' },
    { color: '#fadb14', themeColor: 'yellow' },
    { color: '#13c2c2', themeColor: 'mingQing' },
    { color: '#52c41a', themeColor: 'auroraGreen' },
    { color: '#eb2f96', themeColor: 'pink' },
    { color: '#722ed1', themeColor: 'saucePurple' },
  ]);

  const { $storage } = useGlobal<GlobalPropertiesApi>();
  const dataTheme = ref<boolean>($storage?.layout?.darkMode);
  const body = document.documentElement as HTMLElement;

  /** 탐색 테마 색상 설정 */
  function setLayoutThemeColor(theme = 'default') {
    layoutTheme.value.theme = theme;
    toggleTheme({
      scopeName: `layout-theme-${theme}`,
    });
    $storage.layout = {
      layout: layout.value,
      theme,
      darkMode: dataTheme.value,
      sidebarStatus: $storage.layout?.sidebarStatus,
      epThemeColor: $storage.layout?.epThemeColor,
    };

    if (theme === 'default' || theme === 'light') {
      setEpThemeColor(getConfig().EpThemeColor);
    } else {
      const colors = themeColors.value.find((v) => v.themeColor === theme);
      setEpThemeColor(colors.color);
    }
  }

  function setPropertyPrimary(mode: string, i: number, color: string) {
    document.documentElement.style.setProperty(
      `--el-color-primary-${mode}-${i}`,
      dataTheme.value ? darken(color, i / 10) : lighten(color, i / 10),
    );
  }

  /** `element-plus` 테마 색상 설정 */
  const setEpThemeColor = (color: string) => {
    useEpThemeStoreHook().setEpThemeColor(color);
    document.documentElement.style.setProperty('--el-color-primary', color);
    for (let i = 1; i <= 2; i++) {
      setPropertyPrimary('dark', i, color);
    }
    for (let i = 1; i <= 9; i++) {
      setPropertyPrimary('light', i, color);
    }
  };

  /** light, night 테마 전환 */
  function dataThemeChange() {
    /* 현재 야간 테마인 경우 기본적으로 default 테마로 전환 */
    if (useEpThemeStoreHook().epTheme === 'light' && dataTheme.value) {
      setLayoutThemeColor('default');
    } else {
      setLayoutThemeColor(useEpThemeStoreHook().epTheme);
    }

    if (dataTheme.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    body,
    dataTheme,
    layoutTheme,
    themeColors,
    dataThemeChange,
    setEpThemeColor,
    setLayoutThemeColor,
  };
}
