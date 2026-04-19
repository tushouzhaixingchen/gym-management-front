<template>
  <div class="course-manage-view">
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 100px">
            <el-option label="正常" :value="1" />
            <el-option label="取消" :value="0" />
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
          <h4>课程列表</h4>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增课程
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
        <el-table-column prop="durationMinutes" label="时长 (分钟)" width="100" />
        <el-table-column prop="maxSeats" label="最大人数" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="room" label="教室" width="120" />
        <el-table-column prop="storeName" label="门店" width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
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
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程类型" prop="courseType">
              <el-input v-model="formData.courseType" placeholder="请输入课程类型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="难度等级" prop="courseLevel">
              <el-select v-model="formData.courseLevel" placeholder="请选择难度等级" style="width: 100%">
                <el-option label="初级" value="beginner" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教练" prop="coachId">
              <el-select v-model="formData.coachId" placeholder="请选择教练" style="width: 100%">
                <el-option label="李教练" :value="1" />
                <el-option label="王教练" :value="2" />
                <el-option label="张教练" :value="3" />
              </el-select>
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
            <el-form-item label="最大人数" prop="maxSeats">
              <el-input-number
                v-model="formData.maxSeats"
                :min="1"
                :step="1"
                style="width: 100%"
                placeholder="请输入最大人数"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程时长 (分钟)" prop="durationMinutes">
              <el-input-number
                v-model="formData.durationMinutes"
                :min="10"
                :step="10"
                style="width: 100%"
                placeholder="请输入课程时长"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程价格" prop="price">
              <el-input-number
                v-model="formData.price"
                :min="0"
                :precision="2"
                :step="10"
                style="width: 100%"
                placeholder="请输入课程价格"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="教室" prop="room">
          <el-input v-model="formData.room" placeholder="请输入教室" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  courseName: '',
  courseType: '',
  courseLevel: '',
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
  courseName: '',
  courseType: '',
  courseLevel: 'beginner',
  coachId: null,
  storeId: null,
  maxSeats: 20,
  startTime: '',
  endTime: '',
  durationMinutes: 60,
  price: 0,
  room: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const formRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseType: [{ required: true, message: '请输入课程类型', trigger: 'blur' }],
  courseLevel: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }],
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  maxSeats: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  durationMinutes: [{ required: true, message: '请输入课程时长', trigger: 'blur' }],
  price: [{ required: true, message: '请输入课程价格', trigger: 'blur' }],
  room: [{ required: true, message: '请输入教室', trigger: 'blur' }]
}

// 获取数据
const fetchData = async () => {
  console.log('🔍 ========== 开始加载课程数据 ==========');
  console.log('📦 请求参数:', {
    page: pagination.page,
    size: pagination.size,
    courseName: searchForm.courseName,
    courseType: searchForm.courseType,
    courseLevel: searchForm.courseLevel,
    status: searchForm.status
  });
  
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchForm.courseName) params.courseName = searchForm.courseName
    if (searchForm.courseType) params.courseType = searchForm.courseType
    if (searchForm.courseLevel) params.courseLevel = searchForm.courseLevel
    if (searchForm.status !== null) params.status = searchForm.status

    console.log('📡 准备请求API: /api/courses');
    console.log('📦 最终请求参数:', params);
    
    const res = await request({
      url: '/courses',
      method: 'get',
      params
    }) as any

    console.log('📥 API响应结果:', res);
    console.log('📊 响应类型:', typeof res);
    console.log('📊 响应code:', res.code);
    console.log('📊 响应message:', res.message);
    console.log('📊 响应data:', res.data);
    console.log('📊 响应data的完整JSON:', JSON.stringify(res.data, null, 2));
    
    if (res.code === 200) {
      // 处理不同的数据格式
      if (res.data) {
        console.log('📦 data类型:', typeof res.data);
        console.log('📦 data是否为数组:', Array.isArray(res.data));
        console.log('📦 data的所有键:', Object.keys(res.data));
        console.log('📦 data完整内容:', JSON.stringify(res.data, null, 2));
        
        if (Array.isArray(res.data)) {
          tableData.value = res.data
          pagination.total = res.data.length
          console.log('✅ 直接使用data数组, 数量:', res.data.length);
        } else if (res.data.records) {
          tableData.value = res.data.records
          pagination.total = res.data.total || res.data.records.length
          console.log('✅ 使用data.records, 数量:', res.data.records.length);
        } else if (res.data.list) {
          tableData.value = res.data.list
          pagination.total = res.data.total || res.data.list.length
          console.log('✅ 使用data.list, 数量:', res.data.list.length);
        } else {
          console.log('⚠️ 无法识别的数据格式');
          console.log('📋 data的所有键:', Object.keys(res.data));
          tableData.value = []
          pagination.total = 0
        }
      } else {
        console.log('⚠️ data为空');
        tableData.value = []
        pagination.total = 0
      }
      
      console.log('📋 最终表格数据:', tableData.value);
      console.log('📊 总数:', pagination.total);
      
      if (tableData.value.length > 0) {
        console.log('📄 第一条数据示例:', JSON.stringify(tableData.value[0], null, 2));
      } else {
        console.log('⚠️ 表格数据为空，可能的原因：');
        console.log('  1. 后端数据库中没有课程数据');
        console.log('  2. 后端接口返回的数据结构不匹配');
        console.log('  3. 需要使用Postman或其他工具直接测试后端接口');
      }
    } else {
      console.warn('⚠️ API返回非成功状态');
      console.warn('  - code:', res.code);
      console.warn('  - message:', res.message);
      ElMessage.warning(res.message || '获取数据失败');
      tableData.value = []
      pagination.total = 0
    }
  } catch (error: any) {
    console.error('❌ ========== 加载课程数据失败 ==========');
    console.error('❌ 错误类型:', error.constructor.name);
    console.error('❌ 错误消息:', error.message);
    console.error('❌ 错误详情:', error);
    if (error.response) {
      console.error('❌ 响应状态:', error.response.status);
      console.error('❌ 响应数据:', error.response.data);
    }
    ElMessage.error('加载课程数据失败: ' + (error.message || '未知错误'));
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
    console.log('🏁 ========== 课程数据加载完成 ==========');
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.courseName = ''
  searchForm.courseType = ''
  searchForm.courseLevel = ''
  searchForm.status = null
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增课程'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑课程'
  formData.value = {
    id: row.id,
    courseName: row.courseName || '',
    courseType: row.courseType || '',
    courseLevel: row.courseLevel || 'beginner',
    coachId: row.coachId,
    storeId: row.storeId,
    maxSeats: row.maxSeats || 20,
    startTime: row.startTime || '',
    endTime: row.endTime || '',
    durationMinutes: row.durationMinutes || 60,
    price: row.price || 0,
    room: row.room || '',
    status: row.status || 1,
    remark: row.remark || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request({
        url: `/courses/${row.id}`,
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
    if (!valid) return

    submitLoading.value = true
    try {
      const url = formData.value.id ? `/courses/${formData.value.id}` : '/courses'
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
    courseName: '',
    courseType: '',
    courseLevel: 'beginner',
    coachId: null,
    storeId: null,
    maxSeats: 20,
    startTime: '',
    endTime: '',
    durationMinutes: 60,
    price: 0,
    room: '',
    status: 1,
    remark: ''
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.course-manage-view {
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