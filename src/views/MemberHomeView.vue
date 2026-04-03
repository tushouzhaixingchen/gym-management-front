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
              <h1>欢迎回来，{{ userName }}！</h1>
              <p>今天是 {{ currentDate }}，祝您健身愉快！</p>
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
            <div class="stat-value">12</div>
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
            <div class="stat-value">3</div>
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
            <div class="stat-value">28</div>
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
            <div class="stat-value">黄金会员</div>
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
            预约课程
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
    </el-card>
    
    <!-- 今日课程 -->
    <el-card class="section-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h4>今日课程</h4>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item timestamp="09:00 - 10:00" placement="top">
          <el-card>
            <h4>瑜伽基础课</h4>
            <p>教练：李老师 | 地点：瑜伽室 1</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="18:00 - 19:30" placement="top">
          <el-card>
            <h4>动感单车</h4>
            <p>教练：王教练 | 地点：单车房</p>
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
  VideoPlay, VideoCamera, Service 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const userName = computed(() => userStore.name || '会员')

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 预约课程
const handleBookCourse = () => {
  console.log('📅 预约课程')
  router.push('/member/coach-booking')
}

// 购买卡券
const handleBuyCard = () => {
  console.log('🎫 购买卡券')
  ElMessage.info('购买卡券功能开发中...')
}

// 扫码入场
const handleScanEntry = () => {
  console.log('📱 扫码入场')
  ElMessage.info('扫码入场功能开发中...')
}

// 联系客服
const handleContactService = () => {
  console.log('🎧 联系客服')
  ElMessage.info('联系客服功能开发中...')
}
</script>

<style scoped>
.member-home {
  padding: 0;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.welcome-text h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}
</style>