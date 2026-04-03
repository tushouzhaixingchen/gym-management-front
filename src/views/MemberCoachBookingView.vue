<template>
  <div class="member-coach-booking">
    <el-card class="booking-card">
      <template #header>
        <div class="card-header">
          <h3>预约教练</h3>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="教练姓名">
          <el-input
            v-model="searchForm.coachName"
            placeholder="请输入教练姓名"
            clearable
            @keyup.enter="loadCoaches"
          />
        </el-form-item>
        <el-form-item label="门店">
          <el-select
            v-model="searchForm.storeId"
            placeholder="选择门店"
            clearable
            style="width: 150px"
            @change="loadCoaches"
          >
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCoaches" icon="Search">搜索</el-button>
          <el-button @click="handleReset" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 教练列表 -->
      <div class="coach-list" v-loading="loading">
        <el-card
          v-for="coach in coachList"
          :key="coach.id"
          class="coach-card"
          shadow="hover"
          @click="handleSelectCoach(coach)"
        >
          <div class="coach-info">
            <div class="coach-avatar">
              <el-avatar :size="80" :src="coach.avatar || defaultAvatar">
                <el-icon :size="40"><User /></el-icon>
              </el-avatar>
            </div>
            <div class="coach-detail">
              <h4>{{ coach.realName }}</h4>
              <p class="coach-title">{{ coach.title || '资深教练' }}</p>
              <p class="coach-specialty">{{ coach.specialty || '擅长：增肌训练、减脂塑形' }}</p>
              <div class="coach-meta">
                <el-tag size="small" type="success">
                  {{ coach.experience ? coach.experience + '年经验' : '5 年经验' }}
                </el-tag>
                <span class="coach-price">
                  ¥{{ coach.price || '200' }}/小时
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <el-empty v-if="!loading && coachList.length === 0" description="暂无教练信息" />
    </el-card>

    <!-- 预约对话框 -->
    <el-dialog
      v-model="bookingVisible"
      title="预约教练"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="bookingForm"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="选择教练">
          <div class="selected-coach" v-if="selectedCoach">
            <div class="coach-brief">
              <el-avatar :size="40" :src="selectedCoach.avatar || defaultAvatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="coach-brief-info">
                <strong>{{ selectedCoach.realName }}</strong>
                <p>{{ selectedCoach.title || '资深教练' }}</p>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="选择门店" prop="storeId">
          <el-select
            v-model="bookingForm.storeId"
            placeholder="请选择门店"
            style="width: 100%"
            @change="handleStoreChange"
          >
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择日期" prop="workDate">
          <el-date-picker
            v-model="bookingForm.workDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            style="width: 100%"
            @change="handleDateChange"
          />
        </el-form-item>

        <el-form-item label="选择时间段" prop="timeSlot" v-if="availableSlots.length > 0">
          <el-select
            v-model="bookingForm.timeSlot"
            placeholder="请选择时间段"
            style="width: 100%"
          >
            <el-option
              v-for="slot in availableSlots"
              :key="slot.value"
              :label="slot.label"
              :value="slot.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预约时长" prop="durationMinutes">
          <el-radio-group v-model="bookingForm.durationMinutes">
            <el-radio-button :label="30">30 分钟</el-radio-button>
            <el-radio-button :label="60">60 分钟</el-radio-button>
            <el-radio-button :label="90">90 分钟</el-radio-button>
            <el-radio-button :label="120">120 分钟</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="预约目的" prop="purpose">
          <el-select
            v-model="bookingForm.purpose"
            placeholder="请选择预约目的"
            style="width: 100%"
          >
            <el-option label="减脂" value="减脂" />
            <el-option label="增肌" value="增肌" />
            <el-option label="康复" value="康复" />
            <el-option label="体态矫正" value="体态矫正" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="bookingForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>

        <el-form-item label="费用说明">
          <div class="price-info">
            <p>课程单价：¥{{ selectedCoach?.price || '200' }}/小时</p>
            <p class="total-price">
              预计总费用：<strong>¥{{ calculatePrice }}</strong>
            </p>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="bookingVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBooking" icon="CircleCheck">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import { User } from '@element-plus/icons-vue';

// 默认头像
const defaultAvatar = '';

// 搜索表单
const searchForm = reactive({
  coachName: '',
  storeId: null as number | null,
});

// 教练列表
const coachList = ref<any[]>([]);
const loading = ref(false);

// 门店选项
const storeOptions = ref<any[]>([]);

// 预约对话框
const bookingVisible = ref(false);
const selectedCoach = ref<any>(null);
const formRef = ref();

// 预约表单
const bookingForm = reactive({
  storeId: null as number | null,
  coachId: null as number | null,
  workDate: '' as string,
  timeSlot: '' as string,
  durationMinutes: 60,
  purpose: '',
  remark: '',
});

// 可用时间段
const availableSlots = ref<any[]>([]);

