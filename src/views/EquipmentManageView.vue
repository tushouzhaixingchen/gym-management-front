<template>
  <div class="equipment-manage-view">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="器械编号">
          <el-input
            v-model="searchForm.equipmentNo"
            placeholder="请输入器械编号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="器械名称">
          <el-input
            v-model="searchForm.equipmentName"
            placeholder="请输入器械名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="器械类型">
          <el-select v-model="searchForm.equipmentType" placeholder="全部类型" clearable style="width: 120px">
            <el-option label="有氧器械" value="有氧器械" />
            <el-option label="力量器械" value="力量器械" />
            <el-option label="自由重量" value="自由重量" />
            <el-option label="康复器械" value="康复器械" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-input
            v-model="searchForm.brand"
            placeholder="请输入品牌"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 100px">
            <el-option label="正常" :value="1" />
            <el-option label="维修中" :value="2" />
            <el-option label="报废" :value="3" />
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
          <h4>器械列表</h4>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增器械
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
        <el-table-column prop="equipmentNo" label="器械编号" width="120" />
        <el-table-column prop="equipmentName" label="器械名称" width="150" />
        <el-table-column prop="equipmentType" label="器械类型" width="120" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="model" label="型号" width="100" />
        <el-table-column prop="storeName" label="门店" width="150" />
        <el-table-column prop="location" label="位置" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'warning' : 'danger'">
              {{ row.status === 1 ? '正常' : row.status === 2 ? '维修中' : '报废' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseDate" label="购买日期" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button type="warning" link @click="handleMaintenance(row)">
              <el-icon><Tools /></el-icon>
              报修
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="器械名称" prop="equipmentName">
              <el-input v-model="formData.equipmentName" placeholder="请输入器械名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="器械类型" prop="equipmentType">
              <el-select v-model="formData.equipmentType" placeholder="请选择器械类型" style="width: 100%">
                <el-option label="有氧器械" value="有氧器械" />
                <el-option label="力量器械" value="力量器械" />
                <el-option label="自由重量" value="自由重量" />
                <el-option label="康复器械" value="康复器械" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="formData.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="formData.model" placeholder="请输入型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="formData.storeId" placeholder="请选择门店" style="width: 100%">
                <el-option label="迈格健身 - 朝阳店" :value="1" />
                <el-option label="迈格健身 - 海淀店" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买日期" prop="purchaseDate">
              <el-date-picker
                v-model="formData.purchaseDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购买价格" prop="purchasePrice">
              <el-input-number
                v-model="formData.purchasePrice"
                :min="0"
                :precision="2"
                :step="100"
                style="width: 100%"
                placeholder="请输入购买价格"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">待处理</el-radio>
                <el-radio :value="2">处理中</el-radio>
                <el-radio :value="3">已完成</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入器械位置" />
        </el-form-item>
        <el-form-item label="下次维护日期" prop="nextMaintenanceDate">
          <el-date-picker
            v-model="formData.nextMaintenanceDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
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

    <!-- 报修对话框 -->
    <el-dialog
      v-model="maintenanceDialogVisible"
      title="器械报修"
      width="600px"
    >
      <el-form :model="maintenanceForm" label-width="120px">
        <el-form-item label="器械">
          <el-input :value="maintenanceForm.equipmentName" disabled />
        </el-form-item>
        <el-form-item label="门店" prop="storeId">
          <el-select v-model="maintenanceForm.storeId" placeholder="请选择门店" style="width: 100%">
            <el-option label="迈格健身 - 朝阳店" :value="1" />
            <el-option label="迈格健身 - 海淀店" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护类型" prop="maintenanceType">
          <el-select v-model="maintenanceForm.maintenanceType" placeholder="请选择维护类型" style="width: 100%">
            <el-option label="故障" value="故障" />
            <el-option label="定期保养" value="定期保养" />
            <el-option label="维修" value="维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护日期" prop="maintenanceDate">
          <el-date-picker
            v-model="maintenanceForm.maintenanceDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="维护人员" prop="maintenanceStaff">
          <el-input v-model="maintenanceForm.maintenanceStaff" placeholder="请输入维护人员" />
        </el-form-item>
        <el-form-item label="维护费用" prop="maintenanceCost">
          <el-input-number
            v-model="maintenanceForm.maintenanceCost"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 100%"
            placeholder="请输入维护费用"
          />
        </el-form-item>
        <el-form-item label="故障描述" prop="description">
          <el-input
            v-model="maintenanceForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入故障描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="maintenanceForm.status">
            <el-radio :label="1">待处理</el-radio>
            <el-radio :label="2">处理中</el-radio>
            <el-radio :label="3">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintenanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMaintenanceSubmit">提交报修</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Tools } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  equipmentNo: '',
  equipmentName: '',
  equipmentType: '',
  brand: '',
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
  equipmentName: '',
  equipmentType: '',
  brand: '',
  model: '',
  storeId: null,
  purchaseDate: '',
  purchasePrice: 0,
  location: '',
  status: 1,
  nextMaintenanceDate: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  equipmentName: [{ required: true, message: '请输入器械名称', trigger: 'blur' }],
  equipmentType: [{ required: true, message: '请选择器械类型', trigger: 'change' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  purchaseDate: [{ required: true, message: '请选择购买日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 报修对话框
const maintenanceDialogVisible = ref(false)
const maintenanceForm = ref({
  equipmentId: null,
  equipmentName: '',
  storeId: null,
  maintenanceType: '',
  maintenanceDate: '',
  maintenanceStaff: '',
  maintenanceCost: 0,
  description: '',
  status: 1
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchForm.equipmentNo) params.equipmentNo = searchForm.equipmentNo
    if (searchForm.equipmentName) params.equipmentName = searchForm.equipmentName
    if (searchForm.equipmentType) params.equipmentType = searchForm.equipmentType
    if (searchForm.brand) params.brand = searchForm.brand
    if (searchForm.status !== null) params.status = searchForm.status

    const res = await request({
      url: '/equipments',
      method: 'get',
      params
    }) as any

    console.log('器械管理 - 后端返回数据:', res)

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
    console.error('获取器械数据失败:', error)
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
  searchForm.equipmentNo = ''
  searchForm.equipmentName = ''
  searchForm.equipmentType = ''
  searchForm.brand = ''
  searchForm.status = null
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增器械'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑器械'
  formData.value = {
    id: row.id,
    equipmentName: row.equipmentName || '',
    equipmentType: row.equipmentType || '',
    brand: row.brand || '',
    model: row.model || '',
    storeId: row.storeId,
    purchaseDate: row.purchaseDate || '',
    purchasePrice: row.purchasePrice || 0,
    location: row.location || '',
    status: row.status || 1,
    nextMaintenanceDate: row.nextMaintenanceDate || '',
    remark: row.remark || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该器械吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request({
        url: `/equipments/${row.id}`,
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

// 报修
const handleMaintenance = (row: any) => {
  maintenanceForm.value = {
    equipmentId: row.id,
    equipmentName: row.equipmentName,
    storeId: null,
    maintenanceType: '故障',
    maintenanceDate: '',
    maintenanceStaff: '',
    maintenanceCost: 0,
    description: '',
    status: 1
  }
  maintenanceDialogVisible.value = true
}

// 报修提交
const handleMaintenanceSubmit = async () => {
  try {
    const res = await request({
      url: '/equipments/maintenances',
      method: 'post',
      data: maintenanceForm.value
    }) as any

    if (res.code === 200) {
      ElMessage.success('报修提交成功')
      maintenanceDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '报修失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '报修失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const url = formData.value.id ? `/equipments/${formData.value.id}` : '/equipments'
      const method = formData.value.id ? 'put' : 'post'

      const res = await request({
        url,
        method,
        data: formData.value
      }) as any

      if (res.code === 200) {
        ElMessage.success(formData.value.id ? '更新成功' : '新增成功')
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
    equipmentName: '',
    equipmentType: '',
    brand: '',
    model: '',
    storeId: null,
    purchaseDate: '',
    purchasePrice: 0,
    location: '',
    status: 1,
    nextMaintenanceDate: '',
    remark: ''
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.equipment-manage-view {
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
</style>