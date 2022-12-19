/** 환경변수 처리 */
const warpperEnv = (envConf: Recordable): ViteEnv => {
  /** 기본값으로 설정 */
  const ret: ViteEnv = {
    VITE_PORT: 8848,
    VITE_PUBLIC_PATH: '',
    VITE_ROUTER_HISTORY: '',
    VITE_CDN: false,
    VITE_COMPRESSION: 'none',
  };

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n');
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;

    if (envName === 'VITE_PORT') {
      realName = Number(realName);
    }
    ret[envName] = realName;
    if (typeof realName === 'string') {
      process.env[envName] = realName;
    } else if (typeof realName === 'object') {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
};

/** 환경 변수 가져오기 */
const loadEnv = (): ViteEnv => {
  return import.meta.env;
};

export { warpperEnv, loadEnv };
