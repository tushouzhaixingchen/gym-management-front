export type RoleType = 'ADMIN' | 'MEMBER';

const AUTH_DEBUG =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

function dbg(tag: string, payload: Record<string, unknown>) {
  if (!AUTH_DEBUG) return;
  try {
    console.log(`[auth:${tag}]`, payload);
  } catch {
    /* ignore */
  }
}

function maskToken(t: string | null | undefined): string {
  if (!t) return '(empty)';
  if (t.length <= 12) return `${t.slice(0, 4)}…(${t.length})`;
  return `${t.slice(0, 8)}…${t.slice(-4)}(${t.length})`;
}

/**
 * 从登录响应推断写入哪个分桶。避免仅根据账号名包含 admin 误判（如管理员账号 patrick → 被写入 MEMBER 桶导致 /admin 守卫读不到）。
 */
export function inferLoginBucketRole(
  userInfo: Record<string, any>,
  data: Record<string, any>,
  loginAccount: string
): RoleType {
  const pick = (...vals: unknown[]) => {
    for (const v of vals) {
      if (v === null || v === undefined || v === '') continue;
      const s = String(v).trim();
      if (!s) continue;
      const u = s.toUpperCase();
      if (u === 'ADMIN' || u === 'ADMINISTRATOR' || u === 'SUPER_ADMIN' || u === 'STORE_ADMIN')
        return 'ADMIN' as RoleType;
      if (u === 'MEMBER' || u === 'USER' || u === 'CUSTOMER') return 'MEMBER' as RoleType;
    }
    return null;
  };

  const fromStrings = pick(
    userInfo.userType,
    userInfo.role,
    userInfo.userRole,
    data.userType,
    data.role,
    data.userRole
  );
  if (fromStrings) {
    dbg('inferLoginBucketRole', { source: 'userType/role', result: fromStrings, loginAccount });
    return fromStrings;
  }

  const rid = userInfo.roleId ?? data.roleId ?? userInfo.role_id ?? data.role_id;
  if (rid !== undefined && rid !== null && rid !== '') {
    const n = Number(rid);
    if (!Number.isNaN(n) && n === 1) {
      dbg('inferLoginBucketRole', { source: 'roleId===1', result: 'ADMIN', loginAccount, rid });
      return 'ADMIN';
    }
  }

  const acc = loginAccount.toLowerCase();
  if (acc.includes('admin')) {
    dbg('inferLoginBucketRole', { source: 'accountHeuristic', result: 'ADMIN', loginAccount });
    return 'ADMIN';
  }
  dbg('inferLoginBucketRole', { source: 'default', result: 'MEMBER', loginAccount });
  return 'MEMBER';
}

/**
 * 管理端 / 会员端会话分桶存储，支持双端同时登录。
 * 使用 localStorage（同 origin 下多标签页共享），避免 sessionStorage 按标签隔离导致一端登录、另一标签访问会员路由时读不到 token。
 */
const BUCKET: Record<RoleType, string> = {
  ADMIN: 'gym_auth_admin_',
  MEMBER: 'gym_auth_member_',
};

/** 兼容历史/其它分支可能写入的键名（只读回退，写入仍以 gym_auth_* 为准） */
const LEGACY_TOKEN_KEY: Record<RoleType, string> = {
  ADMIN: 'admin_token',
  MEMBER: 'member_token',
};

const SESSION_FIELDS = [
  'token',
  'name',
  'role',
  'userId',
  'storeId',
  'storeName',
  'lastPassword',
] as const;

function storageKey(role: RoleType, field: string): string {
  return `${BUCKET[role]}${field}`;
}

function authGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function authSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    /* quota / private mode */
    return false;
  }
}

function authRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** 将上一版写在 sessionStorage 的分桶迁到 localStorage（仅本地尚无该桶 token 时整桶迁入） */
function migrateSessionStorageBucketsToLocal() {
  if (typeof sessionStorage === 'undefined') return;
  for (const role of ['ADMIN', 'MEMBER'] as RoleType[]) {
    const sessionTok = sessionStorage.getItem(storageKey(role, 'token'));
    if (!sessionTok) continue;
    const localTok = authGet(storageKey(role, 'token'));
    if (!localTok) {
      for (const f of SESSION_FIELDS) {
        const k = storageKey(role, f);
        const v = sessionStorage.getItem(k);
        if (v != null && v !== '') authSet(k, v);
        sessionStorage.removeItem(k);
      }
    } else {
      for (const f of SESSION_FIELDS) {
        sessionStorage.removeItem(storageKey(role, f));
      }
    }
  }
}

