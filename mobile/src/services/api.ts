import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import authClient from './authClient';
import { API_BASE_URL } from '../config/apiBaseUrl';

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  meta?: unknown;
}

export function unwrapData<T>(response: ApiEnvelope<T> | T | null | undefined, fallback: T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data ?? fallback;
  }
  return (response ?? fallback) as T;
}

export function unwrapItems<T>(response: ApiEnvelope<T[] | { items?: T[] }> | T[] | null | undefined): T[] {
  const data = unwrapData<T[] | { items?: T[] } | null | undefined>(response, []);
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

class ApiService {
  private api: AxiosInstance | null = null;

  private getApi(): AxiosInstance {
    if (!this.api) {
      this.api = axios.create({
        baseURL: `${API_BASE_URL}/`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.setupInterceptors();
    }
    return this.api;
  }

  private setupInterceptors() {
    if (!this.api) return;
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const cookie = authClient.getCookie();
        if (cookie && config.headers) config.headers.set('Cookie', cookie);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => Promise.reject(error.response?.data || error.message)
    );
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.getApi().get(url, config) as unknown as Promise<T>;
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.getApi().post(url, data, config) as unknown as Promise<T>;
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.getApi().put(url, data, config) as unknown as Promise<T>;
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.getApi().patch(url, data, config) as unknown as Promise<T>;
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.getApi().delete(url, config) as unknown as Promise<T>;
  }

}

export const apiService = new ApiService();
export default apiService;
