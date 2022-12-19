import App from './App.vue';
import router from './router';
import { setupStore } from '@/store';
import ElementPlus from 'element-plus';
import { getServerConfig } from './config';
import { createApp, Directive } from 'vue';
import { MotionPlugin } from '@vueuse/motion';
import { useEcharts } from '@/plugins/echarts';
import { injectResponsiveStorage } from '@/utils/responsive';

import Table from '@pureadmin/table';
import PureDescriptions from '@pureadmin/descriptions';

// 리셋 스타일 가져오기
import './style/reset.scss';
// 공용 스타일 가져오기
import './style/index.scss';
import 'element-plus/dist/index.css';
// 글꼴 아이콘 가져오기
import './assets/iconfont/iconfont.js';
import './assets/iconfont/iconfont.css';

const app = createApp(App);

// 사용자 지정 명령어
import * as directives from '@/directives';
Object.keys(directives).forEach((key) => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 전역 등록 `@iconify/vue` 아이콘 라이브러리
import { IconifyIconOffline, IconifyIconOnline, FontIcon } from './components/ReIcon';
app.component('IconifyIconOffline', IconifyIconOffline);
app.component('IconifyIconOnline', IconifyIconOnline);
app.component('FontIcon', FontIcon);

// 전역 등록 버튼 수준 권한 구성 요소
import { Auth } from '@/components/ReAuth';
app.component('Auth', Auth);

// 전역적으로 가져오기
// If you want to use ElTable, import it.
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/pagination/style/css';

getServerConfig(app).then(async (config) => {
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config);
  setupStore(app);
  app.use(MotionPlugin).use(ElementPlus).use(useEcharts).use(Table).use(PureDescriptions);
  app.mount('#app');
});
