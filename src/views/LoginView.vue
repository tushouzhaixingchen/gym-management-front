<template>
  <div class="login-container">
    <!-- 风景图片背景 -->
    <div class="background-image"></div>
    <div class="background-overlay"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>健身房管理系统</h2>
        <p class="subtitle">欢迎登录</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="account">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>账号</span>
          </label>
          <input 
            id="account"
            v-model="form.account" 
            type="text" 
            placeholder="请输入账号" 
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label for="password">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>密码</span>
          </label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="!loading">立即登录</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <p v-if="errorMsg" class="error-message">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {{ errorMsg }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginApi } from '@/utils/request';
import type { LoginData } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const form = ref<LoginData>({
  account: '',
  password: ''
});

const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  if (!form.value.account || !form.value.password) {
    errorMsg.value = '请输入完整的账号密码';
    ElMessage.warning('请输入完整的账号和密码');
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  console.log('🚀 开始登录...');
  console.log('  - 账号:', form.value.account);
  console.log('  - 密码:', '*'.repeat(form.value.password.length));

  try {
    const res: any = await loginApi(form.value);
    
    console.log('📦 登录接口完整响应:', res);
    console.log('  - 响应 code:', res.code);
    console.log('  - 响应 message:', res.message);
    console.log('  - 响应 data:', JSON.stringify(res.data, null, 2));

    if (res.code === 200) {
      const data = res.data || {};
      
      const token = data.token || data.accessToken;
      const name = data.name || data.username || data.account || data.realName || form.value.account;
      
      const userInfo = data.userInfo || data.user || {};
      const role = userInfo.userType || userInfo.role || userInfo.userRole || data.userType || data.role;
      const userId = userInfo.id || data.userId || data.id || data.adminId;
      const storeId = userInfo.storeId || data.storeId;  // ✅ 提取 storeId
      const storeName = userInfo.storeName || data.storeName;  // ✅ 提取 storeName
      
      console.log(' 解析用户信息:');
      console.log('  - token:', token ? '✅ 存在' : '❌ 不存在');
      console.log('  - name:', name);
      console.log('  - userInfo:', userInfo);
      console.log('  - 原始 role:', role);
      console.log('  - userId:', userId);
      console.log('  - storeId:', storeId);
      console.log('  - storeName:', storeName);
      
      let finalRole = role;
      if (!finalRole) {
        const account = form.value.account;
        if (account.toLowerCase().includes('admin')) {
          finalRole = 'ADMIN';
          console.log('  ⚠️ 未检测到 role，根据账号推断为 ADMIN');
        } else {
          finalRole = 'MEMBER';
          console.log('  ⚠️ 未检测到 role，根据账号推断为 MEMBER');
        }
      } else {
        finalRole = finalRole.toUpperCase();
        console.log('  ✅ role 转为大写:', finalRole);
      }
      
      userStore.token = token;
      userStore.name = name;
      userStore.role = finalRole;
      if (userId) {
        userStore.userId = userId;
      }
      
      // 🔧 关键修复：先清除所有旧数据
      console.log(' 清除旧数据...')
      localStorage.removeItem('token')
      localStorage.removeItem('name')
      localStorage.removeItem('role')
      localStorage.removeItem('userId')
      localStorage.removeItem('storeId')
      localStorage.removeItem('storeName')
      
      // 🔧 处理 storeId：超级管理员为 null/undefined，普通管理员有值
      if (storeId !== null && storeId !== undefined && storeId !== 0) {
        userStore.storeId = storeId
        localStorage.setItem('storeId', String(storeId))
        console.log('✅ 普通管理员，已存储 storeId:', storeId)
      } else {
        userStore.storeId = undefined
        console.log('✅ 超级管理员，已清除 storeId')
      }
      
      if (storeName) {
        userStore.storeName = storeName
        localStorage.setItem('storeName', storeName)
      } else {
        userStore.storeName = undefined
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('name', name)
      localStorage.setItem('role', finalRole)
      if (userId) {
        localStorage.setItem('userId', String(userId))
      }

      console.log('💾 存储到 localStorage:');
      console.log('  - token:', token ? '✅' : '❌');
      console.log('  - name:', name);
      console.log('  - role:', finalRole);
      console.log('  - userId:', userId);
      console.log('  - storeId:', userStore.storeId);
      console.log('  - storeName:', userStore.storeName);

      ElMessage.success('登录成功');
      
      console.log('🎯 准备跳转，当前角色:', finalRole);
      if (finalRole === 'ADMIN') {
        console.log('  → 跳转到管理后台：/admin/home');
        router.push('/admin/home');
      } else {
        console.log('  → 跳转到会员中心：/member/home');
        router.push('/member/home');
      }
    } else {
      errorMsg.value = res.message || '登录失败，请检查账号密码';
      ElMessage.error(res.message || '登录失败，请检查账号密码');
      console.error('❌ 登录失败:', res.message);
    }

  } catch (error: any) {
    const msg = error.response?.data?.message || 
                error.response?.data || 
                error.message || 
                '网络连接失败';
    errorMsg.value = msg;
    ElMessage.error(msg);
    console.error('❌ 登录异常:', error);
    console.error('错误详情:', error.response?.data);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 风景图片背景 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop') no-repeat center center;
  background-size: cover;
  z-index: 0;
}

/* 遮罩层 - 让背景变暗，突出前景卡片 */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
  z-index: 1;
}

.login-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.logo-icon svg {
  width: 40px;
  height: 40px;
}

.login-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group .icon {
  width: 18px;
  height: 18px;
  color: #667eea;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: #2d3748;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: #a0aec0;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
  cursor: not-allowed;
  box-shadow: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #fff5f5;
  border: 1px solid #fc8181;
  border-radius: 12px;
  color: #c53030;
  font-size: 0.9rem;
  animation: shake 0.5s ease-in-out;
}

.error-message svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-icon svg {
    width: 30px;
    height: 30px;
  }
}
</style>