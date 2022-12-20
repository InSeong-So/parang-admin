import { cdn } from './cdn';
import vue from '@vitejs/plugin-vue';
import { viteBuildInfo } from './info';
import svgLoader from 'vite-svg-loader';
import vueJsx from '@vitejs/plugin-vue-jsx';
// import { viteMockServe } from 'vite-plugin-mock';
import { configCompressPlugin } from './compress';
// import ElementPlus from "unplugin-element-plus/vite";
import { visualizer } from 'rollup-plugin-visualizer';
import removeConsole from 'vite-plugin-remove-console';
import themePreprocessorPlugin from '@pureadmin/theme';
import DefineOptions from 'unplugin-vue-define-options/vite';
import { genScssMultipleScopeVars } from '../src/layout/theme';

export function getPluginsList(
  command: string,
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression,
) {
  // const prodMock = true;
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    vue(),
    // jsx, tsx 문법 지원
    vueJsx(),
    VITE_CDN ? cdn : null,
    configCompressPlugin(VITE_COMPRESSION),
    DefineOptions(),
    // 온라인 환경 콘솔 삭제
    removeConsole({ external: ['src/assets/iconfont/iconfont.js'] }),
    viteBuildInfo(),
    // 사용자 정의 테마
    themePreprocessorPlugin({
      scss: {
        multipleScopeVars: genScssMultipleScopeVars(),
        extract: true,
      },
    }),
    // svg 컴포넌트 지원
    svgLoader(),
    // ElementPlus({}),
    // mock 지원
    // viteMockServe({
    //   mockPath: 'mock',
    //   localEnabled: command === 'serve',
    //   prodEnabled: command !== 'serve' && prodMock,
    //   injectCode: `
    //       import { setupProdMockServer } from './mockProdServer';
    //       setupProdMockServer();
    //     `,
    //   logger: false,
    // }),
    // 패킹 분석
    lifecycle === 'report'
      ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
      : null,
  ];
}
