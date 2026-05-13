<template>
  <div class="notification-manage-view">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="公告标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入公告标题"
            clearable
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item label="发布类型">
          <el-select v-model="searchForm.publishType" placeholder="全部类型" clearable style="width: 120px">
            <el-option label="单发" value="single" />
            <el-option label="群发" value="batch" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="全部优先级" clearable style="width: 100px">
            <el-option label="普通" :value="1" />
            <el-option label="重要" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="searchForm.publishStatus" placeholder="全部状态" clearable style="width: 100px">
            <el-option label="未发布" :value="0" />
            <el-option label="已发布" :value="1" />
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
          <h4>公告列表</h4>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增公告
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
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="publishType" label="发布类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.publishType === 'single' ? 'info' : 'primary'">
              {{ row.publishType === 'single' ? '单发' : '群发' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.priority === 1 ? 'info' : row.priority === 2 ? 'warning' : 'danger'">
              {{ row.priority === 1 ? '普通' : row.priority === 2 ? '重要' : '紧急' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishStatus" label="发布状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">
              {{ row.publishStatus === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="160" />
        <el-table-column prop="expireTime" label="过期时间" width="160" />
        <el-table-column prop="storeName" label="门店" width="150" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
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

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="公告详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ currentNotification.title }}</el-descriptions-item>
        <el-descriptions-item label="发布类型">
          <el-tag :type="currentNotification.publishType === 'single' ? 'info' : 'primary'">
            {{ currentNotification.publishType === 'single' ? '单发' : '群发' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="currentNotification.priority === 1 ? 'info' : currentNotification.priority === 2 ? 'warning' : 'danger'">
            {{ currentNotification.priority === 1 ? '普通' : currentNotification.priority === 2 ? '重要' : '紧急' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="currentNotification.publishStatus === 1 ? 'success' : 'info'">
            {{ currentNotification.publishStatus === 1 ? '已发布' : '未发布' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentNotification.publishTime }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ currentNotification.expireTime }}</el-descriptions-item>
        <el-descriptions-item label="门店">{{ currentNotification.storeName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentNotification.createTime }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div class="notification-content">{{ currentNotification.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="10"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布类型" prop="publishType">
              <el-select v-model="formData.publishType" placeholder="请选择发布类型" style="width: 100%">
                <el-option label="单发" value="single" />
                <el-option label="群发" value="batch" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
                <el-option label="普通" :value="1" />
                <el-option label="重要" :value="2" />
                <el-option label="紧急" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店" prop="storeId">
              <el-select 
                v-model="formData.storeId" 
                placeholder="请选择门店" 
                clearable 
                style="width: 100%"
                :disabled="userStore.role !== 'ADMIN'"
              >
                <el-option
                  v-for="store in storeOptions"
                  :key="store.value"
                  :label="store.label"
                  :value="store.value"
                />
              </el-select>
              <span v-if="userStore.role !== 'ADMIN'" style="color: #909399; font-size: 12px;">
                （普通管理员只能发布本店公告）
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布状态" prop="publishStatus">
              <el-radio-group v-model="formData.publishStatus">
                <el-radio :value="0">未发布</el-radio>
                <el-radio :value="1">已发布</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间" prop="publishTime">
              <el-date-picker
                v-model="formData.publishTime"
                type="datetime"
                placeholder="选择发布时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker
                v-model="formData.expireTime"
                type="datetime"
                placeholder="选择过期时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, View } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 获取用户 store
const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
  title: '',
  publishType: '',
  priority: null as number | null,
  publishStatus: null as number | null
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

// 查看对话框
const viewDialogVisible = ref(false)
const currentNotification = ref<any>({})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const submitLoading = ref(false)

// 表单数据
const formData = ref({
  id: null as number | null,
  title: '',
  content: '',
  publishType: 'single',
  priority: 1,
  storeId: null as number | null,
  publishStatus: 0,
  publishTime: '',
  expireTime: ''
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  publishType: [{ required: true, message: '请选择发布类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

// 门店选项
const storeOptions = ref<any[]>([])

// 获取当前用户信息（用于公告管理）
const getCurrentUserInfo = async () => {
  try {
    console.log('🎯 ========== 公告管理 - 开始获取当前用户信息 ==========')
    console.log('📋 userStore.storeId:', userStore.storeId)
    console.log('📋 userStore.storeId 类型:', typeof userStore.storeId)
    console.log('📋 userStore.storeName:', userStore.storeName)
    console.log('📋 userStore.role:', userStore.role)
    console.log('📋 sessionStorage storeId:', sessionStorage.getItem('storeId'))
    console.log('📋 sessionStorage storeName:', sessionStorage.getItem('storeName'))
    
    // 🔧 简化逻辑：直接使用 userStore 的值
    // userStore 在初始化时已经从 localStorage 读取，登录时也会更新
    const storeId = userStore.storeId
    const storeName = userStore.storeName
    const role = userStore.role
    
    // 判断是否为超级管理员：storeId 为 undefined/null/0 且 role 为 ADMIN
    const isSuperAdmin = role === 'ADMIN' && (storeId === undefined || storeId === null || storeId === 0)
    
    console.log('🎯 判断条件:')
    console.log('  - role === "ADMIN":', role === 'ADMIN')
    console.log('  - storeId === undefined:', storeId === undefined)
    console.log('  - storeId === null:', storeId === null)
    console.log('  - storeId === 0:', storeId === 0)
    console.log('  - 最终 isSuperAdmin:', isSuperAdmin)
    
    console.log('🎯 公告管理 - 用户类型判断:', {
      isSuperAdmin,
      role,
      storeId,
      storeName
    })
    console.log('🎯 ====================================================')
    
    if (isSuperAdmin) {
      console.log('✅ 当前用户是超级管理员（无门店限制）')
      return {
        role: 'ADMIN',
        storeId: null,
        storeName: '全系统',
        isSuperAdmin: true
      }
    } else {
      console.log('🏢 当前用户是普通管理员（有门店限制）')
      return {
        role,
        storeId: storeId || null,
        storeName: storeName || `门店-${storeId}`,
        isSuperAdmin: false
      }
    }
  } catch (error) {
    console.error('❌ 公告管理 - 获取当前用户信息失败:', error)
  }
  return null
}

// 加载门店选项
const loadStoreOptions = async () => {
  console.log('🏪 公告管理 - 开始加载门店选项...')
  console.log('🏪 当前 userStore.role:', userStore.role)
  console.log('🏪 当前 userStore.storeId:', userStore.storeId)
  
  try {
    const userInfo = await getCurrentUserInfo()
    const isSuperAdmin = userInfo?.isSuperAdmin === true
    
    console.log('🎯 公告管理 - 用户类型判断:', {
      isSuperAdmin,
      role: userInfo?.role,
      storeId: userInfo?.storeId,
      storeName: userInfo?.storeName
    })
    
    if (isSuperAdmin) {
      // 超级管理员：显示"全系统"，不显示具体门店
      console.log('👑 超级管理员，显示全系统')
      
      // 使用 0 作为超级管理员的标识（Element Plus 要求 value 不能是 null/undefined）
      storeOptions.value = [
        { label: '全系统', value: 0 }  // 改为 0
      ]
      
      // 使用 nextTick 确保 DOM 更新后再设置值
      await nextTick()
      formData.value.storeId = 0  // 改为 0
      
      console.log('✅ 已设置默认门店为: 全系统 (0)')
      console.log('✅ formData.storeId:', formData.value.storeId)
      console.log('✅ storeOptions:', storeOptions.value)
    } else {
      // 普通管理员：根据 storeId 从门店列表中查找门店名称
      const currentStoreId = userInfo?.storeId
      
      console.log('🏢 普通管理员，storeId:', currentStoreId)
      
      if (currentStoreId) {
        // 调用门店详情接口获取门店名称
        try {
          console.log('🔍 正在调用门店详情接口获取门店名称...')
          console.log('🔍 门店 ID:', currentStoreId)
          
          const res = await request({
            url: `/stores/${currentStoreId}`,
            method: 'get'
          }) as any
          
          console.log('📦 门店详情接口返回:', res)
          console.log('📦 res.data:', res.data)
          
          let storeName = `门店-${currentStoreId}` // 默认后备名称
          
          if (res.code === 200 && res.data) {
            // 门店详情接口直接返回门店对象
            storeName = res.data.name || res.data.storeName || storeName
            console.log('✅ 从门店详情接口获取到名称:', storeName)
          } else {
            console.warn('⚠️ 门店详情接口未返回数据，使用后备名称')
          }
          
          console.log('✅ 最终门店名称:', storeName)
          
          storeOptions.value = [
            { label: storeName, value: currentStoreId }
          ]
          
          // 设置表单默认值为本店
          formData.value.storeId = currentStoreId
          console.log('✅ 已设置默认门店为:', formData.value.storeId, '-', storeName)
          console.log('✅ storeOptions:', storeOptions.value)
        } catch (error) {
          console.error('❌ 获取门店详情失败，使用后备名称:', error)
          // 失败时使用后备名称
          const storeName = `门店-${currentStoreId}`
          storeOptions.value = [
            { label: storeName, value: currentStoreId }
          ]
          formData.value.storeId = currentStoreId
        }
      } else {
        console.warn('⚠️ 普通管理员没有 storeId')
        storeOptions.value = []
      }
    }
    
    console.log('📋 公告管理 - 最终门店选项:', storeOptions.value)
    console.log('📋 公告管理 - 表单默认门店 ID:', formData.value.storeId)
  } catch (error) {
    console.error('❌ 公告管理 - 加载门店选项失败:', error)
    // 失败时根据角色显示默认选项
    const isSuperAdmin = userStore.role === 'ADMIN' && (!userStore.storeId || userStore.storeId === 0)
    if (isSuperAdmin) {
      storeOptions.value = [{ label: '全系统', value: null }]
    } else {
      storeOptions.value = [{ label: '全系统', value: null }]
    }
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchForm.title) params.title = searchForm.title
    if (searchForm.publishType) params.publishType = searchForm.publishType
    if (searchForm.priority !== null) params.priority = searchForm.priority
    if (searchForm.publishStatus !== null) params.publishStatus = searchForm.publishStatus

    const res = await request({
      url: '/admin/announcements',
      method: 'get',
      params
    }) as any

    console.log('公告管理 - 后端返回数据:', res)

    if (res.code === 200) {
      // 处理不同的数据格式
      if (res.data) {
        // MyBatis-Plus 风格 { records: [...], total: 0 }
        if (Array.isArray(res.data.records)) {
          tableData.value = res.data.records
          pagination.total = res.data.total || 0
        }
        // 通用分页格式 { list: [...], total: 0 }
        else if (Array.isArray(res.data.list)) {
          tableData.value = res.data.list
          pagination.total = res.data.total || 0
        } 
        // 直接返回数组
        else if (Array.isArray(res.data)) {
          tableData.value = res.data
          pagination.total = res.data.length
        }
        // 单个对象
        else {
          tableData.value = [res.data]
          pagination.total = 1
        }
      } else {
        tableData.value = []
        pagination.total = 0
      }
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error: any) {
    console.error('获取公告数据失败:', error)
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
  searchForm.title = ''
  searchForm.publishType = ''
  searchForm.priority = null
  searchForm.publishStatus = null
  handleSearch()
}

// 查看
const handleView = (row: any) => {
  currentNotification.value = { ...row }
  viewDialogVisible.value = true
}

// 新增
const handleAdd = () => {
  console.log('➕ 公告管理 - 点击新增按钮')
  console.log('  - 当前用户角色:', userStore.role)
  console.log('  - 当前表单 storeId:', formData.value.storeId)
  
  dialogTitle.value = '新增公告'
  dialogVisible.value = true
  
  // 确保新增时门店值正确
  if (userStore.role !== 'ADMIN' && !formData.value.storeId) {
    // 如果是普通管理员且没有默认门店，重新加载
    loadStoreOptions()
  }
}

// 编辑
const handleEdit = (row: any) => {
  console.log('✏️ 公告管理 - 点击编辑按钮')
  console.log('  - 编辑的公告信息:', {
    id: row.id,
    title: row.title,
    storeId: row.storeId,
    storeName: row.storeName
  })
  
  dialogTitle.value = '编辑公告'
  formData.value = {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    publishType: row.publishType || 'single',
    priority: row.priority || 1,
    storeId: row.storeId,
    publishStatus: row.publishStatus || 0,
    publishTime: row.publishTime || '',
    expireTime: row.expireTime || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request({
        url: `/admin/announcements/${row.id}`,
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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      console.error('❌ 公告管理 - 表单验证失败')
      return
    }

    console.log('✅ 公告管理 - 表单验证通过')
    console.log('📦 公告管理 - 提交的数据:', formData.value)
    console.log('  - 当前用户角色:', userStore.role)
    console.log('  - 提交的门店 ID:', formData.value.storeId)

    submitLoading.value = true
    try {
      const url = formData.value.id ? `/admin/announcements/${formData.value.id}` : '/admin/announcements'
      const method = formData.value.id ? 'put' : 'post'

      console.log('🌐 公告管理 - 请求信息:', {
        URL: url,
        Method: method,
        Data: formData.value
      })

      const res = await request({
        url,
        method,
        data: formData.value
      }) as any

      console.log('📦 公告管理 - 后端返回:', res)

      if (res.code === 200) {
        ElMessage.success(formData.value.id ? '更新成功' : '新增成功')
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.message || '操作失败')
        console.error('❌ 公告管理 - 操作失败:', res.message)
      }
    } catch (error: any) {
      console.error('❌ 公告管理 - 提交失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  console.log('🔄 公告管理 - 关闭对话框，重置表单')
  formRef.value?.resetFields()
  formData.value = {
    id: null,
    title: '',
    content: '',
    publishType: 'single',
    priority: 1,
    storeId: null,
    publishStatus: 0,
    publishTime: '',
    expireTime: ''
  }
  
  // 重新加载门店选项，确保默认值正确
  loadStoreOptions()
}

onMounted(() => {
  console.log('🚀 公告管理 - 组件挂载，开始初始化')
  fetchData()
  loadStoreOptions()
})
</script>

<style scoped>
.notification-manage-view {
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

.notification-content {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #606266;
}
</style>