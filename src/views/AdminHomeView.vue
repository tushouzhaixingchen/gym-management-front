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
    userStore.logout()
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
}

.sidebar {
  width: 240px;
  background-color: #304156;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
  border-bottom: 1px solid #3d4a5a;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: #304156;
}

.user-info {
  padding: 20px;
  background-color: #2b3a4b;
  border-top: 1px solid #3d4a5a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  flex: 1;
}

.user-detail .name {
  color: #fff;
  font-size: 14px;
  margin: 0 0 4px 0;
}

.user-detail .role {
  color: #bfcbd9;
  font-size: 12px;
  margin: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f0f2f5;
}

.header {
  height: 60px;
  background-color: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.placeholder {
  padding: 40px;
  text-align: center;
}

.placeholder h3 {
  color: #303133;
  margin-bottom: 16px;
}

.placeholder p {
  color: #909399;
}
</style>
