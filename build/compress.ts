import type { Plugin } from 'vite';
import { isArray } from '@pureadmin/utils';
import compressPlugin from 'vite-plugin-compression';

export const configCompressPlugin = (compress: ViteCompression): Plugin | Plugin[] => {
  if (compress === 'none') return null;

  const gz = {
    // 압축된 패킷 접미사 생성
    ext: '.gz',
    // 크기가 threshold보다 크면 압축됩니다.
    threshold: 0,
    // .js|mjs|json|css|html 접미사 파일, true로 설정, 모든 파일 압축
    filter: () => true,
    // 압축 후 원본 파일을 삭제할지 여부
    deleteOriginFile: false,
  };
  const br = {
    ext: '.br',
    algorithm: 'brotliCompress',
    threshold: 0,
    filter: () => true,
    deleteOriginFile: false,
  };

  const codeList = [
    { k: 'gzip', v: gz },
    { k: 'brotli', v: br },
    { k: 'both', v: [gz, br] },
  ];

  const plugins: Plugin[] = [];

  codeList.forEach((item) => {
    if (compress.includes(item.k)) {
      if (compress.includes('clear')) {
        if (isArray(item.v)) {
          item.v.forEach((vItem) => {
            plugins.push(compressPlugin(Object.assign(vItem, { deleteOriginFile: true })));
          });
        } else {
          plugins.push(compressPlugin(Object.assign(item.v, { deleteOriginFile: true })));
        }
      } else {
        if (isArray(item.v)) {
          item.v.forEach((vItem) => {
            plugins.push(compressPlugin(vItem));
          });
        } else {
          plugins.push(compressPlugin(item.v));
        }
      }
    }
  });

  return plugins;
};
