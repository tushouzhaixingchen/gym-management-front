<template>
  <div class="booking-manage-view">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预约单号">
          <el-input
            v-model="searchForm.appointmentNo"
            placeholder="请输入预约单号"
            clearable
          />
        </el-form-item>
        <el-form-item label="会员姓名">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="教练姓名">
          <el-input
            v-model="searchForm.coachName"
            placeholder="请输入教练姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待确认" :value="0" />
            <el-option label="已确认" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
            <el-option label="已爽约" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
          <el-button @click="handleReset" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="appointmentNo" label="预约单号" width="160" />
        <el-table-column prop="memberName" label="会员姓名" width="100" />
        <el-table-column prop="memberPhone" label="会员电话" width="120" />
        <el-table-column prop="coachName" label="教练姓名" width="100" />
        <el-table-column prop="storeName" label="门店" width="120" />
        <el-table-column label="预约时间" width="180">
          <template #default="{ row }">
            {{ row.timeSlotStart }} ~ {{ row.timeSlotEnd }}
          </template>
        </el-table-column>
        <el-table-column prop="durationMinutes" label="时长 (分钟)" width="80" />
        <el-table-column prop="price" label="价格" width="80">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="预约目的" width="120" />
        <el-table-column label="支付状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.payStatus === 1 ? 'success' : 'warning'">
              {{ row.payStatus === 1 ? '已支付' : '未支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预约状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              size="small"
              @click="handleConfirm(row)"
              icon="CircleCheck"
            >
              确认
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="primary"
              size="small"
              @click="handleComplete(row)"
              icon="Select"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              size="small"
              @click="handleNoShow(row)"
              icon="Close"
            >
              爽约
            </el-button>
            <el-button
              v-if="row.status === 0 || row.status === 1"
              type="danger"
              size="small"
              @click="handleCancel(row)"
              icon="Delete"
            >
              取消
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewDetail(row)"
              icon="View"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="预约详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="预约单号">{{ currentRow.appointmentNo }}</el-descriptions-item>
        <el-descriptions-item label="预约状态">
          <el-tag :type="getStatusType(currentRow.status)">
            {{ getStatusText(currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="会员姓名">{{ currentRow.memberName }}</el-descriptions-item>
        <el-descriptions-item label="会员电话">{{ currentRow.memberPhone }}</el-descriptions-item>
        <el-descriptions-item label="教练姓名">{{ currentRow.coachName }}</el-descriptions-item>
        <el-descriptions-item label="门店">{{ currentRow.storeName }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ currentRow.timeSlotStart }} ~ {{ currentRow.timeSlotEnd }}
        </el-descriptions-item>
        <el-descriptions-item label="时长">{{ currentRow.durationMinutes }}分钟</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentRow.price }}</el-descriptions-item>
        <el-descriptions-item label="教练分成">¥{{ currentRow.coachShare }}</el-descriptions-item>
        <el-descriptions-item label="预约目的">{{ currentRow.purpose }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="currentRow.payStatus === 1 ? 'success' : 'warning'">
            {{ currentRow.payStatus === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式" v-if="currentRow.payStatus === 1">
          {{ getPayMethodText(currentRow.payMethod) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间" v-if="currentRow.payTime">
          {{ currentRow.payTime }}
        </el-descriptions-item>
        <el-descriptions-item label="确认时间" v-if="currentRow.confirmedAt">
          {{ currentRow.confirmedAt }}
        </el-descriptions-item>
        <el-descriptions-item label="教练签到时间" v-if="currentRow.coachCheckInTime">
          {{ currentRow.coachCheckInTime }}
        </el-descriptions-item>
        <el-descriptions-item label="教练签退时间" v-if="currentRow.coachCheckOutTime">
          {{ currentRow.coachCheckOutTime }}
        </el-descriptions-item>
        <el-descriptions-item label="实际上课时长" v-if="currentRow.actualDuration">
          {{ currentRow.actualDuration }}分钟
        </el-descriptions-item>
        <el-descriptions-item label="会员签到时间" v-if="currentRow.memberCheckInTime">
          {{ currentRow.memberCheckInTime }}
        </el-descriptions-item>
        <el-descriptions-item label="评价评分" v-if="currentRow.feedbackScore">
          <el-rate v-model="currentRow.feedbackScore" disabled />
        </el-descriptions-item>
        <el-descriptions-item label="评价内容" v-if="currentRow.feedbackContent">
          {{ currentRow.feedbackContent }}
        </el-descriptions-item>
        <el-descriptions-item label="取消原因" v-if="currentRow.cancelReason">
          {{ currentRow.cancelReason }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentRow.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmVisible"
      title="确认预约"
      width="400px"
    >
      <p>确认批准该预约吗？</p>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="success" @click="submitConfirm" icon="CircleCheck">确认</el-button>
      </template>
    </el-dialog>

    <!-- 完成对话框 -->
    <el-dialog
      v-model="completeVisible"
      title="完成预约"
      width="500px"
    >
      <el-form :model="completeForm" label-width="120px">
        <el-form-item label="实际上课时长">
          <el-input-number
            v-model="completeForm.actualDuration"
            :min="1"
            :max="300"
            style="width: 100%"
          />
          <span>分钟</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="completeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplete" icon="Select">完成</el-button>
      </template>
    </el-dialog>

    <!-- 爽约对话框 -->
    <el-dialog
      v-model="noShowVisible"
      title="标记爽约"
      width="500px"
    >
      <el-form :model="noShowForm" label-width="120px">
        <el-form-item label="爽约原因">
          <el-input
            v-model="noShowForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入爽约原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noShowVisible = false">取消</el-button>
        <el-button type="warning" @click="submitNoShow" icon="Close">标记爽约</el-button>
      </template>
    </el-dialog>

    <!-- 取消对话框 -->
    <el-dialog
      v-model="cancelVisible"
      title="取消预约"
      width="500px"
    >
      <el-form :model="cancelForm" label-width="120px">
        <el-form-item label="取消原因">
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入取消原因"
          />
        </el-form-item>
        <el-form-item label="取消方">
          <el-radio-group v-model="cancelForm.cancelBy">
            <el-radio :value="1">会员</el-radio>
            <el-radio :value="2">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelVisible = false">取消</el-button>
        <el-button type="danger" @click="submitCancel" icon="Delete">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

// 搜索表单
const searchForm = reactive({
  appointmentNo: '',
  memberName: '',
  coachName: '',
  status: null as number | null,
});

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 详情对话框
const detailVisible = ref(false);
const currentRow = ref<any>(null);

// 确认对话框
const confirmVisible = ref(false);
const confirmId = ref<number | null>(null);

// 完成对话框
const completeVisible = ref(false);
const completeForm = reactive({
  actualDuration: 60,
  remark: '',
});
const completeId = ref<number | null>(null);

// 爽约对话框
const noShowVisible = ref(false);
const noShowForm = reactive({
  reason: '',
});
const noShowId = ref<number | null>(null);

// 取消对话框
const cancelVisible = ref(false);
const cancelForm = reactive({
  reason: '',
  cancelBy: 2, // 默认管理员取消
});
const cancelId = ref<number | null>(null);

// 获取状态类型
const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: '',
    3: 'info',
    4: 'danger',
  };
  return types[status] || '';
};

// 获取状态文本
const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待确认',
    1: '已确认',
    2: '已完成',
    3: '已取消',
    4: '已爽约',
  };
  return texts[status] || '未知';
};

// 获取支付方式文本
const getPayMethodText = (method: number) => {
  const texts: Record<number, string> = {
    1: '微信',
    2: '支付宝',
    3: '现金',
  };
  return texts[method] || '未知';
};

// 加载预约列表
const loadAppointments = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.pageSize,
    };
    
    if (searchForm.appointmentNo) {
      params.appointmentNo = searchForm.appointmentNo;
    }
    if (searchForm.memberName) {
      params.memberName = searchForm.memberName;
    }
    if (searchForm.coachName) {
      params.coachName = searchForm.coachName;
    }
    if (searchForm.status !== null && searchForm.status !== undefined) {
      params.status = searchForm.status;
    }
    console.log('📋 ============ 加载预约列表 ============');
    console.log('📋 请求接口: GET /admin/appointments');
    console.log('📋 请求参数:', params);
    
    const res: any = await request.get('/admin/appointments', { params });
    
    console.log('📋 后端返回数据:', res);
    console.log('📋 res 的类型:', typeof res);
    console.log('📋 res.data 字段:', res.data);
    
    // 👇 修复：后端可能直接返回数组，而不是 { code, data } 格式
    let dataArray = [];
    let total = 0;
    
    // 情况 1: 标准格式 { code: 200, data: [...] }
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      console.log('📋 标准格式，检查 data 字段');
      
      if (Array.isArray(res.data.records)) {
        // MyBatis-Plus 分页风格
        console.log('📋 使用 MyBatis-Plus 格式，数据量:', res.data.records.length);
        dataArray = res.data.records;
        total = res.data.total || 0;
      } else if (Array.isArray(res.data.list)) {
        // 通用分页风格
        console.log('📋 使用通用分页格式，数据量:', res.data.list.length);
        dataArray = res.data.list;
        total = res.data.total || 0;
      } else if (Array.isArray(res.data)) {
        // 直接数组
        console.log('📋 使用直接数组格式，数据量:', res.data.length);
        dataArray = res.data;
        total = res.data.length;
      }
    }
    // 情况 2: 后端直接返回数组 [ ... ]
    else if (Array.isArray(res)) {
      console.log('📋 后端直接返回数组，数据量:', res.length);
      dataArray = res;
      total = res.length;
    }
    // 情况 3: 其他格式，尝试从 res 中提取
    else {
      console.warn('📋 未识别的数据格式:', res);
    }
    
    // 赋值给表格
    tableData.value = dataArray;
    pagination.total = total;
    
    console.log('📋 最终表格数据:', tableData.value);
    console.log('📋 表格数据长度:', tableData.value.length);
    console.log('📋 分页总数:', pagination.total);

  } catch (error: any) {
    console.error('加载预约列表失败:', error);
    ElMessage.error(error.message || '加载失败');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  console.log('🔍 搜索条件:', searchForm);
  console.log('🔍 搜索参数:', {
    appointmentNo: searchForm.appointmentNo,
    memberName: searchForm.memberName,
    coachName: searchForm.coachName,
    status: searchForm.status
  });
  pagination.page = 1;
  loadAppointments();
};

// 重置
const handleReset = () => {
  searchForm.appointmentNo = '';
  searchForm.memberName = '';
  searchForm.coachName = '';
  searchForm.status = null;
  pagination.page = 1;
  loadAppointments();
};

// 分页变化
const handleSizeChange = () => {
  loadAppointments();
};

const handlePageChange = () => {
  loadAppointments();
};

// 查看详情
const handleViewDetail = (row: any) => {
  getAppointmentDetail(row.id);
};

// 获取预约详情
const getAppointmentDetail = async (id: number) => {
  try {
    const res: any = await request.get(`/admin/appointments/${id}/detail`);
    
    console.log('预约详情 - 后端返回数据:', res);
    console.log('预约详情 - res 的类型:', typeof res);
    console.log('预约详情 - res.data 字段:', res.data);
    
    // 👇 修复：后端可能直接返回对象，而不是 { code, data } 格式
    let detailData = null;
    
    // 情况 1: 标准格式 { code: 200, data: {...} }
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      console.log('预约详情 - 标准格式，使用 res.data');
      detailData = res.data;
    }
    // 情况 2: 后端直接返回对象 { ... }
    else if (res && typeof res === 'object' && !Array.isArray(res)) {
      console.log('预约详情 - 后端直接返回对象，使用 res');
      detailData = res;
    }
    
    if (detailData) {
      console.log('预约详情 - 最终详情数据:', detailData);
      currentRow.value = detailData;
      detailVisible.value = true;
    } else {
      console.error('预约详情 - 无法解析数据');
      ElMessage.error('获取详情失败');
    }
  } catch (error: any) {
    console.error('获取预约详情失败:', error);
    ElMessage.error(error.message || '获取详情失败');
  }
};

