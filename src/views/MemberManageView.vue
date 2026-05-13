<template>
  <div class="member-manage-view">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索会员姓名、手机号、会员卡号"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
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

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <h4>会员列表</h4>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增会员
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="memberNo" label="会员卡号" width="150" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === 1 ? 'primary' : 'danger'">
              {{ row.gender === 1 ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" width="180" show-overflow-tooltip />
        <el-table-column prop="registerStoreName" label="注册门店" width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button type="success" link @click="handleCheckIn(row)">
              <el-icon><Check /></el-icon>
              签到
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="注册门店" prop="registerStoreId">
          <el-select v-model="formData.registerStoreId" placeholder="请选择注册门店" style="width: 100%">
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-form-item label="会员卡类型" prop="cardType">
          <el-radio-group v-model="formData.cardType">
            <el-radio value="period">期限卡</el-radio>
            <el-radio value="count">次数卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="加入日期" prop="joinDate">
          <el-date-picker
            v-model="formData.joinDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 签到对话框 -->
    <el-dialog
      v-model="checkInDialogVisible"
      title="会员签到"
      width="500px"
    >
      <el-form :model="checkInForm" label-width="100px">
        <el-form-item label="签到门店">
          <el-select v-model="checkInForm.storeId" placeholder="请选择门店" style="width: 100%">
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签到方式">
          <el-select v-model="checkInForm.checkInMethod" placeholder="请选择签到方式" style="width: 100%">
            <el-option label="二维码" value="qrcode" />
            <el-option label="人脸识别" value="face" />
            <el-option label="手动签到" value="manual" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="checkInForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCheckInSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 密码显示对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="会员创建成功"
      width="450px"
      :close-on-click-modal="false"
      :show-close="false"
      @close="closePasswordDialog"
    >
      <div class="password-dialog-content">
        <el-alert
          title="请妥善保管以下密码信息"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        <div class="password-info">
          <div class="info-item">
            <span class="label">会员姓名：</span>
            <span class="value">{{ passwordData.realName }}</span>
          </div>
          <div class="info-item">
            <span class="label">手机号：</span>
            <span class="value">{{ passwordData.phone }}</span>
          </div>
          <div class="info-item password-item">
            <span class="label">初始密码：</span>
            <span class="value password-value">{{ passwordData.password }}</span>
            <el-button 
              type="primary" 
              link 
              @click="copyPassword"
              style="margin-left: 10px"
            >
              复制
            </el-button>
          </div>
        </div>
        <el-divider />
        <div class="countdown-info">
          <el-progress 
            :percentage="countdownProgress" 
            :color="countdownColor"
            :stroke-width="8"
          />
          <p class="countdown-text">
            窗口将在 <span class="countdown-number">{{ countdownSeconds }}</span> 秒后自动关闭
          </p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="passwordDialogVisible = false">
          我知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Check } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: null as number | null
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
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const submitLoading = ref(false)

// 表单数据
const formData = ref({
  id: null,
  realName: '',
  phone: '',
  gender: 1,
  idCard: '',
  registerStoreId: null,
  remark: '',
  cardType: 'period',
  joinDate: ''
})

// 表单验证规则
const formRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  registerStoreId: [{ required: true, message: '请选择注册门店', trigger: 'change' }]
}

// 门店选项
const storeOptions = ref<{ id: number; name: string }[]>([])

// 签到对话框
const checkInDialogVisible = ref(false)
const checkInForm = ref({
  memberId: null,
  storeId: null,
  checkInMethod: 'qrcode',
  remark: ''
})

// 密码显示对话框
const passwordDialogVisible = ref(false)
const passwordData = ref({
  realName: '',
  phone: '',
  password: ''
})
const countdownSeconds = ref(10)
const countdownTimer = ref<number | null>(null)

// 计算倒计时进度
const countdownProgress = computed(() => {
  return ((10 - countdownSeconds.value) / 10) * 100
})