/**
 * localStorage 中该端 token 缺失时，尝试从 sessionStorage 分桶拉回（热更新/异常路径可能只写了一边）
 */
function ensureRoleBucketAvailableInLocal(role: RoleType) {
  if (authGet(storageKey(role, 'token'))) return;
  if (typeof sessionStorage === 'undefined') return;
  const sessionTok = sessionStorage.getItem(storageKey(role, 'token'));
  if (!sessionTok) return;
  for (const f of SESSION_FIELDS) {
    const k = storageKey(role, f);
    const v = sessionStorage.getItem(k);
    if (v != null && v !== '') authSet(k, v);
    sessionStorage.removeItem(k);
  }
}

function pickNonEmptyString(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

/**
 * 兼容多种后端登录 JSON 结构，避免 token 取错为 undefined 却先执行了 clearAuthSession 导致整桶被清空。
 */
export function parseLoginSuccessPayload(res: any): {
  token: string | null;
  userInfo: Record<string, any>;
  data: Record<string, any>;
} {
  const root = res && typeof res === 'object' ? res : {};
  const data =
    root.data !== undefined && root.data !== null && typeof root.data === 'object'
      ? (root.data as Record<string, any>)
      : (root as Record<string, any>);
  const token =
    pickNonEmptyString(data.token) ??
    pickNonEmptyString(data.accessToken) ??
    pickNonEmptyString((root as any).token) ??
    pickNonEmptyString((root as any).accessToken);
  const userInfo =
    (data.userInfo && typeof data.userInfo === 'object' ? (data.userInfo as Record<string, any>) : null) ||
    (data.user && typeof data.user === 'object' ? (data.user as Record<string, any>) : null) ||
    {};
  return { token, userInfo, data };
}

export function appRoleFromPath(path: string): RoleType | null {
  if (path.startsWith('/admin')) return 'ADMIN';
  if (path.startsWith('/member')) return 'MEMBER';
  return null;
}

export function getTokenForRequestPath(pathname: string): string | null {
  const role = appRoleFromPath(pathname);
  if (!role) return null;
  return readAuthSession(role)?.token ?? null;
}

export interface AuthSessionSnapshot {
  token: string;
  name: string;
  role: RoleType;
  userId?: number;
  storeId?: number;
  storeName?: string;
}

export function readAuthSession(role: RoleType): AuthSessionSnapshot | null {
  migrateSessionStorageBucketsToLocal();
  ensureRoleBucketAvailableInLocal(role);
  let token = authGet(storageKey(role, 'token'));
  if (!token) {
    const legacy = authGet(LEGACY_TOKEN_KEY[role]);
    if (legacy) {
      dbg('readAuthSession', {
        role,
        note: 'migrated legacy token key → gym_auth_*',
        legacyKey: LEGACY_TOKEN_KEY[role],
        token: maskToken(legacy),
      });
      authSet(storageKey(role, 'token'), legacy);
      authRemove(LEGACY_TOKEN_KEY[role]);
      token = authGet(storageKey(role, 'token'));
    }
  }
  if (!token) {
    dbg('readAuthSession', { role, primaryKey: storageKey(role, 'token'), token: null });
    return null;
  }
  const name = authGet(storageKey(role, 'name')) || '';
  let roleVal = (authGet(storageKey(role, 'role')) || role) as string;
  roleVal = roleVal.toUpperCase();
  const r = (roleVal === 'ADMIN' ? 'ADMIN' : 'MEMBER') as RoleType;
  const userIdStr = authGet(storageKey(role, 'userId'));
  const storeIdStr = authGet(storageKey(role, 'storeId'));
  let storeId: number | undefined;
  if (storeIdStr !== null && storeIdStr !== 'null' && storeIdStr !== '') {
    const n = Number(storeIdStr);
    if (!Number.isNaN(n) && n !== 0) storeId = n;
  }
  return {
    token,
    name,
    role: r,
    userId: userIdStr ? Number(userIdStr) : undefined,
    storeId,
    storeName: authGet(storageKey(role, 'storeName')) || undefined,
  };
}

export function writeAuthSession(
  role: RoleType,
  data: Partial<
    AuthSessionSnapshot & {
      lastPassword?: string;
    }
  >
) {
  if (data.token !== undefined) {
    const ok = authSet(storageKey(role, 'token'), data.token);
    if (!ok) {
      dbg('writeAuthSession', { role, err: 'localStorage.setItem failed', key: storageKey(role, 'token') });
    } else {
      dbg('writeAuthSession', {
        role,
        key: storageKey(role, 'token'),
        token: maskToken(data.token),
        verify: maskToken(authGet(storageKey(role, 'token'))),
      });
    }
    // 同步清理易混淆的旧键，避免其它代码读到过期 admin_token
    authRemove(LEGACY_TOKEN_KEY[role]);
  }
  if (data.name !== undefined) authSet(storageKey(role, 'name'), data.name);
  if (data.role !== undefined) authSet(storageKey(role, 'role'), data.role);
  if (data.userId !== undefined) {
    if (data.userId === null || Number.isNaN(Number(data.userId))) {
      authRemove(storageKey(role, 'userId'));
    } else {
      authSet(storageKey(role, 'userId'), String(data.userId));
    }
  }
  if ('storeId' in data) {
    const v = data.storeId;
    if (v === undefined) {
      /* omit */
    } else if (v === null || v === 0 || Number.isNaN(Number(v))) {
      authRemove(storageKey(role, 'storeId'));
    } else {
      authSet(storageKey(role, 'storeId'), String(v));
    }
  }
  if (data.storeName !== undefined) {
    if (data.storeName) authSet(storageKey(role, 'storeName'), data.storeName);
    else authRemove(storageKey(role, 'storeName'));
  }
  if (data.lastPassword !== undefined) {
    if (data.lastPassword) authSet(storageKey(role, 'lastPassword'), data.lastPassword);
    else authRemove(storageKey(role, 'lastPassword'));
  }
}

export function clearAuthSession(role: RoleType) {
  for (const f of SESSION_FIELDS) {
    authRemove(storageKey(role, f));
  }
  authRemove(LEGACY_TOKEN_KEY[role]);
}

export function getMemberLastPassword(): string | null {
  return authGet(storageKey('MEMBER', 'lastPassword'));
}

/** 启动时：sessionStorage 分桶 → localStorage；旧版扁平 token → 分桶 */
export function migrateLegacyAuthSession() {
  migrateSessionStorageBucketsToLocal();

  const legacyToken = sessionStorage.getItem('token');
  if (!legacyToken) return;

  const hasNew =
    authGet(storageKey('ADMIN', 'token')) || authGet(storageKey('MEMBER', 'token'));

  if (hasNew) {
    clearLegacyFlatKeys();
    return;
  }

  const rawRole = (sessionStorage.getItem('role') || 'MEMBER').toUpperCase();
  const role: RoleType = rawRole === 'ADMIN' ? 'ADMIN' : 'MEMBER';
  writeAuthSession(role, {
    token: legacyToken,
    name: sessionStorage.getItem('name') || '',
    role,
  });
  const uid = sessionStorage.getItem('userId');
  if (uid) writeAuthSession(role, { userId: Number(uid) });
  const sid = sessionStorage.getItem('storeId');
  if (sid !== null && sid !== 'null' && sid !== '') {
    const n = Number(sid);
    if (!Number.isNaN(n) && n !== 0) writeAuthSession(role, { storeId: n });
  }
  const sname = sessionStorage.getItem('storeName');
  if (sname) writeAuthSession(role, { storeName: sname });
  const lp = sessionStorage.getItem('lastPassword');
  if (lp && role === 'MEMBER') writeAuthSession(role, { lastPassword: lp });
  clearLegacyFlatKeys();
}

function clearLegacyFlatKeys() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('storeId');
  sessionStorage.removeItem('storeName');
  sessionStorage.removeItem('lastPassword');
}

export function authGuardSnapshot(path: string): { token: string | null; role: RoleType | null } {
  const ctx = appRoleFromPath(path);
  if (!ctx) return { token: null, role: null };
  dumpAuthStorageState('authGuard:beforeRead', path);
  const snap = readAuthSession(ctx);
  if (!snap) {
    dbg('authGuardSnapshot', { path, ctx, token: null });
    return { token: null, role: null };
  }
  dbg('authGuardSnapshot', { path, ctx, role: snap.role, token: maskToken(snap.token) });
  return { token: snap.token, role: snap.role };
}

/** 开发环境：打印与鉴权相关的 localStorage 键，便于排查双端切换问题 */
export function dumpAuthStorageState(reason: string, path: string) {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return;
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith('gym_auth_') || k === 'admin_token' || k === 'member_token' || k === 'token')
      ) {
        keys.push(k);
      }
    }
  } catch {
    /* ignore */
  }
  console.log('[auth:storage]', reason, { path, keys });
}
