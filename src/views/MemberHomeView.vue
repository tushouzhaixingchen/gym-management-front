<template>
  <div class="member-home">
    <el-row :gutter="20">
      <!-- 欢迎卡片 -->
      <el-col :span="24">
        <el-card shadow="hover" class="welcome-card">
          <div class="welcome-content">
            <el-avatar :size="80" class="avatar">
              {{ userName.charAt(0) }}
            </el-avatar>
            <div class="welcome-text">
              <h1 v-if="isGuest">欢迎游客访问！</h1>
              <h1 v-else>欢迎回来，{{ userName }}！</h1>
              <p>今天是 {{ currentDate }}，{{ isGuest ? '请先登录以享受完整功能' : '祝您健身愉快！' }}</p>
            </div>
            <div class="logout-btn">
              <el-button v-if="isGuest" type="primary" size="large" @click="handleLogin">
                <el-icon><User /></el-icon>
                登录
              </el-button>
              <el-button v-else type="danger" size="large" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 数据统计 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon :size="32"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.remainingCourses }}</div>
            <div class="stat-label">剩余课程</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon :size="32"><Ticket /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.coupons }}</div>
            <div class="stat-label">优惠券</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon :size="32"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.entryCount }}</div>
            <div class="stat-label">入场次数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #F56C6C;">
            <el-icon :size="32"><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.memberLevel }}</div>
            <div class="stat-label">当前等级</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷操作 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>快捷操作</h4>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" style="width: 100%;" size="large" @click="handleBookCourse">
            <el-icon><VideoPlay /></el-icon>
            预约教练
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" style="width: 100%;" size="large" @click="handleBuyCard">
            <el-icon><Ticket /></el-icon>
            购买卡券
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" style="width: 100%;" size="large" @click="handleScanEntry">
            <el-icon><VideoCamera /></el-icon>
            扫码入场
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" style="width: 100%;" size="large" @click="handleContactService">
            <el-icon><Service /></el-icon>
            联系客服
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <el-button type="primary" plain style="width: 100%;" size="large" @click="handleViewAnnouncements">
            <el-icon><Bell /></el-icon>
            查看公告
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 个人中心 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>个人中心</h4>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button type="primary" plain style="width: 100%;" size="large" @click="handleViewProfile">
            <el-icon><User /></el-icon>
            个人信息
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="success" plain style="width: 100%;" size="large" @click="handleChangePassword">
            <el-icon><Lock /></el-icon>
            修改密码
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="warning" plain style="width: 100%;" size="large" @click="handleMyBooking">
            <el-icon><Calendar /></el-icon>
            我的预约
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 今日课程 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>今日课程</h4>
          <el-button v-if="!isGuest" type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-empty v-if="todayCourses.length === 0" description="无" />
      <el-timeline v-else>
        <el-timeline-item 
          v-for="(course, index) in todayCourses" 
          :key="index"
          :timestamp="course.time" 
          placement="top"
        >
          <el-card>
            <h4>{{ course.name }}</h4>
            <p>教练：{{ course.coach }} | 地点：{{ course.location }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { 
  Calendar, Ticket, Clock, Trophy, 
  VideoPlay, VideoCamera, Service,
  User, Lock, SwitchButton, Bell
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 判断是否为游客模式（未登录状态）
const isGuest = computed(() => !userStore.token)

// 游客模式显示"游客"，登录模式显示用户名
const userName = computed(() => isGuest.value ? '游客' : (userStore.name || '会员'))

// 统计数据：游客模式全部为0，登录模式显示实际数据
const stats = computed(() => {
  if (isGuest.value) {
    return {
      remainingCourses: 0,
      coupons: 0,
      entryCount: 0,
      memberLevel: '未登录'
    }
  }
  // 登录模式：可以从接口获取数据，这里暂时使用固定值
  return {
    remainingCourses: 12,
    coupons: 3,
    entryCount: 28,
    memberLevel: '黄金会员'
  }
})

// 今日课程：游客模式显示无，登录模式显示课程列表
const todayCourses = computed(() => {
  if (isGuest.value) {
    return []
  }
  return [
    { time: '09:00 - 10:00', name: '瑜伽基础课', coach: '李老师', location: '瑜伽室 1' },
    { time: '18:00 - 19:30', name: '动感单车', coach: '王教练', location: '单车房' }
  ]
})

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 游客模式：点击任何功能都跳转登录页
const requireLogin = () => {
  if (isGuest.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return true
  }
  return false
}

// 预约课程
const handleBookCourse = () => {
  if (requireLogin()) return
  console.log('📅 预约课程')
  router.push('/member/coach-booking')
}

// 购买卡券
const handleBuyCard = () => {
  if (requireLogin()) return
  console.log('🎫 购买卡券')
  ElMessage.info('购买卡券功能开发中...')
}

// 扫码入场
const handleScanEntry = () => {
  if (requireLogin()) return
  console.log('📱 扫码入场')
  ElMessage.info('扫码入场功能开发中...')
}

// 联系客服
const handleContactService = () => {
  if (requireLogin()) return
  console.log('🎧 联系客服')
  ElMessage.info('联系客服功能开发中...')
}

// 查看个人信息
const handleViewProfile = () => {
  if (requireLogin()) return
  console.log('👤 查看个人信息')
  router.push('/member')
}

// 修改密码
const handleChangePassword = () => {
  if (requireLogin()) return
  console.log('🔒 修改密码')
  router.push('/member')
  // 可以通过路由参数或状态管理来直接打开修改密码对话框
  setTimeout(() => {
    // 触发MemberView中的修改密码对话框
    const event = new CustomEvent('open-password-dialog')
    window.dispatchEvent(event)
  }, 100)
}

// 我的预约
const handleMyBooking = () => {
  if (requireLogin()) return
  console.log('📋 我的预约')
  router.push('/member')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      console.log('🚪 退出登录')
      // 清除所有本地存储
      localStorage.clear()
      sessionStorage.clear()
      
      // 清除用户状态
      userStore.logout()
      
      ElMessage.success('退出登录成功')
      
      // 跳转到登录页
      router.push('/login')
    })
    .catch(() => {
      console.log('取消退出登录')
    })
}