// 确认预约
const handleConfirm = (row: any) => {
  confirmId.value = row.id;
  confirmVisible.value = true;
};

const submitConfirm = async () => {
  if (!confirmId.value) return;
  
  try {
    console.log('🔒 ============ 确认预约 ============');
    console.log('🔒 预约 ID:', confirmId.value);
    console.log('🔒 请求接口: PUT /admin/appointments/' + confirmId.value + '/confirm');
    console.log('🔒 请求方法: PUT');
    console.log('🔒 请求体: {}（后端需要 AppointmentConfirmRequest 对象）');
    
    // 后端报错 "Required request body is missing"
    // 说明后端需要接收一个请求体对象，即使字段可以为空
    const res: any = await request.put(`/admin/appointments/${confirmId.value}/confirm`, {});
    
    console.log('🔒 ============ 确认预约响应 ============');
    console.log('🔒 完整响应对象:', res);
    console.log('🔒 res.code:', res?.code);
    console.log('🔒 res.message:', res?.message);
    console.log('🔒 res.data:', res?.data);
    console.log('🔒 响应类型:', typeof res);
    console.log('🔒 是否为数字:', typeof res === 'number');
    console.log('🔒 ==========================================');
    
    // 修复：后端返回的是数字 1（HTTP 200 OK），而不是标准JSON格式
    // 只要请求没有抛出异常，就说明确认成功了
    ElMessage.success('确认成功');
    confirmVisible.value = false;
    console.log('🔄 重新加载预约列表...');
    await loadAppointments();
    console.log('✅ ==========================================');
  } catch (error: any) {
    console.error('❌ ============ 确认预约异常 ============');
    console.error('❌ 错误对象:', error);
    console.error('❌ 错误消息:', error.message);
    console.error('❌ 错误响应:', error.response);
    console.error('❌ 错误响应数据:', error.response?.data);
    console.error('❌ 错误状态码:', error.response?.status);
    console.error('❌ ==========================================');
    
    // 只有在真正出错时才显示错误
    ElMessage.error(error.message || '确认失败');
  }
};

