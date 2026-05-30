import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@watani_token';

class ApiService {
  private api: AxiosInstance | null = null;

  private getApi(): AxiosInstance {
    if (!this.api) {
      this.api = axios.create({
        baseURL: (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api').replace(/\/?$/, '/'),
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
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.getApi().get(url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.getApi().post(url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.getApi().put(url, data, config);
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.getApi().patch(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.getApi().delete(url, config);
  }

  setToken(token: string) {
    return AsyncStorage.setItem(TOKEN_KEY, token);
  }

  getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  removeToken() {
    return AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export const apiService = new ApiService();
export default apiService;