// 跳转到登录页
const handleLogin = () => {
  console.log('🔑 跳转登录页')
  router.push('/login')
}

// 查看公告
const handleViewAnnouncements = () => {
  if (requireLogin()) return
  console.log('📢 查看公告')
  router.push('/member/announcements')
}

</script>

<style scoped>
.member-home {
  padding: 0;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
  min-height: 100vh;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  border: none;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-card::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 28px;
  position: relative;
  z-index: 1;
}

.logout-btn {
  margin-left: auto;
}

.logout-btn :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logout-btn :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.avatar {
  border: 4px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  font-size: 32px;
}

.welcome-text h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-text p {
  margin: 0;
  font-size: 15px;
  opacity: 0.95;
  font-weight: 400;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 28px 24px;
  border-radius: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 15px;
  color: #909399;
  font-weight: 500;
}

.section-card {
  margin-bottom: 24px;
  border-radius: 18px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.section-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: -0.3px;
}

.section-card :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 52px;
  font-size: 15px;
  letter-spacing: 0.3px;
}

.section-card :deep(.el-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.section-card :deep(.el-button:active) {
  transform: translateY(-1px);
}

.section-card :deep(.el-timeline) {
  padding-left: 8px;
}

.section-card :deep(.el-timeline-item__timestamp) {
  font-weight: 600;
  color: #667eea;
}

.section-card :deep(.el-card__body) {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }
  
  .logout-btn {
    margin-left: 0;
    width: 100%;
  }
  
  .welcome-text h1 {
    font-size: 26px;
  }
  
  .stat-value {
    font-size: 28px;
  }
}
</style>