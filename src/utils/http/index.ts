import Axios, { AxiosInstance, AxiosRequestConfig, CustomParamsSerializer } from 'axios';
import { PureHttpError, RequestMethods, PureHttpResponse, PureHttpRequestConfig } from './types.d';
import { stringify } from 'qs';
import NProgress from '../progress';
import { getToken, formatToken } from '@/utils/auth';
import { useUserStoreHook } from '@/store/modules/user';

// @see：https://axios-http.com/kr/
const defaultConfig: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 배열 형식 매개 변수 직렬화（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** 토큰이 만료된 후 실행 대기 중인 요청 저장 */
  private static requests = [];

  /** token이 중복되지 않게 */
  private static isRefreshing = false;

  /** 설정 객체 초기화 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 현재 Axios 인스턴스 객체 저장 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 원본 요청을 다시 연결합니다. */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise((resolve) => {
      PureHttp.requests.push((token: string) => {
        config.headers['Authorization'] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 요청 인터셉터 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig) => {
        // 진행 표시줄 애니메이션 켜기
        NProgress.start();
        // post/get 등의 메서드가 들어오는지 여부를 우선적으로 판단하며, 그렇지 않으면 초기화 설정 등을 수행하여 되돌립니다.
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** 화이트리스트 요청, 토큰이 필요없는 인터페이스 배치(토큰이 만료되어 재요청으로 인한 데드루프 문제를 방지하기 위해 요청 화이트리스트 설정을 통해) */
        const whiteList = ['/refreshToken', '/login'];
        return whiteList.some((v) => config.url.indexOf(v) > -1)
          ? config
          : new Promise((resolve) => {
              const data = getToken();
              if (data) {
                const now = new Date().getTime();
                const expired = parseInt(data.expires) - now <= 0;
                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    // 토큰 만료 새로 고침
                    useUserStoreHook()
                      .handRefreshToken({ refreshToken: data.refreshToken })
                      .then((res) => {
                        const token = res.data.accessToken;
                        config.headers['Authorization'] = formatToken(token);
                        PureHttp.requests.forEach((cb) => cb(token));
                        PureHttp.requests = [];
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers['Authorization'] = formatToken(data.accessToken);
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  /** 응답 인터셉터 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 진행 표시줄 애니메이션 끄기
        NProgress.done();
        // post/get 등의 메서드가 들어오는지 여부를 우선적으로 판단하며, 그렇지 않으면 초기화 설정 등을 수행하여 되돌립니다.
        if (typeof $config.beforeResponseCallback === 'function') {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 진행 표시줄 애니메이션 끄기
        NProgress.done();
        // 모든 응답 이상 구분 출처는 취소 요청/비취소 요청입니다
        return Promise.reject($error);
      },
    );
  }

  /** 일반 요청 도구 함수 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig,
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as PureHttpRequestConfig;

    // 사용자 지정 요청/ 응답 되돌림 처리
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** 개별 추출된 Post 도구 함수 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig,
  ): Promise<P> {
    return this.request<P>('post', url, params, config);
  }

  /** 개별 추출된 get 도구 함수 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig,
  ): Promise<P> {
    return this.request<P>('get', url, params, config);
  }
}

export const http = new PureHttp();
