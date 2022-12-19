import { defineStore } from 'pinia';
import { store } from '@/store';
import { isEqual } from '@pureadmin/utils';
import { routerArrays } from '@/layout/types';
import { multiType, positionType } from './types';
import { isUrl, storageLocal } from '@pureadmin/utils';

export const useMultiTagsStore = defineStore({
  id: 'pure-multiTags',
  state: () => ({
    // 탭 정보 저장(루팅 정보)
    multiTags: storageLocal().getItem<StorageConfigs>('responsive-configure')?.multiTagsCache
      ? storageLocal().getItem<StorageConfigs>('responsive-tags')
      : [...routerArrays],
    multiTagsCache: storageLocal().getItem<StorageConfigs>('responsive-configure')?.multiTagsCache,
  }),
  getters: {
    getMultiTagsCache() {
      return this.multiTagsCache;
    },
  },
  actions: {
    multiTagsCacheChange(multiTagsCache: boolean) {
      this.multiTagsCache = multiTagsCache;
      if (multiTagsCache) {
        storageLocal().setItem('responsive-tags', this.multiTags);
      } else {
        storageLocal().removeItem('responsive-tags');
      }
    },
    tagsCache(multiTags) {
      this.getMultiTagsCache && storageLocal().setItem('responsive-tags', multiTags);
    },
    handleTags<T>(mode: string, value?: T | multiType, position?: positionType): T {
      switch (mode) {
        case 'equal':
          this.multiTags = value;
          this.tagsCache(this.multiTags);
          break;
        case 'push':
          {
            const tagVal = value as multiType;
            // 탭에 추가 안 함
            if (tagVal?.meta?.hiddenTag) return;
            // 외부 체인일 경우 탭에 추가 정보 필요 없음
            if (isUrl(tagVal?.name)) return;
            // title이 비어 있는 정보를 탭에 추가하는 것을 거부하면
            if (tagVal?.meta?.title.length === 0) return;
            const tagPath = tagVal.path;
            // 태그가 존재하는지 여부 판단
            const tagHasExits = this.multiTags.some((tag) => {
              return tag.path === tagPath;
            });

            // tag의 query 키 값이 동일한지 여부를 판단합니다.
            const tagQueryHasExits = this.multiTags.some((tag) => {
              return isEqual(tag?.query, tagVal?.query);
            });

            // 태그의 params 키 값이 동일한지 여부를 판단합니다
            const tagParamsHasExits = this.multiTags.some((tag) => {
              return isEqual(tag?.params, tagVal?.params);
            });

            if (tagHasExits && tagQueryHasExits && tagParamsHasExits) return;

            const dynamicLevel = tagVal?.meta?.dynamicLevel ?? -1;
            if (dynamicLevel > 0) {
              if (this.multiTags.filter((e) => e?.path === tagPath).length >= dynamicLevel) {
                // 현재 열려 있는 동적 라우팅 수가 dynamicLevel보다 크면 첫 번째 동적 라우팅 탭을 바꿉니다
                const index = this.multiTags.findIndex((item) => item?.path === tagPath);
                index !== -1 && this.multiTags.splice(index, 1);
              }
            }
            this.multiTags.push(value);
            this.tagsCache(this.multiTags);
          }
          break;
        case 'splice':
          if (!position) {
            const index = this.multiTags.findIndex((v) => v.path === value);
            if (index === -1) return;
            this.multiTags.splice(index, 1);
          } else {
            this.multiTags.splice(position?.startIndex, position?.length);
          }
          this.tagsCache(this.multiTags);
          return this.multiTags;
        case 'slice':
          return this.multiTags.slice(-1);
      }
    },
  },
});

export function useMultiTagsStoreHook() {
  return useMultiTagsStore(store);
}
