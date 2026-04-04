import { defineStore } from 'pinia';
import request from '@/utils/request';

// 定义角色类型
export type RoleType = 'ADMIN' | 'MEMBER';

// 定义状态接口
export interface UserState {
  token: string;
  name: string;
  role: RoleType;
  userId?: number;
  storeId?: number;  // ✅ 添加 storeId 字段
  storeName?: string;  // ✅ 添加 storeName 字段
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    name: localStorage.getItem('name') || '',
    role: (localStorage.getItem('role') as RoleType) || 'MEMBER',
    userId: Number(localStorage.getItem('userId')) || undefined,
    storeId: Number(localStorage.getItem('storeId')) || undefined,  // ✅ 从 localStorage 恢复
    storeName: localStorage.getItem('storeName') || undefined  // ✅ 从 localStorage 恢复
  }),

  actions: {
    async login(userInfo: { account: string; password: string }) {
      try {
        const res = await request({
          url: '/auth/login',
          method: 'post',
          data: userInfo
        });

        if ((res as any).code === 200 && (res as any).data) {
          const { token, name, role, userId, storeId, storeName } = (res as any).data;

          this.token = token;
          this.name = name || userInfo.account;
          this.role = role || 'MEMBER';
          this.userId = userId;
          this.storeId = storeId;  // ✅ 存储 storeId
          this.storeName = storeName;  // ✅ 存储 storeName

          localStorage.setItem('token', token);
          localStorage.setItem('name', this.name);
          localStorage.setItem('role', this.role);
          if (userId) {
            localStorage.setItem('userId', String(userId));
          }
          if (storeId) {
            localStorage.setItem('storeId', String(storeId));
          }
          if (storeName) {
            localStorage.setItem('storeName', storeName);
          }

          return Promise.resolve(res);
        } else {
          return Promise.reject(new Error((res as any).message || '登录失败'));
        }
      } catch (error) {
        console.error('登录出错:', error);
        return Promise.reject(error);
      }
    },

    logout() {
      this.token = '';
      this.name = '';
      this.role = 'MEMBER';
      this.userId = undefined;
      this.storeId = undefined;  // ✅ 清除 storeId
      this.storeName = undefined;  // ✅ 清除 storeName
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('storeId');  // ✅ 清除 storeId
      localStorage.removeItem('storeName');  // ✅ 清除 storeName
    }
  }
});