// 完成预约
const handleComplete = (row: any) => {
  completeId.value = row.id;
  completeForm.actualDuration = row.durationMinutes || 60;
  completeForm.remark = '';
  completeVisible.value = true;
};

const submitComplete = async () => {
  if (!completeId.value) return;
  
  try {
    console.log('✅ ============ 完成预约 ============');
    console.log('✅ 预约 ID:', completeId.value);
    console.log('✅ 请求接口: PUT /admin/appointments/' + completeId.value + '/complete');
    console.log('✅ 请求方法: PUT');
    console.log('✅ 请求体:', {
      actualDuration: completeForm.actualDuration,
      remark: completeForm.remark
    });
    
    await request.put(`/admin/appointments/${completeId.value}/complete`, {
      actualDuration: completeForm.actualDuration,
      remark: completeForm.remark
    });
    
    ElMessage.success('完成成功');
    completeVisible.value = false;
    loadAppointments();
    console.log('✅ ==========================================');
  } catch (error: any) {
    console.error('❌ 完成预约失败:', error);
    console.error('❌ 错误响应:', error.response?.data);
    ElMessage.error(error.message || '完成失败');
  }
};

// 标记爽约
const handleNoShow = (row: any) => {
  noShowId.value = row.id;
  noShowForm.reason = '';
  noShowVisible.value = true;
};

