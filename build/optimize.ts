/**
 * 이 파일은 'vite.config.ts' 의 'optimizeDeps.include' 의 사전 구성 항목에 의존합니다.
 * 사전 구축에 의존합니다. `vite` 부팅 시 아래 include에 있는 모듈을 esm 형식으로 컴파일하여 node_modules/.vite 폴더에 캐시합니다. 페이지가 해당 모듈에 로드될 때 브라우저에 캐시가 있으면 브라우저 캐시를 읽습니다. 그렇지 않으면 로컬 캐시를 읽고 필요에 따라 로드합니다.
 * 특히 브라우저 캐시를 사용하지 않을 때( 디버깅 중에만 해당) 해당 모듈을 include에 넣어야 합니다. 그렇지 않으면 개발 환경 전환 페이지가 막힐 수 있습니다. 브라우저 캐시를 사용할 수도 없고 로컬 node_modules/.vite에 캐시되지 않기 때문에 vite는 새 종속 패킷으로 간주하여 페이지를 다시 로드하고 강제로 새로 고칩니다.
 * 힌트: 만약 당신이 사용하는 서드파티 라이브러리가 src/main.ts 파일에 도입된다면, vite가 자동으로 node_modules/.vite에 캐시하기 때문에 include에 추가할 필요가 없습니다.
 */
const include = [
  'qs',
  'mitt',
  'dayjs',
  'axios',
  'pinia',
  'echarts',
  'js-cookie',
  '@vueuse/core',
  '@pureadmin/utils',
  'responsive-storage',
  'element-resize-detector',
];

/**
 * 사전 구축에서 제외된 종속성
 * 힌트: `@iconify-icons/`로 시작하는 모든 로컬 아이콘 모듈은 아래의 `exclude`에 넣어야 합니다. 플랫폼이 추천하는 사용 방식은 어디에서 도입해야 하는지, 그리고 모두 단일 도입이므로 사전 구축이 필요하지 않습니다. 바로 브라우저에 로딩하면 됩니다.
 */
const exclude = ['@iconify-icons/ep', '@iconify-icons/ri', '@pureadmin/theme/dist/browser-utils'];

export { include, exclude };
