<template>
  <div class="course-enroll-view">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.courseName"
            placeholder="请输入课程名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="门店">
          <el-select v-model="searchForm.storeId" placeholder="全部门店" clearable style="width: 150px">
            <el-option label="迈格健身-朝阳店" :value="1" />
            <el-option label="迈格健身-海淀店" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="searchForm.courseType" placeholder="全部类型" clearable style="width: 120px">
            <el-option label="瑜伽" value="瑜伽" />
            <el-option label="动感单车" value="动感单车" />
            <el-option label="拳击" value="拳击" />
            <el-option label="舞蹈" value="舞蹈" />
            <el-option label="力量训练" value="力量训练" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级">
          <el-select v-model="searchForm.courseLevel" placeholder="全部等级" clearable style="width: 100px">
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
    <el-card class="table-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <h4>可报名课程</h4>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="courseName" label="课程名称" width="150" />
        <el-table-column prop="courseType" label="课程类型" width="120" />
        <el-table-column prop="courseLevel" label="难度等级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.courseLevel === 'beginner' ? 'success' : row.courseLevel === 'intermediate' ? 'warning' : 'danger'">
              {{ row.courseLevel === 'beginner' ? '初级' : row.courseLevel === 'intermediate' ? '中级' : '高级' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coachName" label="教练" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column label="人数" width="100">
          <template #default="{ row }">
            {{ row.bookedSeats || 0 }}/{{ row.maxSeats }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="room" label="教室" width="120" />
        <el-table-column prop="storeName" label="门店" width="150" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="!row.isEnrolled"
              type="primary" 
              size="small"
              @click="handleEnroll(row)"
              :disabled="row.bookedSeats >= row.maxSeats || row.status === 0 || row.status === 4"
            >
              报名
            </el-button>
            <el-button 
              v-else
              type="success" 
              size="small"
              disabled
            >
              已报名
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 20px;">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 确认报名对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认报名信息"
      width="600px"
      @close="handleConfirmDialogClose"
    >
      <div class="payment-info">
        <h4>课程信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称">{{ currentCourse?.courseName }}</el-descriptions-item>
          <el-descriptions-item label="课程类型">{{ currentCourse?.courseType }}</el-descriptions-item>
          <el-descriptions-item label="教练">{{ currentCourse?.coachName }}</el-descriptions-item>
          <el-descriptions-item label="难度等级">
            <el-tag :type="currentCourse?.courseLevel === 'beginner' ? 'success' : currentCourse?.courseLevel === 'intermediate' ? 'warning' : 'danger'" size="small">
              {{ currentCourse?.courseLevel === 'beginner' ? '初级' : currentCourse?.courseLevel === 'intermediate' ? '中级' : '高级' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentCourse?.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentCourse?.endTime }}</el-descriptions-item>
          <el-descriptions-item label="教室">{{ currentCourse?.room }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ currentCourse?.storeName }}</el-descriptions-item>
          <el-descriptions-item label="价格" :span="2">
            <span class="price-highlight">¥{{ currentCourse?.price }}</span>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="payment-tips">
          <el-alert
            title="报名提示"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>• 点击"去支付"后将选择支付方式</p>
              <p>• 支付成功后将为您预留课程名额</p>
              <p>• 如需取消报名，请提前24小时操作</p>
            </template>
          </el-alert>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGoToPayment">
            去支付 ¥{{ currentCourse?.price }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 支付方式选择对话框 -->
    <el-dialog
      v-model="paymentMethodDialogVisible"
      title="选择支付方式"
      width="500px"
      @close="handlePaymentMethodDialogClose"
    >
      <div class="payment-method-content">
        <h4 class="payment-method-title">请选择支付方式</h4>
        
        <div class="payment-methods">
          <!-- 微信支付 -->
          <div 
            class="payment-method-item" 
            :class="{ 'selected': selectedPayMethod === 1 }"
            @click="selectedPayMethod = 1"
          >
            <div class="method-icon wechat-icon">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path fill="#07C160" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.07 6.07 0 0 1-.243-1.656c0-3.78 3.698-6.85 8.26-6.85.283 0 .554.028.825.062C16.78 4.447 13.08 2.188 8.691 2.188zm-2.6 4.408c.637 0 1.153.516 1.153 1.153s-.516 1.153-1.153 1.153S4.938 8.386 4.938 7.75s.516-1.154 1.153-1.154zm5.194 0c.637 0 1.153.516 1.153 1.153s-.516 1.153-1.153 1.153-1.153-.516-1.153-1.153.516-1.154 1.153-1.154z"/>
                <path fill="#07C160" d="M24 14.117c0-3.38-3.276-6.124-7.32-6.124-4.042 0-7.32 2.745-7.32 6.124 0 3.381 3.278 6.125 7.32 6.125a8.63 8.63 0 0 0 2.45-.355.722.722 0 0 1 .597.082l1.59.931a.272.272 0 0 0 .14.046c.133 0 .241-.109.241-.243 0-.06-.023-.119-.039-.177l-.326-1.232a.49.49 0 0 1 .177-.554C22.93 18.004 24 16.194 24 14.117zm-9.727-1.196c-.53 0-.96-.43-.96-.96s.43-.96.96-.96.96.43.96.96-.43.96-.96.96zm4.854 0c-.53 0-.96-.43-.96-.96s.43-.96.96-.96.96.43.96.96-.43.96-.96.96z"/>
              </svg>
            </div>
            <div class="method-info">
              <div class="method-name">微信支付</div>
              <div class="method-desc">推荐使用微信支付</div>
            </div>
            <el-icon v-if="selectedPayMethod === 1" class="check-icon" :size="20" color="#409EFF">
              <Check />
            </el-icon>
          </div>

          <!-- 支付宝 -->
          <div 
            class="payment-method-item" 
            :class="{ 'selected': selectedPayMethod === 2 }"
            @click="selectedPayMethod = 2"
          >
            <div class="method-icon alipay-icon">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path fill="#1677FF" d="M21.422 15.358c-.309-.131-4.014-1.688-6.36-2.668.887-1.536 1.578-3.372 1.996-5.378H12.45V6.122h5.753V4.994h-5.753V1.728h-2.29s-.058.383-.193.96c-.13.544-.508 1.548-1.114 2.306h-3.62v1.128h6.273v1.19H7.88v.882c.228.753.562 1.472.964 2.148-1.212.522-4.88 2.112-5.266 2.29-.385.177-.677.388-.677.704 0 .316.313.595.677.595h1.894s2.59-1.155 4.238-1.92c.29.667.636 1.304 1.028 1.897-2.398 1.022-6.184 2.568-6.58 2.727-.397.159-.69.388-.69.704 0 .316.314.595.677.595h2.17s3.46-1.458 5.896-2.618a13.04 13.04 0 0 0 4.036 3.09c1.07.536 2.004.823 2.788.823.784 0 1.356-.238 1.714-.712.357-.474.536-1.07.536-1.786 0-.716-.179-1.312-.536-1.786a2.33 2.33 0 0 0-1.714-.712c-.536 0-1.107.136-1.714.408a12.13 12.13 0 0 1-3.478-2.502c2.89-1.248 5.683-2.49 6.084-2.668.4-.177.69-.388.69-.704 0-.316-.314-.595-.677-.595z"/>
              </svg>
            </div>
            <div class="method-info">
              <div class="method-name">支付宝</div>
              <div class="method-desc">安全便捷的支付方式</div>
            </div>
            <el-icon v-if="selectedPayMethod === 2" class="check-icon" :size="20" color="#409EFF">
              <Check />
            </el-icon>
          </div>
        </div>

        <div class="payment-notice">
          <el-alert
            title="支付说明"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>• 选择支付方式后将跳转到对应支付页面</p>
              <p>• 请在5分钟内完成支付</p>
              <p>• 支付成功后自动返回</p>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentMethodDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmPayment" :loading="paymentLoading">
            确认支付 ¥{{ currentCourse?.price }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Check } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 获取用户状态
const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
  courseName: '',
  storeId: null as number | null,
  courseType: '',
  courseLevel: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 已报名的课程ID集合
const enrolledCourseIds = ref<Set<number>>(new Set())

// 确认报名对话框
const confirmDialogVisible = ref(false)
// 支付方式选择对话框
const paymentMethodDialogVisible = ref(false)
const currentCourse = ref<any>(null)
const paymentLoading = ref(false)
// 选择的支付方式：1-微信 2-支付宝
const selectedPayMethod = ref<number>(1)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchForm.courseName) params.courseName = searchForm.courseName
    if (searchForm.storeId !== null) params.storeId = searchForm.storeId
    if (searchForm.courseType) params.courseType = searchForm.courseType
    if (searchForm.courseLevel) params.courseLevel = searchForm.courseLevel

    console.log('🔍 开始请求课程数据...');
    console.log(' 请求参数:', params);

    const res = await request({
      url: '/member/courses',
      method: 'get',
      params
    }) as any

    console.log('📥 后端返回的完整响应:', res);

    if (res.code === 200) {
      if (res.data) {
        if (Array.isArray(res.data)) {
          console.log('✅ 使用data数组, 数量:', res.data.length);
          tableData.value = res.data
          pagination.total = res.data.length
        } else if (res.data.content) {
          console.log('✅ 使用data.content (Spring Page格式), 数量:', res.data.content.length);
          tableData.value = res.data.content
          pagination.total = res.data.totalElements || res.data.content.length
        } else if (res.data.records) {
          console.log('✅ 使用data.records, 数量:', res.data.records.length);
          tableData.value = res.data.records
          pagination.total = res.data.total || res.data.records.length
        } else if (res.data.list) {
          console.log('✅ 使用data.list, 数量:', res.data.list.length);
          tableData.value = res.data.list
          pagination.total = res.data.total || res.data.list.length
        } else if (res.data.data) {
          console.log('✅ 使用data.data, 数据:', res.data.data);
          if (Array.isArray(res.data.data)) {
            tableData.value = res.data.data
            pagination.total = res.data.data.length
          } else if (res.data.data.content) {
            tableData.value = res.data.data.content
            pagination.total = res.data.data.totalElements || res.data.data.content.length
          } else if (res.data.data.records) {
            tableData.value = res.data.data.records
            pagination.total = res.data.data.total || res.data.data.records.length
          } else if (res.data.data.list) {
            tableData.value = res.data.data.list
            pagination.total = res.data.data.total || res.data.data.list.length
          }
        } else {
          console.warn('⚠️ 无法识别的数据格式');
          tableData.value = []
          pagination.total = 0
        }
      } else {
        console.warn('️ data为空');
        tableData.value = []
        pagination.total = 0
      }
      
      // 标记已报名的课程
      markEnrolledCourses()
      
      console.log('📋 最终表格数据:', tableData.value);
      console.log('📊 总数:', pagination.total);
    } else {
      console.warn('⚠️ API返回非成功状态');
      ElMessage.warning(res.message || '获取数据失败');
      tableData.value = []
      pagination.total = 0
    }
  } catch (error: any) {
    console.error('❌ 加载课程数据失败:', error);
    ElMessage.error('加载课程数据失败: ' + (error.message || '未知错误'));
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
    console.log('🏁 课程数据加载完成');
  }
}

