import { store } from '@/store';
import { appType } from './types';
import { defineStore } from 'pinia';
import { getConfig } from '@/config';
import { deviceDetection, storageLocal } from '@pureadmin/utils';

export const useAppStore = defineStore({
  id: 'pure-app',
  state: (): appType => ({
    sidebar: {
      opened:
        storageLocal().getItem<StorageConfigs>('responsive-layout')?.sidebarStatus ??
        getConfig().SidebarStatus,
      withoutAnimation: false,
      isClickCollapse: false,
    },
    // 여기서 layout은 감청 용기를 끌어서 해당 내비게이션 모드로 되돌리는 데 사용됩니다.
    layout:
      storageLocal().getItem<StorageConfigs>('responsive-layout')?.layout ?? getConfig().Layout,
    device: deviceDetection() ? 'mobile' : 'desktop',
  }),
  getters: {
    getSidebarStatus() {
      return this.sidebar.opened;
    },
    getDevice() {
      return this.device;
    },
  },
  actions: {
    TOGGLE_SIDEBAR(opened?: boolean, resize?: string) {
      const layout = storageLocal().getItem<StorageConfigs>('responsive-layout');
      if (opened && resize) {
        this.sidebar.withoutAnimation = true;
        this.sidebar.opened = true;
        layout.sidebarStatus = true;
      } else if (!opened && resize) {
        this.sidebar.withoutAnimation = true;
        this.sidebar.opened = false;
        layout.sidebarStatus = false;
      } else if (!opened && !resize) {
        this.sidebar.withoutAnimation = false;
        this.sidebar.opened = !this.sidebar.opened;
        this.sidebar.isClickCollapse = !this.sidebar.opened;
        layout.sidebarStatus = this.sidebar.opened;
      }
      storageLocal().setItem('responsive-layout', layout);
    },
    async toggleSideBar(opened?: boolean, resize?: string) {
      await this.TOGGLE_SIDEBAR(opened, resize);
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    setLayout(layout) {
      this.layout = layout;
    },
  },
});

export function useAppStoreHook() {
  return useAppStore(store);
}
