import { App } from 'vue';
import axios from 'axios';
import { loadEnv } from '@build/index';

let config: object = {};
const { VITE_PUBLIC_PATH } = loadEnv();

const setConfig = (cfg?: unknown) => {
  config = Object.assign(config, cfg);
};

const getConfig = (key?: string): ServerConfigs => {
  if (typeof key === 'string') {
    const arr = key.split('.');
    if (arr && arr.length) {
      let data = config;
      arr.forEach((v) => {
        if (data && typeof data[v] !== 'undefined') {
          data = data[v];
        } else {
          data = null;
        }
      });
      return data;
    }
  }
  return config;
};

/** 프로젝트의 전역 설정을 동적으로 가져오기 */
export const getServerConfig = async (app: App): Promise<undefined> => {
  app.config.globalProperties.$config = getConfig();
  return axios({
    method: 'get',
    url: `${VITE_PUBLIC_PATH}serverConfig.json`,
  })
    .then(({ data: config }) => {
      let $config = app.config.globalProperties.$config;
      // 자동 주입 항목 설정
      if (app && $config && typeof config === 'object') {
        $config = Object.assign($config, config);
        app.config.globalProperties.$config = $config;
        // 전역 설정
        setConfig($config);
      }
      return $config;
    })
    .catch(() => {
      throw 'public 폴더에 serverConfig.json 프로필을 추가하십시오';
    });
};

export { getConfig, setConfig };