// 获取用户已报名的课程
const fetchEnrolledCourses = async () => {
  if (!userStore.userId) {
    console.warn('⚠️ 用户未登录，无法获取已报名课程');
    return
  }

  try {
    console.log('📚 开始获取已报名课程...');
    
    const res = await request({
      url: '/member/appointments/my',
      method: 'get',
      params: {
        page: 1,
        size: 100
      }
    }) as any

    console.log('📥 已报名课程响应:', res);

    if (res.code === 200 && res.data) {
      let dataList = []
      
      if (res.data.content) {
        dataList = res.data.content
      } else if (res.data.records) {
        dataList = res.data.records
      } else if (res.data.list) {
        dataList = res.data.list
      } else if (Array.isArray(res.data)) {
        dataList = res.data
      } else if (res.data.data) {
        if (res.data.data.content) {
          dataList = res.data.data.content
        } else if (res.data.data.records) {
          dataList = res.data.data.records
        } else if (res.data.data.list) {
          dataList = res.data.data.list
        } else if (Array.isArray(res.data.data)) {
          dataList = res.data.data
        }
      }

      console.log('📊 已报名课程数据:', dataList);

      enrolledCourseIds.value = new Set()
      dataList.forEach((item: any) => {
        if ((item.status === 0 || item.status === 1) && item.courseId) {
          enrolledCourseIds.value.add(item.courseId)
          console.log('✅ 标记已报名课程ID:', item.courseId);
        }
      })

      console.log('🎯 已报名课程ID集合:', Array.from(enrolledCourseIds.value));
    }
  } catch (error: any) {
    console.error('❌ 获取已报名课程失败:', error);
  }
}

