import dayjs from 'dayjs';
import { resolve } from 'path';
import pkg from './package.json';
import { wrappedEnv } from './build';
import { getPluginsList } from './build/plugins';
import { include, exclude } from './build/optimize';
import { UserConfigExport, ConfigEnv, loadEnv, PluginOption } from 'vite';

/** 현재 node 명령을 실행할 때 폴더의 주소(작업 디렉터리) */
const root: string = process.cwd();

/** 경로 찾기 유틸 */
const pathResolve = (dir: string): string => {
  return resolve(__dirname, '.', dir);
};

/** alias 유틸 */
const alias: Record<string, string> = {
  '@': pathResolve('src'),
  '@build': pathResolve('build'),
};

const { dependencies, devDependencies, name, version } = pkg;

const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
};

export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH } = wrappedEnv(
    loadEnv(mode, root),
  );

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: { alias },
    // CSR 설정
    server: {
      // https 여부
      https: false,
      port: VITE_PORT,
      host: '0.0.0.0',
      // 로컬 교차 도메인 에이전트 https://vitejs.dev/config/server-options.html#server-proxy
      proxy: {},
    },
    plugins: getPluginsList(command, VITE_CDN, VITE_COMPRESSION) as PluginOption[],
    // https://vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: { include, exclude },
    build: {
      target: 'esnext',
      sourcemap: false,
      // 500kb 이상의 패키지 크기 경고 제거
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: { index: pathResolve('index.html') },
        // 정적 자원 분류 패키지
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
};
