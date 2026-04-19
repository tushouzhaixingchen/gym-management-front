<template>
  <div class="member-announcements">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>📢 公告列表</h2>
      <el-button @click="handleBack">
        <el-icon><Back /></el-icon>
        返回首页
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入公告标题或内容关键字"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="门店">
          <el-select
            v-model="searchForm.storeId"
            placeholder="请选择门店"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="store in storeList"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择优先级"
            clearable
            @change="handleSearch"
          >
            <el-option label="普通" :value="1" />
            <el-option label="重要" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="过期状态">
          <el-select
            v-model="searchForm.expiredStatus"
            placeholder="请选择过期状态"
            @change="handleSearch"
          >
            <el-option label="未过期" :value="0" />
            <el-option label="已过期" :value="1" />
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

    <!-- 公告列表 -->
    <el-card class="announcement-list" shadow="hover">
      <el-empty v-if="announcementList.length === 0 && !loading" description="暂无公告" />
      
      <div v-else class="list-container">
        <el-card
          v-for="item in announcementList"
          :key="item.id"
          class="announcement-item"
          :class="{ 'announcement-expired': isExpired(item) }"
          shadow="hover"
          @click="handleViewDetail(item)"
        >
          <div class="announcement-header">
            <div class="announcement-title-section">
              <el-tag :type="getPriorityType(item.priority)" size="small">
                {{ getPriorityText(item.priority) }}
              </el-tag>
              <el-tag 
                v-if="isExpired(item)" 
                type="info" 
                size="small"
                class="expired-tag"
              >
                已过期
              </el-tag>
              <h3 class="announcement-title">{{ item.title }}</h3>
            </div>
            <el-tag :type="getStatusType(item)">
              {{ getStatusText(item) }}
            </el-tag>
          </div>
          
          <div class="announcement-content">
            <p class="content-preview">{{ item.content ? item.content.substring(0, 150) + '...' : '暂无内容' }}</p>
          </div>
          
          <div class="announcement-footer">
            <div class="meta-info">
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                发布时间：{{ formatDate(item.publishTime || item.createdAt) }}
              </span>
              <span class="meta-item" v-if="item.expireTime">
                <el-icon><Calendar /></el-icon>
                过期时间：{{ formatDate(item.expireTime) }}
                <span v-if="isExpired(item)" class="expired-text">（已过期）</span>
              </span>
              <span class="meta-item" v-if="item.storeName">
                <el-icon><Location /></el-icon>
                门店：{{ item.storeName }}
              </span>
            </div>
            <el-button type="primary" text>
              查看详情 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 公告详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentAnnouncement?.title || '公告详情'"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentAnnouncement" class="detail-container">
        <div class="detail-header">
          <div class="header-tags">
            <el-tag :type="getPriorityType(currentAnnouncement.priority)">
              {{ getPriorityText(currentAnnouncement.priority) }}
            </el-tag>
            <el-tag :type="currentAnnouncement.publishStatus === 1 ? 'success' : 'info'">
              {{ currentAnnouncement.publishStatus === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </div>
          <div class="header-meta">
            <span>发布时间：{{ formatFullDate(currentAnnouncement.publishTime || currentAnnouncement.createdAt) }}</span>
            <span v-if="currentAnnouncement.expireTime">
              | 过期时间：{{ formatFullDate(currentAnnouncement.expireTime) }}
            </span>
            <span v-if="currentAnnouncement.storeName">
              | 门店：{{ currentAnnouncement.storeName }}
            </span>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-content" v-html="formatContent(currentAnnouncement.content)"></div>
        
        <el-divider />
        
        <div class="detail-footer">
          <p class="remark" v-if="currentAnnouncement.remark">
            <strong>备注：</strong>{{ currentAnnouncement.remark }}
          </p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back, Clock, Calendar, Location, ArrowRight, Search, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

// 搜索表单
const searchForm = ref({
  keyword: '',
  storeId: undefined as number | undefined,
  priority: undefined as number | undefined,
  expiredStatus: 0 as number  // 默认显示未过期
})

// 门店列表
const storeList = ref<any[]>([])

// 公告列表数据
const announcementList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 详情对话框
const detailVisible = ref(false)
const currentAnnouncement = ref<any>(null)

// 获取门店列表
const loadStores = async () => {
  try {
    const res = await request({
      url: '/stores',
      method: 'get'
    })
    
    // 简化日志：只显示关键信息
    console.log('🏪 门店列表响应:', res)
    
    let dataList = []
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
    if (dataList.length > 0) {
      console.log('🏪 第一个门店:', dataList[0])
    }
    
    storeList.value = dataList
  } catch (error) {
    console.error('❌ 加载门店列表失败:', error)
  }
}

// 判断公告是否过期
const isExpired = (item: any) => {
  // 优先使用后端返回的 isExpired 字段
  if (item.isExpired !== undefined) {
    return item.isExpired
  }
  
  // 如果后端没有返回，则前端计算
  if (!item.expireTime) return false
  
  const expireTime = new Date(item.expireTime).getTime()
  const now = new Date().getTime()
  return expireTime < now
}

// 获取状态类型
const getStatusType = (item: any) => {
  if (isExpired(item)) return 'info'
  return item.publishStatus === 1 ? 'success' : 'info'
}

// 获取状态文本
const getStatusText = (item: any) => {
  if (isExpired(item)) return '已过期'
  return item.publishStatus === 1 ? '已发布' : '草稿'
}

// 获取公告列表
const loadAnnouncements = async () => {
  loading.value = true
  try {
    console.log('📢 ========== 请求参数 ==========')
    console.log('搜索条件:', searchForm.value)
    console.log('分页:', { page: currentPage.value, size: pageSize.value })
    
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 只有当有值时才添加参数
    if (searchForm.value.keyword && searchForm.value.keyword.trim()) {
      params.keyword = searchForm.value.keyword.trim()
    }
    if (searchForm.value.storeId !== undefined && searchForm.value.storeId !== null) {
      params.storeId = searchForm.value.storeId
    }
    if (searchForm.value.priority !== undefined && searchForm.value.priority !== null) {
      params.priority = searchForm.value.priority
    }
    
    console.log('发送给后端的参数:', params)
    
    const res = await request({
      url: '/member/announcements',
      method: 'get',
      params: params
    })
    
    console.log('📥 ========== 响应数据 ==========')
    console.log('完整响应:', res)
    
    // 解析数据
    let dataList = []
    let totalCount = 0
    
    if (Array.isArray(res)) {
      console.log('数据格式: 直接数组')
      dataList = res
      totalCount = res.length
    } else if (res && typeof res === 'object') {
      const resData = res as any
      console.log('响应 code:', resData.code)
      
      if (resData.code === 200) {
        const data = resData.data
        console.log('data 类型:', typeof data)
        console.log('data 内容:', data)
        
        if (Array.isArray(data)) {
          console.log('数据格式: data 是数组')
          dataList = data
          totalCount = data.length
        } else if (data && typeof data === 'object') {
          console.log('数据格式: data 是对象')
          console.log('data 的键:', Object.keys(data))
          
          if (Array.isArray(data.records)) {
            dataList = data.records
            totalCount = data.total || data.records.length
          } else if (Array.isArray(data.list)) {
            dataList = data.list
            totalCount = data.total || data.list.length
          } else if (Array.isArray(data.items)) {
            dataList = data.items
            totalCount = data.total || data.items.length
          }
        }
      } else {
        ElMessage.warning(resData.message || '加载失败')
      }
    }
    
    console.log('解析后的数据:', dataList)
    console.log('数据数量:', dataList.length, '总数:', totalCount)
    
    // 如果后端没有正确过滤，前端进行过滤
    let filteredData = dataList
    
    if (searchForm.value.storeId !== undefined && searchForm.value.storeId !== null) {
      console.log(`🔍 前端过滤门店ID: ${searchForm.value.storeId}`)
      filteredData = filteredData.filter((item: any) => item.storeId === searchForm.value.storeId)
      console.log(`过滤后数量: ${filteredData.length} (原始: ${dataList.length})`)
    }
    
    if (searchForm.value.keyword && searchForm.value.keyword.trim()) {
      const keyword = searchForm.value.keyword.trim().toLowerCase()
      console.log(`🔍 前端过滤关键字: ${keyword}`)
      filteredData = filteredData.filter((item: any) => 
        (item.title && item.title.toLowerCase().includes(keyword)) ||
        (item.content && item.content.toLowerCase().includes(keyword))
      )
      console.log(`过滤后数量: ${filteredData.length}`)
    }
    
    if (searchForm.value.priority !== undefined && searchForm.value.priority !== null) {
      console.log(`🔍 前端过滤优先级: ${searchForm.value.priority}`)
      filteredData = filteredData.filter((item: any) => item.priority === searchForm.value.priority)
      console.log(`过滤后数量: ${filteredData.length}`)
    }
    
    // 过滤过期状态
    console.log(`🔍 过滤过期状态: ${searchForm.value.expiredStatus === 0 ? '未过期' : '已过期'}`)
    filteredData = filteredData.filter((item: any) => {
      const expired = isExpired(item)
      return searchForm.value.expiredStatus === 0 ? !expired : expired
    })
    console.log(`过滤后数量: ${filteredData.length}`)
    
    if (dataList.length > 0) {
      console.log('第一条数据:', dataList[0])
      console.log('========== 数据中的门店信息 ==========')
      dataList.forEach((item: any, index: number) => {
        console.log(`数据[${index}] - id:${item.id}, storeId:${item.storeId}, storeName:${item.storeName}, title:${item.title}`)
      })
      console.log('=========================================')
      
      if (filteredData.length > 0) {
        console.log('第一条过滤后数据:', filteredData[0])
      }
    }
    
    announcementList.value = filteredData
    total.value = filteredData.length
    
    console.log('==============================')
    
  } catch (error: any) {
    console.error('❌ 加载失败:', error.message)
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  console.log('🔍 搜索条件:', searchForm.value)
  currentPage.value = 1
  loadAnnouncements()
}

// 重置
const handleReset = () => {
  console.log('🔄 重置搜索条件')
  searchForm.value = {
    keyword: '',
    storeId: undefined,
    priority: undefined,
    expiredStatus: 0  // 重置后默认显示未过期
  }
  currentPage.value = 1
  loadAnnouncements()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  console.log('📄 分页大小改变:', size)
  pageSize.value = size
  currentPage.value = 1
  loadAnnouncements()
}

// 页码改变
const handlePageChange = (page: number) => {
  console.log('📄 页码改变:', page)
  currentPage.value = page
  loadAnnouncements()
}

// 查看公告详情
const handleViewDetail = async (item: any) => {
  console.log('📄 查看公告详情，ID:', item.id)
  
  try {
    const res = await request({
      url: `/member/announcements/${item.id}`,  // ✅ 使用会员端接口
      method: 'get'
    })
    
    console.log('📥 公告详情响应:', res)
    
    // 解析数据
    let detailData = item
    if (res && typeof res === 'object') {
      const resData = res as any
      if (resData.code === 200 && resData.data) {
        detailData = resData.data
      } else if (Array.isArray(res)) {
        detailData = res[0]
      }
    }
    
    currentAnnouncement.value = detailData
    detailVisible.value = true
    
  } catch (error: any) {
    console.error('❌ 加载公告详情失败:', error)
    currentAnnouncement.value = item
    detailVisible.value = true
  }
}

// 返回首页
const handleBack = () => {
  router.push('/member/home')
}

// 工具函数
const getPriorityText = (priority: number) => {
  const texts: Record<number, string> = {
    1: '普通',
    2: '重要',
    3: '紧急'
  }
  return texts[priority] || '普通'
}

const getPriorityType = (priority: number) => {
  const types: Record<number, string> = {
    1: 'info',
    2: 'warning',
    3: 'danger'
  }
  return types[priority] || 'info'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content: string) => {
  if (!content) return '暂无内容'
  return content.replace(/\n/g, '<br>')
}

// 页面加载时获取数据
onMounted(() => {
  loadStores()
  loadAnnouncements()
})
</script>

<style scoped>
.member-announcements {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.search-form .el-input {
  width: 250px;
}

.search-form .el-select {
  width: 180px;
}

.announcement-list {
  min-height: 400px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.announcement-item {
  cursor: pointer;
  transition: all 0.3s;
}

.announcement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 已过期公告样式 */
.announcement-expired {
  opacity: 0.6;
  background-color: #f5f5f5 !important;
}

.announcement-expired:hover {
  opacity: 0.7;
  transform: none;
}

.expired-tag {
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.expired-text {
  color: #f56c6c;
  font-weight: bold;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.announcement-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.announcement-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.announcement-content {
  margin-bottom: 12px;
}

.content-preview {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

/* 详情对话框样式 */
.detail-container {
  padding: 0 10px;
}

.detail-header {
  margin-bottom: 16px;
}

.header-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.header-meta {
  color: #909399;
  font-size: 14px;
  line-height: 1.8;
}

.detail-content {
  min-height: 200px;
  padding: 20px 0;
  color: #606266;
  line-height: 1.8;
  font-size: 15px;
  white-space: pre-wrap;
}

.detail-footer {
  margin-top: 16px;
}

.remark {
  color: #909399;
  font-size: 14px;
  margin: 0;
}
</style>