// 标记已报名的课程
const markEnrolledCourses = () => {
  tableData.value.forEach(course => {
    if (enrolledCourseIds.value.has(course.id)) {
      course.isEnrolled = true
      console.log('🎯 课程已报名:', course.courseName, course.id);
    } else {
      course.isEnrolled = false
    }
  })
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.courseName = ''
  searchForm.storeId = null
  searchForm.courseType = ''
  searchForm.courseLevel = ''
  handleSearch()
}

// 报名课程
const handleEnroll = (row: any) => {
  if (row.isEnrolled) {
    ElMessage.warning('您已报名该课程')
    return
  }
  currentCourse.value = row
  confirmDialogVisible.value = true
  console.log('📝 打开确认报名对话框');
  console.log('  当前课程:', currentCourse.value);
}

// 去支付
const handleGoToPayment = () => {
  if (!currentCourse.value) {
    console.error('❌ 支付条件不满足:');
    console.error('  currentCourse:', currentCourse.value);
    console.error('  selectedPayMethod:', selectedPayMethod.value);
    ElMessage.warning('请先选择课程')
    return
  }
  
  console.log('💳 打开支付方式选择对话框');
  console.log('  当前课程:', currentCourse.value);
  
  // 关闭确认对话框
  confirmDialogVisible.value = false
  // 打开支付方式选择对话框
  selectedPayMethod.value = 1 // 默认微信支付
  paymentMethodDialogVisible.value = true
}