// 倒计时进度条颜色
const countdownColor = computed(() => {
  if (countdownSeconds.value > 5) return '#67C23A'
  if (countdownSeconds.value > 2) return '#E6A23C'
  return '#F56C6C'
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchForm.status !== null) {
      params.status = searchForm.status
    }
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }

    const res = await request({
      url: '/members',
      method: 'get',
      params
    }) as any

    console.log('===== 会员管理 - 后端返回数据 =====')
    console.log('完整响应:', JSON.parse(JSON.stringify(res)))
    console.log('data 字段:', res.data)
    console.log('data.records:', res.data?.records)
    console.log('data.list:', res.data?.list)
    console.log('data 是否为数组:', Array.isArray(res.data))
    console.log('data.records 是否为数组:', Array.isArray(res.data?.records))
    console.log('data.list 是否为数组:', Array.isArray(res.data?.list))
    
    if (res.code === 200) {
      // 处理不同的数据格式
      if (res.data) {
        // 如果是分页格式 { records: [...], total: 0 } (MyBatis-Plus 风格)
        if (Array.isArray(res.data.records)) {
          console.log('使用分页格式 (records)，数据条数:', res.data.records.length)
          console.log('第一条数据:', JSON.parse(JSON.stringify(res.data.records[0])))
          tableData.value = res.data.records
          pagination.total = res.data.total || 0
        } 
        // 如果是分页格式 { list: [...], total: 0 } (通用风格)
        else if (Array.isArray(res.data.list)) {
          console.log('使用分页格式 (list)，数据条数:', res.data.list.length)
          console.log('第一条数据:', JSON.parse(JSON.stringify(res.data.list[0])))
          tableData.value = res.data.list
          pagination.total = res.data.total || 0
        }
        // 如果是直接返回数组
        else if (Array.isArray(res.data)) {
          console.log('使用数组格式，数据条数:', res.data.length)
          console.log('第一条数据:', JSON.parse(JSON.stringify(res.data[0])))
          tableData.value = res.data
          pagination.total = res.data.length
        }
        // 如果是单个对象
        else {
          console.log('使用单对象格式')
          console.log('对象内容:', JSON.parse(JSON.stringify(res.data)))
          console.log('对象的所有键:', Object.keys(res.data))
          tableData.value = [res.data]
          pagination.total = 1
        }
      } else {
        console.log('没有数据')
        tableData.value = []
        pagination.total = 0
      }
      console.log('最终 tableData 内容:', JSON.parse(JSON.stringify(tableData.value)))
      console.log('=====================================')
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error: any) {
    console.error('获取会员数据失败:', error)
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = null
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增会员'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑会员'
  formData.value = {
    id: row.id,
    realName: row.realName || '',
    phone: row.phone || '',
    gender: row.gender || 1,
    idCard: row.idCard || '',
    registerStoreId: row.registerStoreId,
    remark: row.remark || '',
    cardType: row.cardType || 'period',
    joinDate: row.joinDate || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该会员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request({
        url: `/members/${row.id}`,
        method: 'delete'
      }) as any

      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 签到
const handleCheckIn = (row: any) => {
  checkInForm.value = {
    memberId: row.id,
    storeId: null,
    checkInMethod: 'qrcode',
    remark: ''
  }
  checkInDialogVisible.value = true
}

// 签到提交
const handleCheckInSubmit = async () => {
  try {
    const res = await request({
      url: `/members/${checkInForm.value.memberId}/check-in`,
      method: 'post',
      data: checkInForm.value
    }) as any

    if (res.code === 200) {
      ElMessage.success('签到成功')
      checkInDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '签到失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '签到失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const url = formData.value.id ? `/members/${formData.value.id}` : '/members'
      const method = formData.value.id ? 'put' : 'post'

      const res = await request({
        url,
        method,
        data: formData.value
      }) as any

      if (res.code === 200) {
        // 如果是新增操作且返回了临时密码，显示密码对话框
        if (!formData.value.id && res.data && res.data.temporaryPassword) {
          passwordData.value = {
            realName: formData.value.realName,
            phone: formData.value.phone,
            password: res.data.temporaryPassword
          }
          showPasswordDialog()
        } else {
          ElMessage.success(formData.value.id ? '更新成功' : '新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  formData.value = {
    id: null,
    realName: '',
    phone: '',
    gender: 1,
    idCard: '',
    registerStoreId: null,
    remark: '',
    cardType: 'period',
    joinDate: ''
  }
}

// 显示密码对话框并开始倒计时
const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  countdownSeconds.value = 10
  
  // 清除之前的定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  
  // 开始倒计时
  countdownTimer.value = window.setInterval(() => {
    countdownSeconds.value--
    
    if (countdownSeconds.value <= 0) {
      // 倒计时结束，关闭对话框
      closePasswordDialog()
    }
  }, 1000)
}

// 关闭密码对话框
const closePasswordDialog = () => {
  passwordDialogVisible.value = false
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  countdownSeconds.value = 10
}

// 复制密码到剪贴板
const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(passwordData.value.password)
    ElMessage.success('密码已复制到剪贴板')
  } catch (error) {
    // 降级方案：使用传统方法
    const textarea = document.createElement('textarea')
    textarea.value = passwordData.value.password
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('密码已复制到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败，请手动复制')
    }
    document.body.removeChild(textarea)
  }
}

// 加载门店列表
const loadStores = async () => {
  try {
    const res = await request({
      url: '/stores',
      method: 'get'
    }) as any
    
    console.log('🏪 门店列表响应:', res)
    
    let dataList: any[] = []
    if (Array.isArray(res)) {
      dataList = res
    } else if (res && typeof res === 'object') {
      const resData = res as any
      if (resData.code === 200) {
        const data = resData.data
        if (Array.isArray(data)) {
          dataList = data
        } else if (data && Array.isArray(data.records)) {
          dataList = data.records
        } else if (data && Array.isArray(data.list)) {
          dataList = data.list
        } else if (data && Array.isArray(data.items)) {
          dataList = data.items
        }
      }
    }
    
    console.log('🏪 门店数量:', dataList.length)
    
    storeOptions.value = dataList.map((store: any) => ({
      id: store.id,
      name: store.storeName || store.name
    }))
  } catch (error) {
    console.error('❌ 加载门店列表失败:', error)
    storeOptions.value = []
  }
}

onMounted(async () => {
  fetchData()
  await loadStores()
})
</script>

<style scoped>
.member-manage-view {
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

/* 密码对话框样式 */
.password-dialog-content {
  padding: 10px 0;
}

.password-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #606266;
  min-width: 80px;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  flex: 1;
}

.password-item {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.password-value {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  color: #E6A23C;
  letter-spacing: 2px;
}

.countdown-info {
  text-align: center;
}

.countdown-text {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
}

.countdown-number {
  color: #F56C6C;
  font-weight: bold;
  font-size: 18px;
  margin: 0 4px;
}
</style>