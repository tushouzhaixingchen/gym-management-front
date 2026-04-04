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
  state: () => ({
    token: localStorage.getItem('token') || '',
    name: localStorage.getItem('name') || '',
    role: localStorage.getItem('role') || 'MEMBER',
    userId: (() => {
      const userId = localStorage.getItem('userId')
      return userId ? Number(userId) : undefined
    })(),
    // 🔧 关键修复：从 localStorage 重新读取，解决浏览器回退问题
    storeId: (() => {
      const storeIdStr = localStorage.getItem('storeId')
      if (storeIdStr === null || storeIdStr === 'null') {
        console.log('🔐 userStore 初始化 - localStorage storeId: null (超级管理员)')
        return undefined  // 超级管理员
      }
      const storeId = Number(storeIdStr)
      console.log('🔐 userStore 初始化 - localStorage storeId:', storeIdStr, '转换后:', storeId)
      return storeId
    })(),
    storeName: localStorage.getItem('storeName') || undefined
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
          // 🔧 关键修复：先清除所有旧数据，再存储新数据
          console.log('🔐 开始登录，清除旧数据...')
          localStorage.removeItem('token')
          localStorage.removeItem('name')
          localStorage.removeItem('role')
          localStorage.removeItem('userId')
          localStorage.removeItem('storeId')
          localStorage.removeItem('storeName')

          const userData = (res as any).data.userInfo || (res as any).data
          
          console.log('🔐 登录响应数据:', (res as any).data)
          console.log('🔐 解析后的用户数据:', userData)
          
          const { token } = (res as any).data
          const { id, account, realName, userType, roleId, storeId, storeName, avatar } = userData

          this.token = token
          this.name = realName || account || userInfo.account
          this.role = userType || 'MEMBER'
          this.userId = id
          this.storeId = storeId
          this.storeName = storeName

          console.log('🔐 存储到 userStore:', {
            token: this.token ? '已设置' : '未设置',
            name: this.name,
            role: this.role,
            userId: this.userId,
            storeId: this.storeId,
            storeName: this.storeName
          })

          localStorage.setItem('token', token)
          localStorage.setItem('name', this.name)
          localStorage.setItem('role', this.role)
          if (id) {
            localStorage.setItem('userId', String(id))
          }
          
          // 🔧 关键修复：超级管理员 storeId 为 null/undefined，普通管理员有值
          if (storeId !== null && storeId !== undefined && storeId !== 0) {
            localStorage.setItem('storeId', String(storeId))
            this.storeId = storeId  // 🔧 同时更新 userStore
            console.log('✅ 普通管理员，已存储 storeId:', storeId)
          } else {
            localStorage.removeItem('storeId')
            this.storeId = undefined  // 🔧 超级管理员，设置为 undefined
            console.log('✅ 超级管理员，已清除 storeId (值为:', storeId, ')')
          }
          
          if (storeName) {
            localStorage.setItem('storeName', storeName)
            this.storeName = storeName  // 🔧 同时更新 userStore
          } else {
            localStorage.removeItem('storeName')
            this.storeName = undefined  // 🔧 清除 userStore
          }

          console.log('✅ 登录完成，localStorage 和 userStore 已更新')
          console.log('📋 最终 userStore.storeId:', this.storeId)
          console.log('📋 最终 userStore.storeName:', this.storeName)
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