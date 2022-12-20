import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CustomParamsSerializer,
} from 'axios';
import {
  AdminClientError,
  RequestMethods,
  AdminClientResponse,
  AdminClientRequestConfig,
} from './types.d';
import { stringify } from 'qs';
import NProgress from '../progress';
import { getToken, formatToken } from '@/utils/auth';
import { useUserStoreHook } from '@/store/modules/user';

const BASE_URL = import.meta.env.VITE_API_HOST;

// @see：https://axios-http.com/kr/
const defaultConfig: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: '*/*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  },
  // 배열 형식 매개 변수 직렬화（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
};

class AdminClient {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** 토큰이 만료된 후 실행 대기 중인 요청 저장 */
  private static requests = [];

  /** token이 중복되지 않게 */
  private static isRefreshing = false;

  /** 설정 객체 초기화 */
  private static initConfig: AdminClientRequestConfig = {};

  /** 현재 Axios 인스턴스 객체 저장 */
  private static axiosInstance: AxiosInstance = axios.create(defaultConfig);

  /** 원본 요청을 다시 연결합니다. */
  private static retryOriginalRequest(config: AdminClientRequestConfig) {
    return new Promise((resolve) => {
      AdminClient.requests.push((token: string) => {
        config.headers['Authorization'] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 요청 인터셉터 */
  private httpInterceptorsRequest(): void {
    AdminClient.axiosInstance.interceptors.request.use(
      async (config: AdminClientRequestConfig) => {
        // 진행 표시줄 애니메이션 켜기
        NProgress.start();
        // post/get 등의 메서드가 들어오는지 여부를 우선적으로 판단하며, 그렇지 않으면 초기화 설정 등을 수행하여 되돌립니다.
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config);
          return config;
        }
        if (AdminClient.initConfig.beforeRequestCallback) {
          AdminClient.initConfig.beforeRequestCallback(config);
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
                  if (!AdminClient.isRefreshing) {
                    AdminClient.isRefreshing = true;
                    // 토큰 만료 새로 고침
                    useUserStoreHook()
                      .handRefreshToken({ refreshToken: data.refreshToken })
                      .then((res) => {
                        const token = res.data.accessToken;
                        config.headers['Authorization'] = formatToken(token);
                        AdminClient.requests.forEach((cb) => cb(token));
                        AdminClient.requests = [];
                      })
                      .finally(() => {
                        AdminClient.isRefreshing = false;
                      });
                  }
                  resolve(AdminClient.retryOriginalRequest(config));
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
    const instance = AdminClient.axiosInstance;
    instance.interceptors.response.use(
      (response: AdminClientResponse) => {
        const {
          data: $data,
          config: { beforeResponseCallback, url, data: $requestData },
        } = response;

        let parsedData = $data as AxiosResponse<any, any>['data'];
        const { email } = JSON.parse($requestData);

        // 진행 표시줄 애니메이션 끄기
        NProgress.done();

        if (url && url.includes('/auth/login')) {
          parsedData = {
            success: true,
            data: { ...$data, email, roles: 'admin', expires: new Date('2024/10/30 00:00:00') },
          };
        }

        // post/get 등의 메서드가 들어오는지 여부를 우선적으로 판단하며, 그렇지 않으면 초기화 설정 등을 수행하여 되돌립니다.
        if (typeof beforeResponseCallback === 'function') {
          beforeResponseCallback(response);
          return parsedData;
        }

        AdminClient.initConfig.beforeResponseCallback &&
          AdminClient.initConfig.beforeResponseCallback(response);

        return parsedData;
      },
      (error: AdminClientError) => {
        const $error = error;
        $error.isCancelRequest = axios.isCancel($error);
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
    axiosConfig?: AdminClientRequestConfig,
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as AdminClientRequestConfig;

    // 사용자 지정 요청/ 응답 되돌림 처리
    return new Promise((resolve, reject) => {
      AdminClient.axiosInstance
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
    config?: AdminClientRequestConfig,
  ): Promise<P> {
    return this.request<P>('post', url, params, config);
  }

  /** 개별 추출된 get 도구 함수 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: AdminClientRequestConfig,
  ): Promise<P> {
    return this.request<P>('get', url, params, config);
  }
}

export const http = new AdminClient();
