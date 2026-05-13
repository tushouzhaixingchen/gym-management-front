import { defineStore } from 'pinia';
import request from '@/utils/request';
import {
  readAuthSession,
  writeAuthSession,
  clearAuthSession,
  appRoleFromPath,
  parseLoginSuccessPayload,
  inferLoginBucketRole,
} from '@/utils/authSession';
import type { AuthSessionSnapshot, RoleType } from '@/utils/authSession';

export type { RoleType };

export interface UserState {
  token: string;
  name: string;
  role: RoleType;
  userId?: number;
  storeId?: number;
  storeName?: string;
}

function emptyState(): UserState {
  return {
    token: '',
    name: '',
    role: 'MEMBER',
    userId: undefined,
    storeId: undefined,
    storeName: undefined,
  };
}

function applySnapshot(target: UserState, snap: AuthSessionSnapshot) {
  target.token = snap.token;
  target.name = snap.name;
  target.role = snap.role;
  target.userId = snap.userId;
  target.storeId = snap.storeId;
  target.storeName = snap.storeName;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => emptyState(),

  actions: {
    /** 根据当前路由同步 Pinia 中的「当前端」会话（管理端 / 会员端互不覆盖） */
    hydrateFromPath(path: string) {
      const ctx = appRoleFromPath(path);
      if (!ctx) {
        Object.assign(this, emptyState());
        return;
      }
      const snap = readAuthSession(ctx);
      if (!snap) {
        Object.assign(this, emptyState());
        return;
      }
      applySnapshot(this as UserState, snap);
    },

    async login(credentials: { account: string; password: string }) {
      try {
        const res = await request({
          url: '/auth/login',
          method: 'post',
          data: credentials,
        });

        if ((res as any).code === 200) {
          const { token, userInfo: apiUser, data } = parseLoginSuccessPayload(res);
          if (!token) {
            return Promise.reject(new Error('登录成功但未返回 token，请检查接口数据'));
          }

          const userData =
            apiUser && Object.keys(apiUser).length ? apiUser : (data as Record<string, unknown>);
          const { id, account, realName, storeId, storeName } = userData as {
            id?: number;
            account?: string;
            realName?: string;
            storeId?: number | null;
            storeName?: string;
          };

          const r = inferLoginBucketRole(
            userData as Record<string, any>,
            data as Record<string, any>,
            credentials.account
          );

          this.token = token;
          this.name = realName || account || credentials.account;
          this.role = r;
          this.userId = id;
          this.storeId =
            storeId !== null && storeId !== undefined && storeId !== 0 ? storeId : undefined;
          this.storeName = storeName || undefined;

          const payload: Parameters<typeof writeAuthSession>[1] = {
            token,
            name: this.name,
            role: r,
            storeId:
              storeId !== null && storeId !== undefined && storeId !== 0 ? storeId : null,
            storeName: storeName || '',
          };
          if (id != null) payload.userId = id;
          writeAuthSession(r, payload);

          const verify = readAuthSession(r);
          if (!verify?.token) {
            return Promise.reject(new Error('登录态未能写入本地 storage'));
          }

          return Promise.resolve(res);
        }
        return Promise.reject(new Error((res as any).message || '登录失败'));
      } catch (error) {
        console.error('登录出错:', error);
        return Promise.reject(error);
      }
    },

    /**
     * 退出登录。传入角色时只清除该端会话，另一端不受影响。
     */
    logout(role?: RoleType) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const inferred = appRoleFromPath(path);
      const r = role ?? inferred;
      if (r) clearAuthSession(r);
      Object.assign(this, emptyState());
    },
  },
});
