import { Plugin as importToCDN } from 'vite-plugin-cdn-import';

/**
 * @description 패키징 시 `cdn` 모드를 사용하며, 외부 네트워크에서만 사용할 수 있습니다(기본적으로 사용하지 않습니다. cdn 모드가 필요한 경우 .env.production 파일에서 VITE_CDN을 true로 설정하십시오)
 * 플랫폼은 국내 cdn:https://www.bootcdn.cn을 사용하므로, 물론 https://unpkg.com 또는 https://www.jsdelivr.com를 선택할 수도 있습니다.
 * 주의: mockjs는 cdn 모드에서 가져올 수 없으며 오류를 보고할 수 있습니다.올바른 방식은 생산 환경에서 mockjs를 삭제하고 실제 백엔드 요청을 사용하는 것입니다.
 * 주의: 위에서 언급한 외부 네트워크만 사용할 수 있다는 것이 완전히 확실한 것은 아닙니다. 만약 당신 회사의 내부 네트워크에 관련 js, css 파일이 배치되어 있다면, 아래의 사양을 수정하여 전체 내부 네트워크 버전 cdn을 만들 수도 있습니다.
 */
export const cdn = importToCDN({
  // (prodUrl 해석: name: 아래 modules에 대응하는 name, version: 로컬 package.json에서 dependencies 의존에서 대응하는 패킷의 버전 번호, path: 아래 modules에 대응하는 path, 물론 전체 경로를 쓸 수 있으며 prodUrl을 대체합니다)
  prodUrl: 'https://cdn.bootcdn.net/ajax/libs/{name}/{version}/{path}',
  modules: [
    {
      name: 'vue',
      var: 'Vue',
      path: 'vue.global.prod.min.js',
    },
    {
      name: 'vue-router',
      var: 'VueRouter',
      path: 'vue-router.global.min.js',
    },
    // 프로젝트에 vue-demi를 직접 설치하지 않았지만, 피니아가 사용하기 때문에 피니아 도입 전에 vue-demi(https://github.com/vuejs/pinia/blob/v2/packages/pinia/package.json#L77)를 도입해야 합니다.
    {
      name: 'vue-demi',
      var: 'VueDemi',
      path: 'index.iife.min.js',
    },
    {
      name: 'pinia',
      var: 'Pinia',
      path: 'pinia.iife.min.js',
    },
    {
      name: 'element-plus',
      var: 'ElementPlus',
      path: 'index.full.min.js',
      css: 'index.min.css',
    },
    {
      name: 'axios',
      var: 'axios',
      path: 'axios.min.js',
    },
    {
      name: 'dayjs',
      var: 'dayjs',
      path: 'dayjs.min.js',
    },
    {
      name: 'echarts',
      var: 'echarts',
      path: 'echarts.min.js',
    },
  ],
});
