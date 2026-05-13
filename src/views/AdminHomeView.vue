<template>
  <div class="admin-home">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>健身房管理系统</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
      >
        <el-menu-item index="dashboard">
          <el-icon><Monitor /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-menu-item index="admins">
          <el-icon><User /></el-icon>
          <span>管理员信息管理</span>
        </el-menu-item>
        
        <el-menu-item index="members">
          <el-icon><UserFilled /></el-icon>
          <span>会员管理</span>
        </el-menu-item>
        
        <el-menu-item index="employees">
          <el-icon><User /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        
        <el-menu-item index="equipment">
          <el-icon><Setting /></el-icon>
          <span>器械管理</span>
        </el-menu-item>
        
        <el-menu-item index="courses">
          <el-icon><Calendar /></el-icon>
          <span>课程管理</span>
        </el-menu-item>
        
        <el-menu-item index="bookings">
          <el-icon><Clock /></el-icon>
          <span>教练预约管理</span>
        </el-menu-item>
        
        <el-menu-item index="notifications">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        
        <el-menu-item index="analytics">
          <el-icon><DataAnalysis /></el-icon>
          <span>分析与报告</span>
        </el-menu-item>
      </el-menu>
      
      <div class="user-info">
        <el-avatar :size="40">{{ userName.charAt(0) }}</el-avatar>
        <div class="user-detail">
          <p class="name">{{ userName }}</p>
          <p class="role">管理员</p>
        </div>
        <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
      </div>
    </div>
    
    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="header">
        <h3>{{ pageTitle }}</h3>
        <div class="header-right">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content">
        <!-- 直接嵌入 Dashboard 组件 -->
        <DashboardView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { 
  Monitor, User, UserFilled, Setting, Calendar, 
  Clock, Bell, DataAnalysis, Refresh 
} from '@element-plus/icons-vue'
import DashboardView from './DashboardView.vue'

console.log('🟢 [AdminHomeView] 组件开始加载')

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

console.log('🟢 [AdminHomeView] 当前路由:', route.path)
console.log('🟢 [AdminHomeView] 路由参数:', route.params)
console.log('🟢 [AdminHomeView] 子路由:', route.children)

const activeMenu = computed(() => {
  const routeMap: Record<string, string> = {
    '/admin/home': 'dashboard',
    '/admin': 'admins',  // 管理员管理
    '/admin/members': 'members',  // 会员管理
    '/admin/employees': 'employees',  // 员工管理
    '/admin/equipments': 'equipment',  // 器械管理
    '/admin/courses': 'courses',  // 课程管理
    '/admin/bookings': 'bookings',  // 教练预约管理
    '/admin/notifications': 'notifications',  // 公告管理
    '/admin/analytics': 'analytics'  // 分析与报告
  }
  return routeMap[route.path] || 'dashboard'
})

const userName = computed(() => userStore.name || '管理员')

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: '控制台',
    admins: '管理员信息管理',
    members: '会员管理',
    employees: '员工管理',
    equipment: '器械管理',
    courses: '课程管理',
    bookings: '教练预约管理',
    notifications: '公告管理',
    analytics: '分析与报告'
  }
  return titles[activeMenu.value] || '控制台'
})

const handleMenuSelect = (index: string) => {
  const routeMap: Record<string, string> = {
    dashboard: '/admin/home',
    admins: '/admin',  // 修改为实际路由路径
    members: '/admin/members',  // 修改为实际路由路径
    employees: '/admin/employees',  // 修改为实际路由路径
    equipment: '/admin/equipments',  // 修改为实际路由路径
    courses: '/admin/courses',  // 修改为实际路由路径
    bookings: '/admin/bookings',  // 修改为实际路由路径
    notifications: '/admin/notifications',  // 修改为实际路由路径
    analytics: '/admin/analytics'
  }
  router.push(routeMap[index])
}

const handleRefresh = () => {
  location.reload()
}

const handleLogout = async () => {
  try {
    userStore.logout('ADMIN')
    router.push('/login')
  } catch (error) {
    console.error('退出失败:', error)
  }
}
</script>

<style scoped>
.admin-home {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.logo h2 {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  position: relative;
  z-index: 1;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateX(4px);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.3) 0%, rgba(64, 158, 255, 0.2) 100%) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.user-info {
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.user-info :deep(.el-avatar) {
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.user-detail {
  flex: 1;
}

.user-detail .name {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.user-detail .role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin: 0;
}

.user-info :deep(.el-button) {
  background: rgba(245, 108, 108, 0.2);
  border: 1px solid rgba(245, 108, 108, 0.5);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info :deep(.el-button:hover) {
  background: rgba(245, 108, 108, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
}

.header {
  height: 70px;
  background: white;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.header h3 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.header-right :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-right :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
}

.placeholder {
  padding: 60px 40px;
  text-align: center;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.placeholder h3 {
  color: #2d3748;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

.placeholder p {
  color: #718096;
  font-size: 16px;
}

/* 滚动条美化 */
.sidebar::-webkit-scrollbar,
.content::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track,
.content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .logo h2 {
    font-size: 16px;
  }
  
  .content {
    padding: 20px;
  }
}
</style>
