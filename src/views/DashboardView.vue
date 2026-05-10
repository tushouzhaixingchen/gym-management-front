<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-container">
      <div class="welcome-content">
        <h1 class="welcome-title">👋 欢迎回来，{{ userName }}！</h1>
        <p class="welcome-subtitle">{{ currentDate }}</p>
        <p class="welcome-message">祝您工作愉快，管理顺利！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const userName = computed(() => {
  return userStore.name || '管理员'
})

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${weekDay} ${hours}:${minutes}`
})

onMounted(() => {
  console.log('✅ DashboardView 组件已挂载')
})
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/resources/images/dashboard.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

/* 背景遮罩层 */
.dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 50%, rgba(240, 147, 251, 0.3) 100%);
  z-index: 0;
}

/* 背景装饰球 */
.dashboard::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
  z-index: 0;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.welcome-container {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              inset 0 0 60px rgba(255, 255, 255, 0.1);
  max-width: 800px;
  width: 90%;
  animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-40px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-title {
  font-size: 56px;
  font-weight: 900;
  color: white;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
               0 0 40px rgba(255, 255, 255, 0.3);
  letter-spacing: -1px;
  line-height: 1.2;
  animation: titlePulse 2s infinite ease-in-out;
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.welcome-subtitle {
  font-size: 28px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.welcome-message {
  font-size: 22px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-container {
    padding: 40px 30px;
  }
  
  .welcome-title {
    font-size: 42px;
  }
  
  .welcome-subtitle {
    font-size: 22px;
  }
  
  .welcome-message {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .welcome-container {
    padding: 30px 20px;
  }
  
  .welcome-title {
    font-size: 32px;
  }
  
  .welcome-subtitle {
    font-size: 18px;
  }
  
  .welcome-message {
    font-size: 16px;
  }
}
</style>
