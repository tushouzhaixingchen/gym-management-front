<template>
  <div class="order-manage-view">
    <!-- 订单列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>我的订单</h4>
          <el-button @click="handleBack">
            <el-icon><Back /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <!-- 搜索过滤 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="支付状态">
          <el-select v-model="searchForm.payStatus" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="全部" :value="null" />
            <el-option label="未支付" value="0" />
            <el-option label="已支付" value="1" />
            <el-option label="已退款" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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

      <!-- 订单表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="{ row }">
            {{ row.orderType || '课程报名' }}
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.orderAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="支付金额" width="120">
          <template #default="{ row }">
            ¥{{ row.payAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.payMethod === 1 || row.payMethod === '1'" type="success">微信</el-tag>
            <el-tag v-else-if="row.payMethod === 2 || row.payMethod === '2'" type="primary">支付宝</el-tag>
            <el-tag v-else-if="row.payMethod === 3 || row.payMethod === '3'" type="warning">银行卡</el-tag>
            <el-tag v-else-if="row.payMethod === null || row.payMethod === undefined || row.payMethod === ''" type="info">-</el-tag>
            <el-tag v-else type="info">{{ row.payMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payStatus" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPayStatusType(row.payStatus)">
              {{ getPayStatusText(row.payStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small"
              @click="handleViewDetail(row)"
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
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">{{ currentOrder.orderType || '课程报名' }}</el-descriptions-item>
        <el-descriptions-item label="会员ID">{{ currentOrder.memberId }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="price-highlight">¥{{ currentOrder.orderAmount || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="优惠金额">
          <span class="price-highlight">-¥{{ currentOrder.discountAmount || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付金额">
          <span class="price-highlight">¥{{ currentOrder.payAmount || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <el-tag v-if="currentOrder.payMethod === 'WECHAT' || currentOrder.payMethod === '1'" type="success">微信支付</el-tag>
          <el-tag v-else-if="currentOrder.payMethod === 'ALIPAY' || currentOrder.payMethod === '2'" type="primary">支付宝</el-tag>
          <el-tag v-else type="info">{{ currentOrder.payMethod || '未支付' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="getPayStatusType(currentOrder.payStatus)">
            {{ getPayStatusText(currentOrder.payStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '未支付' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2" v-if="currentOrder.remark">
          {{ currentOrder.remark }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Back } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  payStatus: null as string | null,
  dateRange: null as [string, string] | null
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

// 对话框
const detailDialogVisible = ref(false)
const currentOrder = ref<any>(null)

// 获取支付状态文本
const getPayStatusText = (status: string | number) => {
  if (status === 0 || status === '0' || status === 'UNPAID') return '未支付'
  if (status === 1 || status === '1' || status === 'PAID') return '已支付'
  if (status === 2 || status === '2' || status === 'REFUND') return '已退款'
  return status || '未知'
}

// 获取支付状态类型
const getPayStatusType = (status: string | number) => {
  if (status === 0 || status === '0' || status === 'UNPAID') return 'warning'
  if (status === 1 || status === '1' || status === 'PAID') return 'success'
  if (status === 2 || status === '2' || status === 'REFUND') return 'info'
  return 'info'
}

// 获取订单数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    
    if (searchForm.payStatus !== null) {
      params.payStatus = searchForm.payStatus
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    console.log('🔍 开始请求订单数据...');
    console.log(' 请求参数:', params);

    const res = await request({
      url: '/member/orders/my',
      method: 'get',
      params
    }) as any

    console.log('📥 后端返回的完整响应:', res);
    console.log('📊 响应数据类型:', typeof res);
    console.log('📊 是否为数组:', Array.isArray(res));

    // 处理多种响应格式
    let dataList = []
    
    // 情况1: 直接返回数组 (当前后端实际情况)
    if (Array.isArray(res)) {
      console.log('✅ 直接返回数组, 数量:', res.length);
      dataList = res
      pagination.total = res.length
    }
    // 情况2: 标准格式 {code: 200, data: [...]}
    else if (res.code === 200 || res.status === 200) {
      if (res.data) {
        if (Array.isArray(res.data)) {
          console.log('✅ 使用data数组, 数量:', res.data.length);
          dataList = res.data
          pagination.total = res.data.length
        } else if (res.data.content) {
          console.log('✅ 使用data.content (Spring Page格式), 数量:', res.data.content.length);
          dataList = res.data.content
          pagination.total = res.data.totalElements || res.data.content.length
        } else if (res.data.records) {
          console.log('✅ 使用data.records, 数量:', res.data.records.length);
          dataList = res.data.records
          pagination.total = res.data.total || res.data.records.length
        } else if (res.data.list) {
          console.log('✅ 使用data.list, 数量:', res.data.list.length);
          dataList = res.data.list
          pagination.total = res.data.total || res.data.list.length
        } else if (res.data.data) {
          console.log('✅ 使用data.data, 数据:', res.data.data);
          if (Array.isArray(res.data.data)) {
            dataList = res.data.data
            pagination.total = res.data.data.length
          } else if (res.data.data.content) {
            dataList = res.data.data.content
            pagination.total = res.data.data.totalElements || res.data.data.content.length
          } else if (res.data.data.records) {
            dataList = res.data.data.records
            pagination.total = res.data.data.total || res.data.data.records.length
          } else if (res.data.data.list) {
            dataList = res.data.data.list
            pagination.total = res.data.data.total || res.data.data.list.length
          }
        }
      }
    }
    // 情况3: HTTP 200 但没有包装对象
    else if (res && typeof res === 'object' && !res.code) {
      console.log('⚠️ 尝试从对象中提取数据');
      if (Array.isArray(res)) {
        dataList = res
        pagination.total = res.length
      }
    }
    
    tableData.value = dataList
    
    // 🔍 详细日志：打印第一条数据的所有字段
    if (dataList.length > 0) {
      console.log('\n========== 🔍 字段映射分析 ==========');
      console.log('📦 第一条数据:', dataList[0]);
      console.log('📋 所有字段名:', Object.keys(dataList[0]));
      console.log('====================================\n');
      
      // 检查常见字段是否存在
      const firstItem = dataList[0];
      const fieldMapping = {
        'orderNo': firstItem.orderNo,
        'orderType': firstItem.orderType,
        'orderAmount': firstItem.orderAmount,
        'payAmount': firstItem.payAmount,
        'discountAmount': firstItem.discountAmount,
        'payMethod': firstItem.payMethod,
        'payMethod类型': typeof firstItem.payMethod,
        'payStatus': firstItem.payStatus,
        'payStatusDesc': firstItem.payStatusDesc,
        'payTime': firstItem.payTime,
        'remark': firstItem.remark,
        'memberId': firstItem.memberId,
        'createdAt': firstItem.createdAt
      };
      
      console.log(' 字段值检查:');
      Object.entries(fieldMapping).forEach(([key, value]) => {
        console.log(`  ${key}: ${value !== undefined ? '✅ ' + JSON.stringify(value) + ' (类型: ' + typeof value + ')' : '❌ 不存在'}`);
      });
      
      // 尝试找出可能的字段映射
      console.log('\n🔍 可能的字段映射:');
      const allKeys = Object.keys(firstItem);
      const possibleMappings = {
        '订单号': allKeys.find(k => k.toLowerCase().includes('orderno') || k.toLowerCase().includes('orderno')),
        '订单类型': allKeys.find(k => k.toLowerCase().includes('ordertype') || k.toLowerCase().includes('ordertype') || k.toLowerCase().includes('type')),
        '订单金额': allKeys.find(k => k.toLowerCase().includes('orderamount') || k.toLowerCase().includes('orderamount')),
        '支付金额': allKeys.find(k => k.toLowerCase().includes('payamount') || k.toLowerCase().includes('payamount')),
        '优惠金额': allKeys.find(k => k.toLowerCase().includes('discountamount') || k.toLowerCase().includes('discountamount')),
        '支付方式': allKeys.find(k => k.toLowerCase().includes('paymethod') || k.toLowerCase().includes('paymethod') || k.toLowerCase().includes('pay')),
        '支付状态': allKeys.find(k => k.toLowerCase().includes('paystatus') || k.toLowerCase().includes('paystatus')),
        '支付时间': allKeys.find(k => k.toLowerCase().includes('paytime') || k.toLowerCase().includes('paytime') || k.toLowerCase().includes('pay')),
        '创建时间': allKeys.find(k => k.toLowerCase().includes('createdat') || k.toLowerCase().includes('createdat') || k.toLowerCase().includes('createtime') || k.toLowerCase().includes('createtime'))
      };
      
      Object.entries(possibleMappings).forEach(([label, field]) => {
        console.log(`  ${label}: ${field || '未找到'}`);
      });
      console.log('\n');
    }
    
    console.log('📋 最终表格数据:', tableData.value);
    console.log(' 总数:', pagination.total);
  } catch (error: any) {
    console.error(' 加载订单数据失败:', error);
    ElMessage.error('加载订单数据失败: ' + (error.message || '未知错误'));
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
    console.log('🏁 订单数据加载完成');
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.payStatus = null
  searchForm.dateRange = null
  handleSearch()
}

// 支付订单（待后端实现接口）
// 注意：需要后端实现 /api/member/orders/{id}/pay 接口
const handlePayOrder = (row: any) => {
  ElMessage.warning('支付功能需要后端实现支付接口');
  console.log(' 尝试支付订单:', row.orderNo);
}

// 取消订单（待后端实现接口）
// 注意：需要后端实现 /api/member/orders/{id}/cancel 接口
const handleCancelOrder = (row: any) => {
  ElMessage.warning('取消订单功能需要后端实现取消接口');
  console.log(' 尝试取消订单:', row.orderNo);
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

// 返回个人中心
const handleBack = () => {
  router.push('/member')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.order-manage-view {
  padding: 0;
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

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.price-highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
