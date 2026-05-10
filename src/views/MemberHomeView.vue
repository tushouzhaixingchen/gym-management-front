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
    
    <!-- 快捷操作 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>快捷操作</h4>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" style="width: 100%;" size="large" @click="handleEnrollCourse">
            <el-icon><Calendar /></el-icon>
            报名课程
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" style="width: 100%;" size="large" @click="handleBookCourse">
            <el-icon><VideoCamera /></el-icon>
            预约教练
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" style="width: 100%;" size="large" @click="handleViewAnnouncements">
            <el-icon><Bell /></el-icon>
            查看公告
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" style="width: 100%;" size="large" @click="handleMyProfile">
            <el-icon><User /></el-icon>
            个人中心
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 最近预约 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>最近预约</h4>
          <el-button v-if="!isGuest" type="primary" link @click="handleViewAllAppointments">查看全部</el-button>
        </div>
      </template>
      <div v-if="isGuest" class="guest-tip">
        <el-empty description="登录后即可查看您的预约记录" />
      </div>
      <div v-else-if="loading" class="loading-tip">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="recentAppointments.length === 0" class="empty-tip">
        <el-empty description="暂无预约记录">
          <el-button type="primary" @click="handleBookCourse">立即预约</el-button>
        </el-empty>
      </div>
      <div v-else class="appointment-list">
        <el-card 
          v-for="item in recentAppointments" 
          :key="item.id" 
          class="appointment-item"
          shadow="hover"
          @click="handleViewAppointmentDetail(item)"
        >
          <div class="appointment-info">
            <div class="appointment-header">
              <span class="appointment-no">{{ item.appointmentNo }}</span>
              <el-tag :type="getAppointmentStatusType(item.status)">
                {{ getAppointmentStatusText(item.status) }}
              </el-tag>
            </div>
            <div class="appointment-detail">
              <p><strong>教练：</strong>{{ item.coachName }}</p>
              <p><strong>时间：</strong>{{ formatTime(item.timeSlotStart) }}</p>
              <p><strong>门店：</strong>{{ item.storeName }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 最新公告 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>最新公告</h4>
          <el-button type="primary" link @click="handleViewAllAnnouncements">查看全部</el-button>
        </div>
      </template>
      <div v-if="loadingAnnouncements" class="loading-tip">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="recentAnnouncements.length === 0" class="empty-tip">
        <el-empty description="暂无公告" />
      </div>
      <div v-else class="announcement-list">
        <el-card 
          v-for="item in recentAnnouncements" 
          :key="item.id" 
          class="announcement-item"
          shadow="hover"
          @click="handleViewAnnouncementDetail(item)"
        >
          <div class="announcement-header">
            <el-tag :type="getPriorityType(item.priority)" size="small">
              {{ getPriorityText(item.priority) }}
            </el-tag>
            <h5 class="announcement-title">{{ item.title }}</h5>
          </div>
          <div class="announcement-footer">
            <span class="publish-time">发布时间：{{ formatDate(item.publishTime || item.createdAt) }}</span>
            <el-button type="primary" text size="small">查看详情</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { 
  Calendar, Bell, User, SwitchButton, VideoCamera
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

// 判断是否为游客模式（未登录状态）
const isGuest = computed(() => !userStore.token)

// 游客模式显示"游客"，登录模式显示用户名
const userName = computed(() => isGuest.value ? '游客' : (userStore.name || '会员'))

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 最近预约数据
const recentAppointments = ref<any[]>([])
const loading = ref(false)

// 最新公告数据
const recentAnnouncements = ref<any[]>([])
const loadingAnnouncements = ref(false)

// 游客模式：点击任何功能都跳转登录页
const requireLogin = () => {
  if (isGuest.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return true
  }
  return false
}

// 报名课程
const handleEnrollCourse = () => {
  if (requireLogin()) return
  router.push('/member/courses')
}

// 预约教练
const handleBookCourse = () => {
  if (requireLogin()) return
  router.push('/member/coach-booking')
}

// 查看公告
const handleViewAnnouncements = () => {
  router.push('/member/announcements')
}

// 查看所有公告
const handleViewAllAnnouncements = () => {
  router.push('/member/announcements')
}

// 查看公告详情
const handleViewAnnouncementDetail = async (item: any) => {
  try {
    const res = await request({
      url: `/member/announcements/${item.id}`,
      method: 'get'
    })
    
    let detailData = item
    if (res && typeof res === 'object') {
      const resData = res as any
      if (resData.code === 200 && resData.data) {
        detailData = resData.data
      }
    }
    
    // 跳转到详情页或打开对话框（这里简单处理，直接跳转）
    ElMessage.info(`查看公告：${detailData.title}`)
  } catch (error: any) {
    console.error('加载公告详情失败:', error)
  }
}

// 个人中心
const handleMyProfile = () => {
  if (requireLogin()) return
  router.push('/member')
}

// 查看所有预约
const handleViewAllAppointments = () => {
  if (requireLogin()) return
  router.push('/member')
}

// 查看预约详情
const handleViewAppointmentDetail = (item: any) => {
  if (requireLogin()) return
  ElMessage.info(`查看预约：${item.appointmentNo}`)
  // 可以跳转到详情页或在MemberView中打开对话框
  router.push('/member')
}

// 获取最近预约
const loadRecentAppointments = async () => {
  if (isGuest.value || !userStore.userId) {
    return
  }
  
  loading.value = true
  try {
    const res = await request({
      url: `/member/appointments/my`,
      method: 'get',
      params: { page: 1, size: 5 }
    })
    
    let dataList = []
    if (Array.isArray(res)) {
      dataList = res
    } else if (res && typeof res === 'object') {
      const resData = res as any
      if (resData.code === 200) {
        const data = resData.data
        if (Array.isArray(data)) {
          dataList = data
        } else if (data && Array.isArray(data.records)) {
          dataList = data.records
        } else if (data && Array.isArray(data.list)) {
          dataList = data.list
        }
      }
    }
    
    // 只取最近的5条
    recentAppointments.value = dataList.slice(0, 5)
  } catch (error: any) {
    console.error('加载预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取最新公告
const loadRecentAnnouncements = async () => {
  loadingAnnouncements.value = true
  try {
    const res = await request({
      url: '/member/announcements',
      method: 'get',
      params: { page: 1, size: 5, expiredStatus: 0 }
    })
    
    let dataList = []
    if (Array.isArray(res)) {
      dataList = res
    } else if (res && typeof res === 'object') {
      const resData = res as any
      if (resData.code === 200) {
        const data = resData.data
        if (Array.isArray(data)) {
          dataList = data
        } else if (data && Array.isArray(data.records)) {
          dataList = data.records
        } else if (data && Array.isArray(data.list)) {
          dataList = data.list
        }
      }
    }
    
    // 只取最近的5条
    recentAnnouncements.value = dataList.slice(0, 5)
  } catch (error: any) {
    console.error('加载公告列表失败:', error)
  } finally {
    loadingAnnouncements.value = false
  }
}

// 工具函数
const getAppointmentStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'success',
    3: 'info',
    4: 'danger'
  }
  return types[status] || 'info'
}

const getAppointmentStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待确认',
    1: '已确认',
    2: '已完成',
    3: '已取消',
    4: '已爽约'
  }
  return texts[status] || '未知'
}

const getPriorityText = (priority: number) => {
  const texts: Record<number, string> = {
    1: '普通',
    2: '重要',
    3: '紧急'
  }
  return texts[priority] || '普通'
}

const getPriorityType = (priority: number) => {
  const types: Record<number, string> = {
    1: 'info',
    2: 'warning',
    3: 'danger'
  }
  return types[priority] || 'info'
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return '—'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
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
  router.push('/login')
}

// 页面加载时获取数据
onMounted(() => {
  if (!isGuest.value) {
    loadRecentAppointments()
  }
  loadRecentAnnouncements()
})

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

/* 预约列表样式 */
.appointment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.appointment-item {
  cursor: pointer;
  transition: all 0.3s;
}

.appointment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.appointment-info {
  padding: 8px 0;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.appointment-no {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.appointment-detail p {
  margin: 6px 0;
  font-size: 14px;
  color: #909399;
}

.appointment-detail strong {
  color: #303133;
}

/* 公告列表样式 */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  cursor: pointer;
  transition: all 0.3s;
}

.announcement-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.announcement-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.announcement-title {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  flex: 1;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #EBEEF5;
}

.publish-time {
  color: #909399;
  font-size: 13px;
}

/* 空状态和加载状态 */
.guest-tip,
.loading-tip,
.empty-tip {
  padding: 20px 0;
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
  
  .appointment-list {
    grid-template-columns: 1fr;
  }
}
</style>
