import Axios, { Method, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';

export type resultType = {
  accessToken?: string;
};

export type RequestMethods = Extract<
  Method,
  'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'
>;

export interface AdminClientError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface AdminClientResponse extends AxiosResponse {
  config: AdminClientRequestConfig;
}

export interface AdminClientRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: AdminClientRequestConfig) => void;
  beforeResponseCallback?: (response: AdminClientResponse) => void;
}

export default class AdminClient {
  request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: AdminClientRequestConfig,
  ): Promise<T>;
  post<T, P>(url: string, params?: T, config?: AdminClientRequestConfig): Promise<P>;
  get<T, P>(url: string, params?: T, config?: AdminClientRequestConfig): Promise<P>;
}
