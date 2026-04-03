<template>
  <div class="dashboard">
    <!-- 欢迎标语 -->
    <div class="welcome-section">
      <h2>👋 欢迎回来，{{ userName }}！</h2>
      <p class="subtitle">今天是 {{ currentDate }}，祝您工作愉快！</p>
    </div>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <el-icon :size="36"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">总会员数</div>
            <div class="stat-value">1,234</div>
            <div class="stat-trend">
              <span class="trend-up">↑ 12%</span>
              <span class="trend-text">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <el-icon :size="36"><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日入场</div>
            <div class="stat-value">567</div>
            <div class="stat-trend">
              <span class="trend-up">↑ 8%</span>
              <span class="trend-text">较昨日</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <el-icon :size="36"><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日课程</div>
            <div class="stat-value">89</div>
            <div class="stat-trend">
              <span class="trend-text">共 12 位教练</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            <el-icon :size="36"><Bell /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">待处理事项</div>
            <div class="stat-value">12</div>
            <div class="stat-trend">
              <span class="trend-down">↓ 3%</span>
              <span class="trend-text">较上周</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和待办事项 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 左侧：收入趋势图 -->
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h4>📊 本周收入趋势</h4>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="bar-chart">
                <div class="bar" style="height: 60%;"><span>周一<br/>¥8,234</span></div>
                <div class="bar" style="height: 80%;"><span>周二<br/>¥12,456</span></div>
                <div class="bar" style="height: 70%;"><span>周三<br/>¥10,123</span></div>
                <div class="bar" style="height: 90%;"><span>周四<br/>¥15,678</span></div>
                <div class="bar" style="height: 75%;"><span>周五<br/>¥11,234</span></div>
                <div class="bar" style="height: 50%;"><span>周六<br/>¥6,789</span></div>
                <div class="bar" style="height: 40%;"><span>周日<br/>¥5,432</span></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：待办事项 -->
      <el-col :span="8">
        <el-card shadow="hover" class="todo-card">
          <template #header>
            <div class="card-header">
              <h4>📝 待办事项</h4>
              <el-button type="primary" size="small" icon="Plus">新增</el-button>
            </div>
          </template>
          <el-timeline class="todo-timeline">
            <el-timeline-item timestamp="09:00" placement="top" type="danger">
              <div class="todo-item">
                <div class="todo-content">
                  <div class="todo-title">会员合同到期提醒</div>
                  <div class="todo-desc">张三等 5 位会员合同即将到期</div>
                </div>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="10:30" placement="top" type="warning">
              <div class="todo-item">
                <div class="todo-content">
                  <div class="todo-title">器械维护检查</div>
                  <div class="todo-desc">跑步机 #003 需要定期维护</div>
                </div>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="14:00" placement="top" type="primary">
              <div class="todo-item">
                <div class="todo-content">
                  <div class="todo-title">新员工培训</div>
                  <div class="todo-desc">前台接待员入职培训</div>
                </div>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="16:00" placement="top" type="success">
              <div class="todo-item">
                <div class="todo-content">
                  <div class="todo-title">会员回访</div>
                  <div class="todo-desc">回访 3 位新办卡会员</div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和最近动态 -->
    <el-row :gutter="20">
      <!-- 快捷操作 -->
      <el-col :span="12">
        <el-card shadow="hover" class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <h4>⚡ 快捷操作</h4>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="action-btn">
                <el-button type="primary" circle class="action-icon">
                  <el-icon><User /></el-icon>
                </el-button>
                <div class="action-text">新增会员</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="action-btn">
                <el-button type="success" circle class="action-icon">
                  <el-icon><Calendar /></el-icon>
                </el-button>
                <div class="action-text">新增课程</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="action-btn">
                <el-button type="warning" circle class="action-icon">
                  <el-icon><Bell /></el-icon>
                </el-button>
                <div class="action-text">发布公告</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="action-btn">
                <el-button type="info" circle class="action-icon">
                  <el-icon><DataAnalysis /></el-icon>
                </el-button>
                <div class="action-text">查看报表</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 最近动态 -->
      <el-col :span="12">
        <el-card shadow="hover" class="activity-card">
          <template #header>
            <div class="card-header">
              <h4>🔔 最近动态</h4>
              <el-button type="link" size="small">查看全部</el-button>
            </div>
          </template>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon" style="background: #67C23A;">
                <el-icon><User /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">新会员注册</div>
                <div class="activity-desc">张三 办理了年卡会员卡</div>
                <div class="activity-time">10 分钟前</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon" style="background: #409EFF;">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">课程预约</div>
                <div class="activity-desc">李四 预约了瑜伽课程</div>
                <div class="activity-time">25 分钟前</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon" style="background: #E6A23C;">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">器械维护</div>
                <div class="activity-desc">跑步机 #003 完成维护</div>
                <div class="activity-time">1 小时前</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon" style="background: #F56C6C;">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">系统通知</div>
                <div class="activity-desc">系统将于今晚 22:00 进行维护</div>
                <div class="activity-time">2 小时前</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { 
  User, UserFilled, Calendar, Bell, DataAnalysis, 
  Setting, Plus 
} from '@element-plus/icons-vue'

// 🔴 调试日志：组件开始加载
console.log('🔴 [DashboardView] 组件开始加载')

const userStore = useUserStore()
const userName = computed(() => {
  const name = userStore.name || '管理员'
  console.log('🔵 [DashboardView] userName:', name)
  return name
})

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]
  const dateStr = `${year}年${month}月${day}日 ${weekDay}`
  console.log(' [DashboardView] currentDate:', dateStr)
  return dateStr
})

const chartPeriod = ref('week')

// 🔴 组件挂载时的日志
onMounted(() => {
  console.log('✅ [DashboardView] 组件已挂载到页面')
  console.log('✅ [DashboardView] userName:', userName.value)
  console.log('✅ [DashboardView] currentDate:', currentDate.value)
  console.log('✅ [DashboardView] chartPeriod:', chartPeriod.value)
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-section h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome-section .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border: none;
}

.stat-icon {
  width: 90px;
  height: 90px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-trend {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.trend-up {
  color: #67C23A;
  font-weight: 600;
}

.trend-down {
  color: #F56C6C;
  font-weight: 600;
}

.trend-text {
  color: #909399;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card,
.todo-card,
.quick-actions-card,
.activity-card {
  border: none;
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
  font-weight: 600;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  padding: 20px;
  gap: 12px;
}

.bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  min-height: 40px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.bar:hover {
  transform: scaleY(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.bar span {
  color: white;
  font-size: 12px;
  text-align: center;
  line-height: 1.4;
  white-space: nowrap;
}

.todo-timeline {
  padding: 10px 0;
}

.todo-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.todo-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-title {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.todo-desc {
  font-size: 12px;
  color: #909399;
}

.quick-actions-card {
  height: 100%;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  gap: 12px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.action-btn:hover {
  background: #f5f7fa;
}

.action-icon {
  width: 60px;
  height: 60px;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-text {
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f5f7fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-title {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.activity-desc {
  font-size: 12px;
  color: #909399;
}

.activity-time {
  font-size: 11px;
  color: #C0C4CC;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stat-value {
    font-size: 28px;
  }
  
  .stat-icon {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 16px;
  }
  
  .bar-chart {
    height: 180px;
  }
  
  .bar span {
    font-size: 10px;
  }
}
</style>