const submitNoShow = async () => {
  if (!noShowId.value) return;
  
  try {
    console.log('❌ ============ 标记爽约 ============');
    console.log('❌ 预约 ID:', noShowId.value);
    console.log('❌ 请求接口: PUT /admin/appointments/' + noShowId.value + '/no-show');
    console.log('❌ 请求方法: PUT');
    console.log('❌ 请求体:', { reason: noShowForm.reason });
    
    await request.put(`/admin/appointments/${noShowId.value}/no-show`, {
      reason: noShowForm.reason
    });
    
    ElMessage.success('标记成功');
    noShowVisible.value = false;
    loadAppointments();
    console.log('❌ ==========================================');
  } catch (error: any) {
    console.error('❌ 标记爽约失败:', error);
    console.error('❌ 错误响应:', error.response?.data);
    ElMessage.error(error.message || '标记失败');
  }
};

// 取消预约
const handleCancel = (row: any) => {
  cancelId.value = row.id;
  cancelForm.reason = '';
  cancelForm.cancelBy = 2;
  cancelVisible.value = true;
};

const submitCancel = async () => {
  if (!cancelId.value) return;
  
  try {
    console.log('🚫 ============ 取消预约 ============');
    console.log('🚫 预约 ID:', cancelId.value);
    console.log('🚫 请求接口: PUT /admin/appointments/' + cancelId.value + '/cancel');
    console.log('🚫 请求方法: PUT');
    console.log('🚫 请求体:', {
      cancelReason: cancelForm.reason,
      cancelBy: cancelForm.cancelBy
    });
    
    await request.put(`/admin/appointments/${cancelId.value}/cancel`, {
      cancelReason: cancelForm.reason,
      cancelBy: cancelForm.cancelBy
    });
    
    ElMessage.success('取消成功');
    cancelVisible.value = false;
    loadAppointments();
    console.log('🚫 ==========================================');
  } catch (error: any) {
    console.error('❌ 取消预约失败:', error);
    console.error('❌ 错误响应:', error.response?.data);
    ElMessage.error(error.message || '取消失败');
  }
};

onMounted(() => {
  loadAppointments();
});
</script>

<style scoped>
.booking-manage-view {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>