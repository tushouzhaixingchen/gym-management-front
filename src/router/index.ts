import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  // 管理端路由
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: '管理员管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/home',
    name: 'AdminHome',
    component: () => import('@/views/AdminHomeView.vue'),
    meta: { title: '管理后台首页', requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      }
    ]
  },
  {
    path: '/admin/list',
    name: 'AdminList',
    component: () => import('@/views/AdminListView.vue'),
    meta: { title: '管理员列表', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/members',
    name: 'MemberManage',
    component: () => import('@/views/MemberManageView.vue'),
    meta: { title: '会员管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/employees',
    name: 'EmployeeManage',
    component: () => import('@/views/EmployeeManageView.vue'),
    meta: { title: '员工管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/equipments',
    name: 'EquipmentManage',
    component: () => import('@/views/EquipmentManageView.vue'),
    meta: { title: '器械管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/courses',
    name: 'CourseManage',
    component: () => import('@/views/CourseManageView.vue'),
    meta: { title: '课程管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/bookings',
    name: 'BookingManage',
    component: () => import('@/views/BookingManageView.vue'),
    meta: { title: '教练预约管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/analytics',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { title: '数据分析', requiresAuth: true, roles: ['ADMIN'] }
  },
  // 注意：Dashboard 已经作为 /admin/home 的子路由，不再单独定义
  {
    path: '/admin/notifications',
    name: 'NotificationManage',
    component: () => import('@/views/NotificationManageView.vue'),
    meta: { title: '公告管理', requiresAuth: true, roles: ['ADMIN'] }
  },
  // 会员端路由
  {
    path: '/member',
    name: 'Member',
    component: () => import('@/views/MemberView.vue'),
    meta: { title: '会员中心', requiresAuth: true, roles: ['MEMBER'] }
  },
  {
    path: '/member/home',
    name: 'MemberHome',
    component: () => import('@/views/MemberHomeView.vue'),
    meta: { title: '会员首页', requiresAuth: true, roles: ['MEMBER'] }
  },
  {
    path: '/member/coach-booking',
    name: 'MemberCoachBooking',
    component: () => import('@/views/MemberCoachBookingView.vue'),
    meta: { title: '预约教练', requiresAuth: true, roles: ['MEMBER'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '健身房管理系统';
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    let role = localStorage.getItem('role');
    
    console.log('🔍 路由守卫调试信息:');
    console.log('  - 当前路由:', to.path);
    console.log('  - token:', token ? '✅ 存在' : '❌ 不存在');
    console.log('  - role 原始值:', role);
    
    if (!token) {
      console.log('  - ❌ 未登录，跳转到登录页');
      next('/login');
      return;
    }
    
    // 确保 role 转为大写
    if (role) {
      role = role.toUpperCase();
      console.log('  - role 转换后:', role);
    } else {
      console.log('  - ⚠️ role 为空，使用默认值 MEMBER');
      role = 'MEMBER';
    }
    
    // 检查角色权限
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const allowedRoles = to.meta.roles as string[];
      
      console.log('  - 允许的角色:', allowedRoles);
      console.log('  - 当前用户角色:', role);
      
      if (!allowedRoles.includes(role)) {
        console.log('  - ⚠️ 角色不匹配，重定向');
        // 角色不匹配，根据用户类型跳转
        if (role === 'ADMIN') {
          next('/admin/home');
        } else if (role === 'MEMBER') {
          next('/member/home');
        } else {
          next('/login');
        }
        return;
      }
    }
  }
  
  console.log('  - ✅ 允许通过');
  next();
});

export default router;