// 确认支付
const handleConfirmPayment = async () => {
  if (!currentCourse.value) {
    console.error('❌ 支付条件不满足:');
    console.error('  currentCourse:', currentCourse.value);
    console.error('  selectedPayMethod:', selectedPayMethod.value);
    ElMessage.warning('支付信息不完整，请重试')
    return
  }
  
  if (!selectedPayMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  paymentLoading.value = true
  try {
    console.log('💳 开始支付课程...');
    console.log('  课程ID:', currentCourse.value.id);
    console.log('  课程名称:', currentCourse.value.courseName);
    console.log('  支付方式:', selectedPayMethod.value === 1 ? '微信支付' : '支付宝');
    console.log('  已报名课程ID集合:', Array.from(enrolledCourseIds.value));
    
    const res = await request({
      url: '/member/courses/book',
      method: 'post',
      data: {
        courseId: currentCourse.value.id,
        payMethod: selectedPayMethod.value,
        remark: ''
      }
    }) as any
    
    console.log(' 支付接口返回:', res);
    
    if (res.code === 200) {
      ElMessage.success('支付成功！报名成功')
      
      // 方法1：直接在当前表格数据中标记该课程为已报名
      console.log('🔄 更新表格数据中的报名状态...');
      const courseId = currentCourse.value.id;
      tableData.value.forEach(course => {
        console.log('  检查课程:', course.courseName, 'ID:', course.id);
        if (course.id === courseId) {
          course.isEnrolled = true;
          console.log('✅ 已将课程标记为已报名:', course.courseName);
        }
      });
      
      // 方法2：同时更新已报名课程ID集合
      console.log('📝 更新已报名课程ID集合...');
      enrolledCourseIds.value.add(courseId);
      console.log('✅ 已添加课程ID:', courseId);
      console.log(' 当前已报名课程ID集合:', Array.from(enrolledCourseIds.value));
      
      // 方法3：重新获取最新数据确保同步
      console.log('🔄 重新加载数据...');
      await fetchEnrolledCourses();
      await fetchData();
      
      console.log('✅ 数据刷新完成');
      console.log('📊 最终表格数据:', tableData.value);
      tableData.value.forEach(course => {
        console.log('  课程:', course.courseName, 'isEnrolled:', course.isEnrolled);
      });
      
      // 关闭支付方式选择对话框
      paymentMethodDialogVisible.value = false;
    } else {
      ElMessage.error(res.message || '支付失败')
    }
  } catch (error: any) {
    console.error('❌ 支付失败:', error);
    ElMessage.error(error.response?.data?.message || '支付失败，请重试')
  } finally {
    paymentLoading.value = false
  }
}

// 关闭确认报名对话框
const handleConfirmDialogClose = () => {
  // 不清空currentCourse，因为可能还要去支付
  console.log(' 关闭确认报名对话框');
}

// 关闭支付方式选择对话框
const handlePaymentMethodDialogClose = () => {
  // 清空当前课程
  currentCourse.value = null;
  selectedPayMethod.value = 1;
  console.log('💳 关闭支付方式选择对话框');
}

onMounted(async () => {
  await fetchEnrolledCourses()
  fetchData()
})
</script>

<style scoped>
.course-enroll-view {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.payment-info h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.price-highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.payment-tips {
  margin-top: 20px;
}

.payment-tips p {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 支付方式选择样式 */
.payment-method-content {
  padding: 10px 0;
}

.payment-method-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
  text-align: center;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 2px solid #E4E7ED;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.payment-method-item:hover {
  border-color: #409EFF;
  background-color: #F5F7FA;
}

.payment-method-item.selected {
  border-color: #409EFF;
  background-color: #ECF5FF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.method-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 13px;
  color: #909399;
}

.check-icon {
  margin-left: auto;
}

.payment-notice {
  margin-top: 20px;
}

.payment-notice p {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}
</style>