// 表单验证规则
const formRules = reactive({
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  workDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请选择时间段', trigger: 'change' }],
  durationMinutes: [{ required: true, message: '请选择时长', trigger: 'change' }],
  purpose: [{ required: true, message: '请选择预约目的', trigger: 'change' }],
});

// 计算价格
const calculatePrice = computed(() => {
  const price = Number(selectedCoach.value?.price) || 200;
  const duration = bookingForm.durationMinutes;
  return (price * duration / 60).toFixed(2);
});

// 禁用过去的日期
const disabledDate = (date: Date) => {
  return date.getTime() < Date.now() - 86400000; // 不能选择昨天的日期
};

// 加载教练列表
const loadCoaches = async () => {
  loading.value = true;
  try {
    const params: any = { page: 1, size: 100 };
    if (searchForm.coachName) {
      params.realName = searchForm.coachName;
    }
    if (searchForm.storeId) {
      params.storeId = searchForm.storeId;
    }

    console.log('🔍 请求参数:', params);
    const res: any = await request.get('/member/appointments/coaches', { params });
    console.log('📦 教练列表 - 后端返回数据:', res);
    console.log('📦 res.data:', res.data);
    console.log('📦 Array.isArray(res):', Array.isArray(res));
    console.log('📦 Array.isArray(res.data):', Array.isArray(res.data));

    // 🔧 修改：后端直接返回数组，而不是 {code, message, data} 格式
    if (Array.isArray(res)) {
      console.log('✅ 后端直接返回数组，数据:', res);
      coachList.value = res;
    } else if (res && res.data) {
      if (Array.isArray(res.data.records)) {
        console.log('✅ 使用 records 格式，数据:', res.data.records);
        coachList.value = res.data.records;
      } else if (Array.isArray(res.data.list)) {
        console.log('✅ 使用 list 格式，数据:', res.data.list);
        coachList.value = res.data.list;
      } else if (Array.isArray(res.data)) {
        console.log('✅ 使用直接数组格式，数据:', res.data);
        coachList.value = res.data;
      } else {
        console.warn('⚠️ 无法识别的数据格式');
        coachList.value = [];
      }
    } else {
      console.warn('⚠️ 没有返回数据');
      coachList.value = [];
    }
    
    console.log('📊 最终教练列表:', coachList.value);
  } catch (error: any) {
    console.error('❌ 加载教练列表失败:', error);
    ElMessage.error(error.message || '加载失败');
    coachList.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载门店列表
const loadStores = async () => {
  try {
    // 🔧 临时方案：使用模拟数据，因为后端接口返回 null
    // 实际项目中应该调用后端接口
    const mockStores = [
      { id: 1, name: '迈格健身 - 海淀店' },
      { id: 2, name: '迈格健身 - 朝阳店' },
      { id: 3, name: '迈格健身 - 昌平店' },
    ];
    
    console.log('🏪 使用模拟门店数据:', mockStores);
    storeOptions.value = mockStores;
    console.log('🏪 最终门店选项:', storeOptions.value);
    
    // 🔧 下面是原来的后端接口调用代码，暂时注释掉
    /*
    console.log('🏪 请求门店列表接口：/member/stores');
    const res: any = await request.get('/member/stores');
    console.log('🏪 门店列表 - 后端返回数据:', res);
    console.log('🏪 res.data:', res.data);
    console.log('🏪 Array.isArray(res.data):', Array.isArray(res.data));

    if (res && res.data) {
      if (Array.isArray(res.data.records)) {
        console.log('✅ 使用 records 格式，数据:', res.data.records);
        storeOptions.value = res.data.records;
      } else if (Array.isArray(res.data.list)) {
        console.log('✅ 使用 list 格式，数据:', res.data.list);
        storeOptions.value = res.data.list;
      } else if (Array.isArray(res.data)) {
        console.log('✅ 使用直接数组格式，数据:', res.data);
        storeOptions.value = res.data;
      } else {
        console.warn('⚠️ 无法识别的数据格式，res.data:', res.data);
        storeOptions.value = [];
      }
    } else {
      console.warn('⚠️ 后端没有返回数据');
      storeOptions.value = [];
    }
    
    console.log('🏪 最终门店选项:', storeOptions.value);
    */
  } catch (error: any) {
    console.error('❌ 加载门店列表失败:', error);
    console.error('❌ 错误信息:', error.message);
    
    // 如果出错，使用模拟数据
    const mockStores = [
      { id: 1, name: '迈格健身 - 海淀店' },
      { id: 2, name: '迈格健身 - 朝阳店' },
    ];
    console.log('⚠️ 接口失败，使用模拟数据:', mockStores);
    storeOptions.value = mockStores;
  }
};

// 重置搜索
const handleReset = () => {
  searchForm.coachName = '';
  searchForm.storeId = null;
  loadCoaches();
};

// 选择教练
const handleSelectCoach = (coach: any) => {
  selectedCoach.value = coach;
  bookingForm.coachId = coach.id;
  bookingForm.storeId = coach.storeId;
  bookingVisible.value = true;
};

// 门店变化
const handleStoreChange = () => {
  availableSlots.value = [];
  bookingForm.workDate = '';
  bookingForm.timeSlot = '';
};

// 日期变化 - 加载可用时间段
const handleDateChange = async () => {
  if (!bookingForm.coachId || !bookingForm.workDate) return;

  try {
    const dateStr = new Date(bookingForm.workDate).toISOString().split('T')[0];
    console.log('📅 请求日期:', dateStr);
    console.log('🏀 教练 ID:', bookingForm.coachId);
    
    // 🔧 临时方案：使用模拟数据，因为后端还没有实现这个接口
    // 实际项目中应该调用后端接口
    // const res: any = await request.get(`/member/coaches/${bookingForm.coachId}/schedules`, {
    //   params: { date: dateStr }
    // });
    
    // 模拟后端返回的数据格式
    const mockData = [
      { startTime: '09:00:00', endTime: '10:00:00' },
      { startTime: '10:00:00', endTime: '11:00:00' },
      { startTime: '14:00:00', endTime: '15:00:00' },
      { startTime: '15:00:00', endTime: '16:00:00' },
      { startTime: '16:00:00', endTime: '17:00:00' },
    ];
    
    console.log('📦 使用模拟数据:', mockData);

    if (mockData && Array.isArray(mockData)) {
      availableSlots.value = mockData.map((slot: any) => ({
        label: slot.label || `${slot.startTime} - ${slot.endTime}`,
        value: slot.value || slot.startTime,
      }));
      console.log('✅ 可用时间段:', availableSlots.value);
    } else {
      console.warn('⚠️ 后端没有返回时间段数据或数据格式不正确');
      availableSlots.value = [];
      ElMessage.warning('该日期暂无可用时间段');
    }
  } catch (error: any) {
    console.error('❌ 加载时间段失败:', error);
    availableSlots.value = [];
    ElMessage.error('加载时间段失败：' + (error.message || '未知错误'));
  }
};

// 提交预约
const submitBooking = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (!bookingForm.timeSlot) {
        ElMessage.warning('请选择时间段');
        return;
      }

      // 🔧 修改：构建符合后端要求的预约数据
      // 解析时间段，例如 "14:00:00"
      const startTime = bookingForm.timeSlot.includes(':') 
        ? bookingForm.timeSlot 
        : `${bookingForm.timeSlot}:00`;
      
      // 计算结束时间
      const endTime = calculateEndTime(bookingForm.workDate, startTime, bookingForm.durationMinutes).split(' ')[1];

      const bookingData = {
        coachId: bookingForm.coachId,
        storeId: bookingForm.storeId,
        date: bookingForm.workDate,
        startTime: startTime,
        endTime: endTime,
        note: bookingForm.remark || undefined,
      };

      console.log('📤 提交预约数据:', bookingData);

      await request.post('/member/appointments', bookingData);
      
      ElMessage.success('预约成功！请等待管理员确认');
      bookingVisible.value = false;
      handleDialogClose();
    } catch (error: any) {
      console.error('❌ 预约失败:', error);
      ElMessage.error(error.message || '预约失败，请稍后重试');
    }
  });
};

