<template>
  <div class="member-center">
    <!-- 顶部欢迎卡片 -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <div class="avatar-section">
          <el-avatar :size="80" :src="memberInfo.avatar || defaultAvatar">
            <el-icon :size="40"><User /></el-icon>
          </el-avatar>
        </div>
        <div class="info-section">
          <h2>{{ memberInfo.name }}</h2>
          <p class="phone">{{ memberInfo.phone }}</p>
          <div class="member-level">
            <el-tag :type="getLevelType(memberInfo.level)" size="large">
              {{ getLevelText(memberInfo.level) }}
            </el-tag>
            <span class="validity" v-if="memberInfo.expiryDate">
              有效期至：{{ memberInfo.expiryDate }}
            </span>
          </div>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="showEditDialog = true" icon="Edit">
            编辑资料
          </el-button>
          <el-button @click="showPasswordDialog = true" icon="Lock">
            修改密码
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="6">
        <el-card shadow="hover" class="action-card" @click="handleScanCode">
          <el-icon :size="40" color="#409EFF"><Monitor /></el-icon>
          <h3>扫码入场</h3>
          <p>快速入场健身</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="action-card" @click="handleBookCourse">
          <el-icon :size="40" color="#67C23A"><Calendar /></el-icon>
          <h3>课程预约</h3>
          <p>预约健身课程</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="action-card" @click="handleBuyCard">
          <el-icon :size="40" color="#E6A23C"><Ticket /></el-icon>
          <h3>购买卡券</h3>
          <p>办理会员卡</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="action-card" @click="handleContactService">
          <el-icon :size="40" color="#909399"><Service /></el-icon>
          <h3>联系客服</h3>
          <p>在线咨询</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 我的卡券 -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>我的卡券</h3>
          <el-button type="primary" link @click="handleViewAllCards">
            查看全部
          </el-button>
        </div>
      </template>
      <el-tabs v-model="activeCardTab">
        <el-tab-pane label="会员卡" name="membership">
          <div v-if="membershipCards.length > 0" class="card-list">
            <el-card 
              v-for="card in membershipCards" 
              :key="card.id" 
              class="membership-card"
              shadow="hover"
            >
              <div class="card-info">
                <h4>{{ card.cardName }}</h4>
                <p class="card-number">卡号：{{ card.cardNumber }}</p>
                <p class="card-validity">
                  有效期：{{ card.startDate }} - {{ card.endDate }}
                </p>
                <p class="card-remaining">
                  剩余次数：{{ card.remainingTimes }} / {{ card.totalTimes }}
                </p>
                <el-tag :type="card.status === 1 ? 'success' : 'info'">
                  {{ card.status === 1 ? '使用中' : '已过期' }}
                </el-tag>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无会员卡" />
        </el-tab-pane>
        <el-tab-pane label="优惠券" name="coupon">
          <div v-if="coupons.length > 0" class="coupon-list">
            <el-card 
              v-for="coupon in coupons" 
              :key="coupon.id" 
              class="coupon-card"
              shadow="hover"
            >
              <div class="coupon-info">
                <div class="coupon-amount">¥{{ coupon.amount }}</div>
                <div class="coupon-detail">
                  <h4>{{ coupon.name }}</h4>
                  <p>{{ coupon.description }}</p>
                  <p class="coupon-validity">
                    有效期至：{{ coupon.endDate }}
                  </p>
                  <el-tag :type="coupon.status === 1 ? 'success' : 'info'" size="small">
                    {{ coupon.status === 1 ? '可使用' : '已使用' }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无优惠券" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 我的课程 -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>我的课程</h3>
          <el-button type="primary" link @click="handleViewAllCourses">
            查看全部
          </el-button>
        </div>
      </template>
      <el-tabs v-model="activeCourseTab">
        <el-tab-pane label="今日课程" name="today">
          <div v-if="todayCourses.length > 0" class="course-list">
            <el-card 
              v-for="course in todayCourses" 
              :key="course.id" 
              class="course-card"
              shadow="hover"
            >
              <div class="course-info">
                <h4>{{ course.courseName }}</h4>
                <p><el-icon><Clock /></el-icon> {{ course.courseTime }}</p>
                <p><el-icon><MapLocation /></el-icon> {{ course.location }}</p>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleCancelBooking(course.id)"
                >
                  取消预约
                </el-button>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="今日无课程" />
        </el-tab-pane>
        <el-tab-pane label="已预约" name="booked">
          <div v-if="bookedCourses.length > 0" class="course-list">
            <el-card 
              v-for="course in bookedCourses" 
              :key="course.id" 
              class="course-card"
              shadow="hover"
            >
              <div class="course-info">
                <h4>{{ course.courseName }}</h4>
                <p><el-icon><Clock /></el-icon> {{ course.courseTime }}</p>
                <p><el-icon><MapLocation /></el-icon> {{ course.location }}</p>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleCancelBooking(course.id)"
                >
                  取消预约
                </el-button>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无已预约课程" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <div v-if="completedCourses.length > 0" class="course-list">
            <el-card 
              v-for="course in completedCourses" 
              :key="course.id" 
              class="course-card"
              shadow="hover"
            >
              <div class="course-info">
                <h4>{{ course.courseName }}</h4>
                <p><el-icon><Clock /></el-icon> {{ course.courseTime }}</p>
                <el-tag type="success">已完成</el-tag>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无已完成课程" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 我的预约 -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>我的预约</h3>
          <el-button type="primary" link @click="handleViewAllAppointments">
            查看全部
          </el-button>
        </div>
      </template>
      <el-tabs v-model="activeAppointmentTab">
        <el-tab-pane label="全部" name="all">
          <div v-if="appointments.length > 0" class="appointment-list">
            <el-card 
              v-for="item in appointments.slice(0, 3)" 
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
                  <p><strong>时间：</strong>{{ item.timeSlotStart }} ~ {{ item.timeSlotEnd }}</p>
                  <p><strong>门店：</strong>{{ item.storeName }}</p>
                  <p><strong>价格：</strong>¥{{ item.price }}</p>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无预约记录" />
        </el-tab-pane>
        <el-tab-pane label="待确认" name="pending">
          <div v-if="pendingAppointments.length > 0" class="appointment-list">
            <el-card 
              v-for="item in pendingAppointments.slice(0, 3)" 
              :key="item.id" 
              class="appointment-item"
              shadow="hover"
              @click="handleViewAppointmentDetail(item)"
            >
              <div class="appointment-info">
                <div class="appointment-header">
                  <span class="appointment-no">{{ item.appointmentNo }}</span>
                  <el-tag type="warning">待确认</el-tag>
                </div>
                <div class="appointment-detail">
                  <p><strong>教练：</strong>{{ item.coachName }}</p>
                  <p><strong>时间：</strong>{{ item.timeSlotStart }}</p>
                  <p><strong>门店：</strong>{{ item.storeName }}</p>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无待确认预约" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <div v-if="completedAppointments.length > 0" class="appointment-list">
            <el-card 
              v-for="item in completedAppointments.slice(0, 3)" 
              :key="item.id" 
              class="appointment-item"
              shadow="hover"
              @click="handleViewAppointmentDetail(item)"
            >
              <div class="appointment-info">
                <div class="appointment-header">
                  <span class="appointment-no">{{ item.appointmentNo }}</span>
                  <el-tag type="success">已完成</el-tag>
                </div>
                <div class="appointment-detail">
                  <p><strong>教练：</strong>{{ item.coachName }}</p>
                  <p><strong>时间：</strong>{{ item.timeSlotStart }}</p>
                  <p><strong>评分：</strong>
                    <el-rate v-model="item.feedbackScore" disabled size="small" />
                  </p>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无已完成预约" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 入场记录 -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>入场记录</h3>
          <el-button type="primary" link @click="handleViewAllRecords">
            查看全部
          </el-button>
        </div>
      </template>
      <el-table :data="recentAccessRecords" stripe style="width: 100%">
        <el-table-column prop="accessTime" label="入场时间" width="180" />
        <el-table-column prop="leaveTime" label="离场时间" width="180" />
        <el-table-column prop="storeName" label="门店" width="150" />
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ calculateDuration(row.accessTime, row.leaveTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑个人资料" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确定</el-button>
      </template>
    </el-dialog>

    <!-- 预约详情对话框 -->
    <el-dialog
      v-model="appointmentDetailVisible"
      title="预约详情"
      width="600px"
    >
      <el-descriptions :column="1" border v-if="currentAppointment">
        <el-descriptions-item label="预约单号">
          {{ currentAppointment.appointmentNo }}
        </el-descriptions-item>
        <el-descriptions-item label="预约状态">
          <el-tag :type="getAppointmentStatusType(currentAppointment.status)">
            {{ getAppointmentStatusText(currentAppointment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="教练">
          {{ currentAppointment.coachName }}
        </el-descriptions-item>
        <el-descriptions-item label="门店">
          {{ currentAppointment.storeName }}
        </el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ currentAppointment.timeSlotStart }} ~ {{ currentAppointment.timeSlotEnd }}
        </el-descriptions-item>
        <el-descriptions-item label="时长">
          {{ currentAppointment.durationMinutes }}分钟
        </el-descriptions-item>
        <el-descriptions-item label="价格">
          ¥{{ currentAppointment.price }}
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="currentAppointment.payStatus === 1 ? 'success' : 'warning'">
            {{ currentAppointment.payStatus === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约目的" v-if="currentAppointment.purpose">
          {{ currentAppointment.purpose }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" v-if="currentAppointment.remark">
          {{ currentAppointment.remark }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentAppointment.createdAt }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer v-if="currentAppointment">
        <el-button @click="appointmentDetailVisible = false">关闭</el-button>
        <el-button 
          v-if="currentAppointment.status === 0 || currentAppointment.status === 1" 
          type="danger" 
          @click="handleCancelAppointment(currentAppointment)"
        >
          取消预约
        </el-button>
        <el-button 
          v-if="currentAppointment.status === 2 && !currentAppointment.feedbackScore" 
          type="primary" 
          @click="handleFeedback(currentAppointment)"
        >
          评价
        </el-button>
      </template>
    </el-dialog>

    <!-- 评价对话框 -->
    <el-dialog
      v-model="feedbackVisible"
      title="课程评价"
      width="500px"
    >
      <el-form :model="feedbackForm" label-width="100px">
        <el-form-item label="评分">
          <el-rate v-model="feedbackForm.score" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请写下您的上课感受..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, Calendar, Ticket, Service, 
  Clock, Edit, Lock, Monitor, MapLocation 
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import request from '@/utils/request'
import { Star } from '@element-plus/icons-vue'

const userStore = useUserStore()
const defaultAvatar = ''

// 会员信息
const memberInfo = reactive({
  id: userStore.userId,
  name: userStore.name,
  phone: '',
  email: '',
  avatar: '',
  level: 1,
  expiryDate: ''
})

// 卡券数据
const membershipCards = ref<any[]>([])
const coupons = ref<any[]>([])
const activeCardTab = ref('membership')

// 课程数据
const todayCourses = ref<any[]>([])
const bookedCourses = ref<any[]>([])
const completedCourses = ref<any[]>([])
const activeCourseTab = ref('today')

// 入场记录
const recentAccessRecords = ref<any[]>([])

// 预约相关
const activeAppointmentTab = ref('all')
const appointments = ref<any[]>([])
const pendingAppointments = ref<any[]>([])
const completedAppointments = ref<any[]>([])

// 对话框
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const appointmentDetailVisible = ref(false)
const feedbackVisible = ref(false)
const currentAppointment = ref<any>(null)
const editForm = reactive({
  name: '',
  phone: '',
  email: ''
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 评价表单
const feedbackForm = reactive({
  appointmentId: null as number | null,
  score: 0,
  content: ''
})

// 获取会员信息
const getMemberInfo = async () => {
  if (!userStore.userId) {
    console.error('userId 不存在，无法获取会员信息');
    return;
  }
  
  try {
    const res = await request({
      url: `/members/${userStore.userId}`,
      method: 'get'
    })
    
    if ((res as any).code === 200 && (res as any).data) {
      const data = (res as any).data
      memberInfo.name = data.name
      memberInfo.phone = data.phone
      memberInfo.email = data.email
      memberInfo.avatar = data.avatar
      memberInfo.level = data.level
      memberInfo.expiryDate = data.expiryDate
    }
  } catch (error) {
    console.error('获取会员信息失败:', error)
  }
}

// 获取我的卡券
const getMyCards = async () => {
  if (!userStore.userId) {
    console.error('userId 不存在，无法获取卡券');
    return;
  }
  
  try {
    const res = await request({
      url: `/members/${userStore.userId}/cards`,
      method: 'get'
    })
    
    if ((res as any).code === 200 && (res as any).data) {
      const data = (res as any).data
      membershipCards.value = data.membershipCards || []
      coupons.value = data.coupons || []
    }
  } catch (error) {
    console.error('获取卡券失败:', error)
  }
}

// 获取我的课程
const getMyCourses = async () => {
  if (!userStore.userId) {
    console.error('userId 不存在，无法获取课程');
    return;
  }
  
  try {
    const res = await request({
      url: `/members/${userStore.userId}/courses`,
      method: 'get'
    })
    
    if ((res as any).code === 200 && (res as any).data) {
      const data = (res as any).data
      todayCourses.value = data.today || []
      bookedCourses.value = data.booked || []
      completedCourses.value = data.completed || []
    }
  } catch (error) {
    console.error('获取课程失败:', error)
  }
}

// 获取入场记录
const getAccessRecords = async () => {
  if (!userStore.userId) {
    console.error('userId 不存在，无法获取入场记录');
    return;
  }
  
  try {
    const res = await request({
      url: `/members/${userStore.userId}/access-records`,
      method: 'get',
      params: { page: 1, pageSize: 10 }
    })
    
    if ((res as any).code === 200 && (res as any).data) {
      recentAccessRecords.value = (res as any).data.list || []
    }
  } catch (error) {
    console.error('获取入场记录失败:', error)
  }
}

// 加载我的预约
const loadAppointments = async () => {
  if (!userStore.userId) {
    console.error('userId 不存在，无法获取预约');
    return;
  }
  
  try {
    const res = await request({
      url: `/member/appointments/my`,
      method: 'get',
      params: { page: 1, size: 10 }
    })
    
    if ((res as any).code === 200 && (res as any).data) {
      const data = (res as any).data
      let dataList = []
      if (Array.isArray(data.records)) {
        dataList = data.records
      } else if (Array.isArray(data.list)) {
        dataList = data.list
      } else if (Array.isArray(data)) {
        dataList = data
      }
      
      appointments.value = dataList
      pendingAppointments.value = dataList.filter((item: any) => item.status === 0 || item.status === 1)
      completedAppointments.value = dataList.filter((item: any) => item.status === 2)
    }
  } catch (error) {
    console.error('加载预约列表失败:', error)
  }
}

// 获取预约状态类型
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

// 获取预约状态文本
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

// 工具函数
const getLevelText = (level: number) => {
  const levels: any = { 1: '普通会员', 2: '银卡会员', 3: '金卡会员', 4: '钻石会员' }
  return levels[level] || '普通会员'
}

const getLevelType = (level: number) => {
  const types: any = { 1: 'info', 2: 'warning', 3: 'success', 4: 'danger' }
  return types[level] || 'info'
}

const calculateDuration = (start: string, end: string) => {
  if (!end) return '进行中'
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const hours = Math.floor((endTime - startTime) / (1000 * 60 * 60))
  const minutes = Math.floor((endTime - startTime) / (1000 * 60) % 60)
  return `${hours}小时${minutes}分钟`
}

// 快捷操作
const handleScanCode = () => {
  ElMessage.info('扫码功能开发中...')
}

const handleBookCourse = () => {
  ElMessage.info('课程预约功能开发中...')
}

const handleBuyCard = () => {
  ElMessage.info('购买卡券功能开发中...')
}

const handleContactService = () => {
  ElMessage.info('客服功能开发中...')
}

const handleViewAllCards = () => {
  ElMessage.info('卡券列表功能开发中...')
}

const handleViewAllCourses = () => {
  ElMessage.info('课程列表功能开发中...')
}

const handleCancelBooking = (courseId: number) => {
  ElMessageBox.confirm('确定要取消该课程预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request({
        url: `/course-bookings/${courseId}`,
        method: 'delete'
      })
      ElMessage.success('取消成功')
      getMyCourses()
    } catch (error) {
      ElMessage.error('取消失败')
    }
  }).catch(() => {})
}

const handleViewAllRecords = () => {
  ElMessage.info('入场记录列表功能开发中...')
}

// 查看全部预约
const handleViewAllAppointments = () => {
  ElMessage.info('正在加载全部预约记录...')
  loadAppointments()
}

// 查看预约详情
const handleViewAppointmentDetail = (item: any) => {
  currentAppointment.value = item
  appointmentDetailVisible.value = true
}

// 取消预约
const handleCancelAppointment = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request({
      url: `/member/appointments/${item.id}/cancel`,
      method: 'post',
      data: {
        cancelReason: '会员主动取消',
        cancelBy: 1
      }
    })

    ElMessage.success('取消成功')
    appointmentDetailVisible.value = false
    loadAppointments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 评价预约
const handleFeedback = (item: any) => {
  feedbackForm.appointmentId = item.id
  feedbackForm.score = 0
  feedbackForm.content = ''
  feedbackVisible.value = true
}

// 提交评价
const submitFeedback = async () => {
  if (!feedbackForm.appointmentId) return
  
  if (feedbackForm.score === 0) {
    ElMessage.warning('请选择评分')
    return
  }

  try {
    await request({
      url: `/appointments/${feedbackForm.appointmentId}/feedback`,
      method: 'post',
      data: {
        feedbackScore: feedbackForm.score,
        feedbackContent: feedbackForm.content
      }
    })

    ElMessage.success('评价成功')
    feedbackVisible.value = false
    loadAppointments()
  } catch (error: any) {
    ElMessage.error(error.message || '评价失败')
  }
}

// 更新资料
const handleUpdateProfile = async () => {
  try {
    await request({
      url: `/members/${userStore.userId}`,
      method: 'put',
      data: editForm
    })
    ElMessage.success('更新成功')
    showEditDialog.value = false
    getMemberInfo()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  try {
    await request({
      url: '/members/changePassword',
      method: 'post',
      data: {
        userId: userStore.userId,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }
    })
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error('密码修改失败')
  }
}

onMounted(() => {
  getMemberInfo()
  getMyCards()
  getMyCourses()
  getAccessRecords()
  loadAppointments()
})
</script>

<style scoped>
.member-center {
  padding: 1.5rem;
  background: #f5f7fa;
  min-height: calc(100vh - 70px);
}

.welcome-card {
  margin-bottom: 1.5rem;
  border-radius: 12px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-section {
  flex-shrink: 0;
}

.info-section {
  flex: 1;
}

.info-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #303133;
}

.info-section .phone {
  color: #909399;
  margin: 0 0 1rem 0;
}

.member-level {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.validity {
  color: #606266;
  font-size: 0.9rem;
}

.action-section {
  display: flex;
  gap: 1rem;
}

.quick-actions {
  margin-bottom: 1.5rem;
}

.action-card {
  text-align: center;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
  border-radius: 12px;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-card h3 {
  margin: 1rem 0 0.5rem;
  color: #303133;
}

.action-card p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.section-card {
  margin-bottom: 1.5rem;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.membership-card {
  border-radius: 8px;
}

.card-info h4 {
  margin: 0 0 0.5rem 0;
  color: #303133;
}

.card-info p {
  margin: 0.3rem 0;
  color: #606266;
  font-size: 14px;
}

.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.coupon-card {
  border-radius: 8px;
}

.coupon-info {
  display: flex;
  gap: 1rem;
}

.coupon-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #f56c6c;
  flex-shrink: 0;
}

.coupon-detail h4 {
  margin: 0 0 0.5rem 0;
  color: #303133;
}

.coupon-detail p {
  margin: 0.3rem 0;
  color: #909399;
  font-size: 14px;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.course-card {
  border-radius: 8px;
}

.course-info h4 {
  margin: 0 0 1rem 0;
  color: #303133;
}

.course-info p {
  margin: 0.5rem 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.el-tabs__header) {
  margin-bottom: 1rem;
}

/* 预约样式 */
.appointment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.appointment-item {
  cursor: pointer;
  transition: transform 0.3s;
}

.appointment-item:hover {
  transform: translateY(-3px);
}

.appointment-info {
  padding: 0.5rem 0;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.appointment-no {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.appointment-detail p {
  margin: 0.3rem 0;
  font-size: 13px;
  color: #909399;
}

.appointment-detail strong {
  color: #303133;
}
</style>