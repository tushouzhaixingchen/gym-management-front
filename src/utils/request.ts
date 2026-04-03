import axios from 'axios';

const request = axios.create({
  baseURL: '/api', // 代理前缀
  timeout: 5000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const isLoginRequest = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    
    if (!isLoginRequest) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // 确保登录请求不携带任何认证信息
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 如果是 401 错误且是登录请求，给出更友好的提示
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register');
      if (isLoginRequest) {
        console.error('登录接口返回 401，请检查：');
        console.error('1. 后端接口是否需要 /api 前缀？');
        console.error('2. 后端是否有全局拦截器未排除登录接口？');
        console.error('3. 请求的完整 URL 是否正确？');
      }
    }
    return Promise.reject(error);
  }
);

export default request;

export interface LoginData {
  account: string;    // 👈 修改为 account
  password: string;
}

/**
 * @description: 用户登录
 * @param {LoginData} data
 * @return {*}
 */
export function loginApi(data: LoginData) {
  // 👇 确保数据被正确序列化为 JSON 字符串
  return request.post('/auth/login', JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }); 
}
