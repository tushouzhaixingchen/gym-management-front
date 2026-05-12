<template>
  <div class="course-bookings-view">
    <el-card shadow="never" class="header-card">
      <div class="card-header">
        <div class="header-left">
          <el-button @click="handleBack" icon="ArrowLeft">返回</el-button>
          <h2>我的课程</h2>
        </div>
      </div>
    </el-card>

    <!-- 课程分类标签页 -->
    <el-card class="content-card" shadow="never" style="margin-top: 16px;">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 已报名 -->
        <el-tab-pane label="已报名" name="enrolled">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="enrolledCourses.length === 0" class="empty-container">
            <el-empty description="暂无已报名的课程">
              <el-button type="primary" @click="handleEnrollCourse">去报名</el-button>
            </el-empty>
          </div>
          <div v-else class="course-list">
            <el-card 
              v-for="course in enrolledCourses" 
              :key="course.id" 
              class="course-item"
              shadow="hover"
            >
              <div class="course-header">
                <h3 class="course-name">{{ course.courseName }}</h3>
                <el-tag :type="getStatusType(course.status)" size="large">
                  {{ getStatusText(course.status) }}
                </el-tag>
              </div>
              <div class="course-info">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <p><el-icon><Calendar /></el-icon> <strong>课程类型：</strong>{{ course.courseType }}</p>
                    <p><el-icon><Clock /></el-icon> <strong>上课时间：</strong>{{ formatDateTime(course.startTime) }}</p>
                    <p><el-icon><Location /></el-icon> <strong>门店：</strong>{{ course.storeName }}</p>
                  </el-col>
                  <el-col :span="12">
                    <p><el-icon><Timer /></el-icon> <strong>结束时间：</strong>{{ formatDateTime(course.endTime) }}</p>
                    <p><el-icon><MapLocation /></el-icon> <strong>教室：</strong>{{ course.room || '—' }}</p>
                    <p><el-icon><Document /></el-icon> <strong>订单号：</strong>{{ course.bookingNo }}</p>
                  </el-col>
                </el-row>
              </div>
              <div class="course-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleViewDetail(course)"
                  icon="View"
                >
                  查看详情
                </el-button>
                <el-button 
                  v-if="course.status === 0 || course.status === 1" 
                  type="danger" 
                  size="small" 
                  @click="handleCancelBooking(course)"
                  icon="Close"
                >
                  取消报名
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 已结束 -->
        <el-tab-pane label="已结束" name="ended">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="endedCourses.length === 0" class="empty-container">
            <el-empty description="暂无已结束时课程" />
          </div>
          <div v-else class="course-list">
            <el-card 
              v-for="course in endedCourses" 
              :key="course.id" 
              class="course-item"
              shadow="hover"
            >
              <div class="course-header">
                <h3 class="course-name">{{ course.courseName }}</h3>
                <el-tag :type="getStatusType(course.status)" size="large">
                  {{ getStatusText(course.status) }}
                </el-tag>
              </div>
              <div class="course-info">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <p><el-icon><Calendar /></el-icon> <strong>课程类型：</strong>{{ course.courseType }}</p>
                    <p><el-icon><Clock /></el-icon> <strong>上课时间：</strong>{{ formatDateTime(course.startTime) }}</p>
                    <p><el-icon><Location /></el-icon> <strong>门店：</strong>{{ course.storeName }}</p>
                  </el-col>
                  <el-col :span="12">
                    <p><el-icon><Timer /></el-icon> <strong>结束时间：</strong>{{ formatDateTime(course.endTime) }}</p>
                    <p><el-icon><MapLocation /></el-icon> <strong>教室：</strong>{{ course.room || '—' }}</p>
                    <p><el-icon><Document /></el-icon> <strong>订单号：</strong>{{ course.bookingNo }}</p>
                  </el-col>
                </el-row>
              </div>
              <div class="course-actions">
                <el-button 
                  type="info" 
                  size="small" 
                  @click="handleViewDetail(course)"
                  icon="View"
                >
                  查看详情
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Location, 
  Timer, 
  MapLocation, 
  Document, 
  View, 
  Close 
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

