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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginApi } from '@/utils/request';
import type { LoginData } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const form = ref<LoginData>({
  account: '',
  password: ''
});

const loading = ref(false);
const errorMsg = ref('');

// 🔧 页面加载时自动填充账号（从修改密码页面跳转过来）
onMounted(() => {
  const account = route.query.account as string
  const passwordChanged = route.query.passwordChanged as string
  
  if (account) {
    form.value.account = account
    console.log('📝 自动填充账号:', account)
  }
  
  if (passwordChanged === '1') {
    ElMessage.success('密码修改成功，请使用新密码登录')
    console.log('✅ 显示密码修改成功提示')
  }
})

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
    
    // 🔍 详细查看数据结构
    if (res.data) {
      console.log('🔍 data 的所有键:', Object.keys(res.data))
      if (res.data.userInfo) {
        console.log('🔍 userInfo 的所有键:', Object.keys(res.data.userInfo))
        console.log('🔍 userInfo.isInitialPassword:', res.data.userInfo.isInitialPassword)
      }
    }
    
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
      
      // 🔧 检查是否需要强制修改初始密码
      const forceChangePassword = data.forceChangePassword
      
      console.log('🔐 强制修改密码标识 (forceChangePassword):', forceChangePassword)
      console.log('  - 类型:', typeof forceChangePassword)
      console.log('  - 值:', forceChangePassword)
      console.log('  - 是否为 true:', forceChangePassword === true)
      
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
      
      // 🔧 保存密码（用于初始密码修改时自动填充）
      localStorage.setItem('lastPassword', form.value.password)

      console.log('💾 存储到 localStorage:');
      console.log('  - token:', token ? '✅' : '❌');
      console.log('  - name:', name);
      console.log('  - role:', finalRole);
      console.log('  - userId:', userId);
      console.log('  - storeId:', userStore.storeId);
      console.log('  - storeName:', userStore.storeName);
      console.log('  - lastPassword:', '✅ 已保存（用于修改密码）');

      ElMessage.success('登录成功');
      
      console.log('🎯 准备跳转，当前角色:', finalRole);
      console.log('🔐 是否需要修改初始密码:', forceChangePassword);
      
      // 🔧 如果是会员且需要强制修改密码，强制跳转到修改密码页面
      if (finalRole === 'MEMBER' && forceChangePassword === true) {
        console.log('  → 检测到需要强制修改密码，跳转到修改密码页面');
        router.push({
          path: '/member/change-password'
        });
      } else if (finalRole === 'ADMIN') {
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

/* 动态渐变背景 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 装饰性圆形元素 */
.login-container::before,
.login-container::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.login-container::before {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.login-container::after {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -50px;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.login-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
  border-radius: 28px;
  padding: 3.5rem 3rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideUp 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-icon {
  width: 88px;
  height: 88px;
  margin: 0 auto 1.8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.45);
  position: relative;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 12px 35px rgba(102, 126, 234, 0.45); }
  50% { box-shadow: 0 15px 45px rgba(102, 126, 234, 0.6); }
}

.logo-icon::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 26px;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  z-index: -1;
  opacity: 0.5;
  filter: blur(8px);
}

.logo-icon svg {
  width: 44px;
  height: 44px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.login-header h2 {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.6rem;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #718096;
  font-size: 1.05rem;
  font-weight: 400;
  letter-spacing: 0.3px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #2d3748;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
}

.form-group .icon {
  width: 20px;
  height: 20px;
  color: #667eea;
}

.form-group input {
  width: 100%;
  padding: 0.95rem 1.1rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f7fafc;
  color: #2d3748;
  font-weight: 500;
}

.form-group input:hover {
  border-color: #cbd5e0;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12), 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.login-btn {
  width: 100%;
  padding: 1.05rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.55);
}

.login-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.login-btn:disabled {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

.loading-spinner {
  width: 22px;
  height: 22px;
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
  gap: 0.6rem;
  padding: 1rem 1.1rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border: 1px solid #fc8181;
  border-radius: 14px;
  color: #c53030;
  font-size: 0.92rem;
  font-weight: 500;
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  box-shadow: 0 4px 12px rgba(252, 129, 129, 0.2);
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 2.5rem 2rem;
    border-radius: 24px;
  }

  .login-header h2 {
    font-size: 1.8rem;
  }

  .logo-icon {
    width: 76px;
    height: 76px;
    border-radius: 20px;
  }

  .logo-icon svg {
    width: 38px;
    height: 38px;
  }
  
  .login-btn {
    font-size: 1rem;
  }
}
</style>