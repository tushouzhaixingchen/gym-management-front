import axios from 'axios';

const request = axios.create({
  baseURL: '/api', // 代理前缀
  timeout: 5000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 📝 打印请求信息
    console.log('🌐 ============ HTTP请求 ============');
    console.log('🔗 URL:', (config.baseURL || '') + (config.url || ''));
    console.log('📮 方法:', config.method?.toUpperCase());
    console.log('📦 请求头:', JSON.stringify(config.headers, null, 2));
    console.log('📋 请求体:', config.data);
    console.log('🔑 Token:', config.headers.Authorization || '无');
    console.log('====================================');
    
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
    console.log('📨 ============ HTTP响应 ============');
    console.log('✅ 状态码:', response.status);
    console.log('🔗 URL:', response.config.url);
    console.log('📦 响应数据:', response.data);
    console.log('====================================');
    return response.data;
  },
  (error) => {
    console.log('❌ ============ HTTP错误 ============');
    console.log('❌ 错误状态:', error.response?.status);
    console.log('❌ 错误消息:', error.message);
    console.log('❌ 错误响应:', error.response?.data);
    console.log('❌ 请求URL:', error.config?.url);
    console.log('❌ 请求方法:', error.config?.method);
    console.log('====================================');
    
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
