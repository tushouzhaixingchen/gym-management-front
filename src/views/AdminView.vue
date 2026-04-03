<template>
  <div class="admin-manage-container">
    <!-- 顶部操作栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名、姓名、手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="Search">
            搜索
          </el-button>
          <el-button @click="handleReset" icon="Refresh">
            重置
          </el-button>
          <el-button type="success" @click="handleAdd" icon="Plus">
            新增管理员
          </el-button>
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="roleName" label="角色" width="120" />
        <el-table-column prop="storeName" label="门店" width="150" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              icon="Edit"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              icon="Delete"
            >
              删除
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
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item 
          label="门店" 
          prop="storeId"
          :required="formData.roleId !== 1"
        >
          <el-select v-model="formData.storeId" placeholder="请选择门店" style="width: 100%">
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '@/utils/request';

// 定义 API 响应类型
interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data: T;
}

// 管理员类型
interface Admin {
  id: number;
  username: string;
  realName: string;
  roleId: number;
  roleName: string;
  storeId: number;
  storeName: string;
  phone: string;
  email: string;
  status: number;
}

// 分页数据类型
interface PageData<T = any> {
  list: T[];
  total: number;
}

// 搜索表单
const searchForm = ref({
  keyword: ''
});

// 表格数据
const tableData = ref<Admin[]>([]);
const loading = ref(false);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 对话框
const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 表单数据
const formData = ref({
  id: null as number | null,
  username: '',
  password: '',
  realName: '',
  roleId: null as number | null,
  storeId: null as number | null,
  phone: '',
  email: ''
});

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  storeId: [
    { 
      required: () => formData.value.roleId !== 1, // 超级管理员不需要选择门店
      message: '请选择门店', 
      trigger: 'change' 
    }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

// 角色和门店选项
const roleOptions = ref<{ id: number; name: string }[]>([]);
const storeOptions = ref<{ id: number; name: string }[]>([]);

// 获取管理员列表
const getAdminList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: '/admins',
      method: 'get',
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.value.keyword
      }
    }) as ApiResponse<PageData<Admin>>;

    if (res.code === 200 && res.data) {
      tableData.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  getAdminList();
};

// 重置
const handleReset = () => {
  searchForm.value.keyword = '';
  handleSearch();
};

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增管理员';
  isEdit.value = false;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row: any) => {
  dialogTitle.value = '编辑管理员';
  isEdit.value = true;
  dialogVisible.value = true;

  try {
    const res = await request({
      url: `/admins/${row.id}`,
      method: 'get'
    }) as ApiResponse<Admin>;

    if (res.code === 200 && res.data) {
      formData.value = {
        ...res.data,
        password: '' // 编辑时不显示密码
      };
    }
  } catch (error) {
    console.error('获取管理员详情失败:', error);
    ElMessage.error('获取详情失败');
  }
};

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除管理员"${row.realName}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await request({
        url: `/admins/${row.id}`,
        method: 'delete'
      }) as ApiResponse<any>;

      if (res.code === 200) {
        ElMessage.success('删除成功');
        getAdminList();
      } else {
        ElMessage.error(res.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {});
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const data: any = { ...formData.value };
      
      // 编辑时如果不传密码，删除 password 字段
      if (isEdit.value && !data.password) {
        delete data.password;
      }

      const res = await request({
        url: isEdit.value ? `/admins/${data.id}` : '/admins',
        method: isEdit.value ? 'put' : 'post',
        data
      }) as ApiResponse<any>;

      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '修改成功' : '添加成功');
        dialogVisible.value = false;
        getAdminList();
      } else {
        ElMessage.error(res.message || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      ElMessage.error('操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields();
  formData.value = {
    id: null,
    username: '',
    password: '',
    realName: '',
    roleId: null,
    storeId: null,
    phone: '',
    email: ''
  };
};

// 分页变化
const handleSizeChange = () => {
  getAdminList();
};

const handlePageChange = () => {
  getAdminList();
};

// 加载角色和门店选项（实际项目中应该调用接口获取）
const loadOptions = () => {
  // TODO: 调用角色和门店接口
  roleOptions.value = [
    { id: 1, name: '超级管理员' },
    { id: 2, name: '普通管理员' }
  ];
  storeOptions.value = [
    { id: 1, name: '朝阳店' },
    { id: 2, name: '海淀店' }
  ];
};

onMounted(() => {
  getAdminList();
  loadOptions();
});
</script>

<style scoped>
.admin-manage-container {
  padding: 1.5rem;
  background: #f5f7fa;
  min-height: calc(100vh - 70px);
}

.search-card {
  margin-bottom: 1.5rem;
  border-radius: 12px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-card {
  border-radius: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ebeef5;
}

:deep(.el-dialog__header) {
  padding: 1.5rem;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #ebeef5;
}

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-button--small) {
  padding: 5px 10px;
}
</style>