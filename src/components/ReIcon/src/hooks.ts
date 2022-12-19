import { iconType } from './types';
import { h, defineComponent, Component } from 'vue';
import { IconifyIconOnline, IconifyIconOffline, FontIcon } from '../index';

/**
 * `iconfont`, `svg` 및 `iconify`의 모든 아이콘을 지원합니다.
 * @param icon 아이콘
 * @param attrs iconType 속성
 * @returns Component
 */
export function useRenderIcon(icon: any, attrs?: iconType): Component {
  // iconfont
  const ifReg = /^IF-/;
  // typeof icon === "function" SVG 라면
  if (ifReg.test(icon)) {
    // iconfont
    const name = icon.split(ifReg)[1];
    const iconName = name.slice(0, name.indexOf(' ') == -1 ? name.length : name.indexOf(' '));
    const iconType = name.slice(name.indexOf(' ') + 1, name.length);
    return defineComponent({
      name: 'FontIcon',
      render() {
        return h(FontIcon, {
          icon: iconName,
          iconType,
          ...attrs,
        });
      },
    });
  } else if (typeof icon === 'function' || typeof icon?.render === 'function') {
    // svg
    return icon;
  } else if (typeof icon === 'object') {
    return defineComponent({
      name: 'OfflineIcon',
      render() {
        return h(IconifyIconOffline, {
          icon: icon,
          ...attrs,
        });
      },
    });
  } else {
    // 존재 여부: 기호는 온라인 아이콘인지 로컬 아이콘인지 여부를 결정합니다. 존재는 온라인 아이콘이며, 그 반대입니다.
    return defineComponent({
      name: 'Icon',
      render() {
        const IconifyIcon = icon && icon.includes(':') ? IconifyIconOnline : IconifyIconOffline;
        return h(IconifyIcon, {
          icon: icon,
          ...attrs,
        });
      },
    });
  }
}