// 当前激活的标签页
const activeTab = ref('enrolled')

// 课程数据
const allCourses = ref<any[]>([])
const enrolledCourses = ref<any[]>([])
const endedCourses = ref<any[]>([])
const loading = ref(false)

// 返回上一页
const handleBack = () => {
  router.back()
}

// 跳转到报名课程页
const handleEnrollCourse = () => {
  router.push('/member/courses')
}

// 标签页切换
const handleTabChange = (tab: string) => {
  console.log('📑 切换标签页:', tab)
}

// 获取我的课程
const loadMyCourses = async () => {
  loading.value = true
  try {
    console.log('🔍 开始加载我的课程...')
    const res = await request({
      url: '/member/courses/bookings',
      method: 'get'
    })

    console.log('📦 接口返回数据:', res)

    let courseList = []
    if (Array.isArray(res)) {
      courseList = res
    } else if (res && typeof res === 'object') {
      const resData = res as any
      if (resData.code === 200) {
        const data = resData.data
        if (Array.isArray(data)) {
          courseList = data
        }
      }
    }

    console.log('✅ 解析后的课程数据:', courseList)
    console.log('📊 课程数量:', courseList.length)
    
    // 打印第一条数据的完整结构
    if (courseList.length > 0) {
      console.log('📋 第一条课程数据:', JSON.stringify(courseList[0], null, 2))
      console.log('🔑 所有字段名:', Object.keys(courseList[0]))
      console.log('🔍 第一条数据的 status 字段值:', courseList[0].status)
    }

    allCourses.value = courseList
    
    // 根据 status 字段分类
    // status: 0-已报名(待确认/已确认), 1-已结束
    enrolledCourses.value = courseList.filter(course => {
      return course.status === 0
    })
    
    endedCourses.value = courseList.filter(course => {
      return course.status === 1
    })

    console.log('📚 已报名课程数量 (status=0):', enrolledCourses.value.length)
    console.log('✅ 已结束课程数量 (status=1):', endedCourses.value.length)

  } catch (error: any) {
    console.error('❌ 加载我的课程失败:', error)
    ElMessage.error(error.message || '加载课程失败')
  } finally {
    loading.value = false
  }
}

// 查看课程详情
const handleViewDetail = (course: any) => {
  console.log('👀 查看课程详情:', course)
  ElMessage.info(`查看课程：${course.courseName}`)
  // 可以跳转到详情页或打开对话框
}

// 取消报名
const handleCancelBooking = async (course: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消报名课程"${course.courseName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    console.log('🗑️ 取消报名:', course)
    
    await request({
      url: `/member/courses/bookings/${course.id}`,
      method: 'delete'
    })

    ElMessage.success('取消报名成功')
    
    // 重新加载数据
    loadMyCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('❌ 取消报名失败:', error)
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 获取状态类型
const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',   // 待确认
    1: 'success',   // 已确认
    2: 'info',      // 已完成
    3: 'danger',    // 已取消
    4: 'danger'     // 已爽约
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待确认',
    1: '已确认',
    2: '已完成',
    3: '已取消',
    4: '已爽约'
  }
  return texts[status] || '未知'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '—'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadMyCourses()
})
</script>

<style scoped>
.course-bookings-view {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 70px);
}

.header-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.content-card {
  border-radius: 8px;
}

.loading-container {
  padding: 20px;
}

.empty-container {
  padding: 40px 0;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  border-radius: 8px;
  transition: transform 0.3s;
}

.course-item:hover {
  transform: translateY(-2px);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.course-name {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.course-info {
  margin-bottom: 16px;
}

.course-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-info p strong {
  color: #303133;
}

.course-info .el-icon {
  color: #909399;
}

.course-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
</style>