// 计算结束时间
const calculateEndTime = (date: string, startTime: string, duration: number) => {
  const startDateTime = new Date(`${date}T${startTime}`);
  startDateTime.setMinutes(startDateTime.getMinutes() + duration);
  
  const year = startDateTime.getFullYear();
  const month = String(startDateTime.getMonth() + 1).padStart(2, '0');
  const day = String(startDateTime.getDate()).padStart(2, '0');
  const hours = String(startDateTime.getHours()).padStart(2, '0');
  const minutes = String(startDateTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
};

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields();
  selectedCoach.value = null;
  bookingForm.storeId = null;
  bookingForm.coachId = null;
  bookingForm.workDate = '';
  bookingForm.timeSlot = '';
  bookingForm.durationMinutes = 60;
  bookingForm.purpose = '';
  bookingForm.remark = '';
  availableSlots.value = [];
};

onMounted(() => {
  loadCoaches();
  loadStores();
});
</script>

<style scoped>
.member-coach-booking {
  padding: 20px;
}

.booking-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.coach-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.coach-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.coach-card:hover {
  transform: translateY(-5px);
}

.coach-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.coach-detail h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.coach-title {
  margin: 5px 0;
  color: #909399;
  font-size: 14px;
}

.coach-specialty {
  margin: 5px 0;
  color: #606266;
  font-size: 13px;
}

.coach-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.coach-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.selected-coach {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.coach-brief {
  display: flex;
  align-items: center;
  gap: 15px;
}

.coach-brief-info strong {
  display: block;
  color: #303133;
}

.coach-brief-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 13px;
}

.price-info {
  padding: 15px;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.price-info p {
  margin: 5px 0;
  color: #606266;
}

.total-price {
  margin-top: 10px !important;
  font-size: 16px;
  color: #f56c6c !important;
}

.total-price strong {
  font-size: 20px;
}
</style>