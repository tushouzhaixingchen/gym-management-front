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
                  ¥{{ coach.hourlyRate || coach.price || 0 }}/小时
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
        :model="formData"
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
            v-model="formData.storeId"
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
            v-model="formData.workDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            style="width: 100%"
            @change="handleDateChange"
          />
        </el-form-item>

        <el-form-item label="选择时间段" prop="timeSlot" v-if="availableSlots.length > 0">
          <el-select
            v-model="formData.timeSlot"
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

        <el-form-item label="预约时长" prop="duration">
          <el-radio-group v-model="formData.duration">
            <el-radio-button :value="30">30 分钟</el-radio-button>
            <el-radio-button :value="60">60 分钟</el-radio-button>
            <el-radio-button :value="90">90 分钟</el-radio-button>
            <el-radio-button :value="120">120 分钟</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="预约目的" prop="purpose">
          <el-select
            v-model="formData.purpose"
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
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>

        <el-form-item label="费用说明">
          <div class="price-info">
            <p>课程单价：¥{{ getCoachHourlyRate() }}/小时</p>
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
const formData = reactive({
  storeId: null as number | null,
  coachId: null as number | null,
  workDate: '' as string,
  timeSlot: '' as string,
  duration: 60,
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
  duration: [{ required: true, message: '请选择时长', trigger: 'change' }],
  purpose: [{ required: true, message: '请选择预约目的', trigger: 'change' }],
});

// 获取教练的每小时费用
const getCoachHourlyRate = () => {
  if (!selectedCoach.value) return '0';
  // 优先使用 hourlyRate，其次使用 price，最后默认为 0
  return selectedCoach.value.hourlyRate || selectedCoach.value.price || 0;
};

// 计算价格
const calculatePrice = computed(() => {
  const hourlyRate = Number(getCoachHourlyRate()) || 0;
  const duration = formData.duration;
  // 计算总费用：每小时费用 × (时长分钟数 / 60)
  return (hourlyRate * duration / 60).toFixed(2);
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

    console.log('🔍 ============ 搜索教练 ============');
    console.log('🔍 搜索表单数据:', searchForm);
    console.log('🔍 请求参数:', params);
    console.log('🔍 接口路径: GET /member/appointments/coaches');
    
    const res: any = await request.get('/member/appointments/coaches', { params });
    console.log('📦 后端返回数据:', res);
    console.log('📦 Array.isArray(res):', Array.isArray(res));
    
    // 处理响应数据
    let allCoaches: any[] = [];
    if (Array.isArray(res)) {
      console.log('✅ 后端直接返回数组');
      allCoaches = res;
    } else if (res && res.data) {
      if (Array.isArray(res.data.records)) {
        allCoaches = res.data.records;
      } else if (Array.isArray(res.data.list)) {
        allCoaches = res.data.list;
      } else if (Array.isArray(res.data)) {
        allCoaches = res.data;
      } else {
        console.warn('⚠️ 无法识别的数据格式');
        allCoaches = [];
      }
    } else {
      allCoaches = [];
    }
    
    // 🔧 前端过滤：如果后端没有实现过滤，则在前端进行过滤
    let filteredCoaches = allCoaches;
    
    if (searchForm.storeId) {
      console.log('🔍 前端过滤门店 ID:', searchForm.storeId);
      filteredCoaches = filteredCoaches.filter(coach => coach.storeId === searchForm.storeId);
      console.log('🔍 过滤后教练数量:', filteredCoaches.length);
    }
    
    if (searchForm.coachName) {
      console.log('🔍 前端过滤教练姓名:', searchForm.coachName);
      filteredCoaches = filteredCoaches.filter(coach => 
        coach.realName && coach.realName.includes(searchForm.coachName)
      );
      console.log('🔍 过滤后教练数量:', filteredCoaches.length);
    }
    
    coachList.value = filteredCoaches;
    
    console.log('✅ 最终教练列表数量:', coachList.value.length);
    console.log('✅ 教练列表数据:', coachList.value);
    console.log('🔍 ==========================================');
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
    console.log('🏪 ============ 开始加载门店列表 ============');
    console.log('🏪 请求接口：GET /stores');
    
    const res: any = await request.get('/stores');
    console.log('🏪 后端返回的原始数据:', res);
    console.log('🏪 res.code:', res?.code);
    console.log('🏪 res.data:', res?.data);
    console.log('🏪 res.data.list:', res?.data?.list);
    
    // 后端返回格式: {code: 200, message: "操作成功", data: {list: [...]}}
    if (res && res.code === 200 && res.data && Array.isArray(res.data.list)) {
      console.log('✅ 使用 data.list 格式');
      console.log('✅ 门店数量:', res.data.list.length);
      console.log('✅ 门店数据:', res.data.list);
      
      // 转换为前端需要的格式 {id, name}
      storeOptions.value = res.data.list.map((store: any) => ({
        id: store.id,
        name: store.storeName || store.name
      }));
      
      console.log('✅ 转换后的门店选项:', storeOptions.value);
    } else if (Array.isArray(res)) {
      console.log('✅ 后端直接返回数组');
      storeOptions.value = res;
    } else {
      console.warn('⚠️ 无法识别的数据格式');
      console.warn('⚠️ res 内容:', res);
      storeOptions.value = [];
    }
    
    console.log('🏪 最终门店选项数量:', storeOptions.value.length);
    console.log('🏪 最终门店选项数据:', storeOptions.value);
    console.log('🏪 ==========================================');
    
    if (storeOptions.value.length === 0) {
      ElMessage.warning('未找到门店数据');
    }
  } catch (error: any) {
    console.error('❌ 加载门店列表失败:', error);
    console.error('❌ 错误信息:', error.message);
    console.error('❌ 错误响应:', error.response?.data);
    storeOptions.value = [];
    ElMessage.error('加载门店列表失败');
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
  console.log('📌 选择教练:', coach);
  console.log('📌 教练课时费字段 - hourlyRate:', coach.hourlyRate, 'price:', coach.price);
  selectedCoach.value = coach;
  formData.coachId = coach.id;
  formData.storeId = coach.storeId;
  bookingVisible.value = true;
};

// 门店变化
const handleStoreChange = () => {
  availableSlots.value = [];
  formData.workDate = '';
  formData.timeSlot = '';
};

// 日期变化 - 加载可用时间段
const handleDateChange = async () => {
  if (!formData.coachId || !formData.workDate) return;

  try {
    const dateStr = new Date(formData.workDate).toISOString().split('T')[0];
    console.log('📅 请求日期:', dateStr);
    console.log('🏀 教练 ID:', formData.coachId);
    
    // 🔧 临时方案：使用模拟数据，因为后端还没有实现这个接口
    // 实际项目中应该调用后端接口
    // const res: any = await request.get(`/member/coaches/${formData.coachId}/schedules`, {
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

  console.log('🚀 ==================== 开始提交预约 ====================');
  console.log('📋 当前表单数据:', JSON.parse(JSON.stringify(formData)));
  console.log('👤 选中的教练:', selectedCoach.value);

  await formRef.value.validate(async (valid: boolean) => {
    console.log('✅ 表单验证结果:', valid);
    if (!valid) {
      console.error('❌ 表单验证失败，终止提交');
      ElMessage.warning('请检查表单填写是否完整');
      return;
    }

    try {
      if (!formData.timeSlot) {
        console.error('❌ 未选择时间段');
        ElMessage.warning('请选择时间段');
        return;
      }

      console.log('⏰ 选择的原始时间段:', formData.timeSlot);
      console.log('📅 选择的日期 (原始):', formData.workDate);
      console.log('📅 选择的日期类型:', typeof formData.workDate);
      
      // 🔧 修复：将 Date 对象转换为 yyyy-MM-dd 格式的字符串
      let workDateStr = '';
      if (formData.workDate && (formData.workDate as unknown) instanceof Date) {
        const dateObj = formData.workDate as unknown as Date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        workDateStr = `${year}-${month}-${day}`;
      } else if (typeof formData.workDate === 'string') {
        // 如果已经是字符串，直接使用
        workDateStr = formData.workDate;
      } else {
        console.error('❌ 日期格式不正确:', formData.workDate);
        ElMessage.error('日期格式不正确，请重新选择日期');
        return;
      }
      
      console.log('📅 格式化后的日期:', workDateStr);
      console.log('⏱️ 预约时长:', formData.duration, '分钟');

      // 🔧 修改：构建符合后端要求的预约数据
      // 解析时间段，例如 "14:00:00"
      const startTime = formData.timeSlot.includes(':') 
        ? formData.timeSlot 
        : `${formData.timeSlot}:00`;
      
      console.log('⏰ 格式化后的开始时间:', startTime);
      
      // 计算结束时间
      const fullEndTime = calculateEndTime(workDateStr, startTime, formData.duration);
      const endTime = fullEndTime.split(' ')[1]; // 提取时间部分 HH:mm:ss
      
      console.log('⏰ 计算出的完整结束时间:', fullEndTime);
      console.log('⏰ 提取的结束时间 (endTime):', endTime);

      // 构建完整的日期时间字符串 (yyyy-MM-dd HH:mm:ss)
      const timeSlotStart = `${workDateStr} ${startTime}`;
      const timeSlotEnd = fullEndTime;

      console.log('📊 完整的开始时间 (timeSlotStart):', timeSlotStart);
      console.log('📊 完整的结束时间 (timeSlotEnd):', timeSlotEnd);

      // 计算预约价格
      const hourlyRate = Number(getCoachHourlyRate()) || 0;
      const totalPrice = hourlyRate * formData.duration / 60;
      
      console.log('💰 每小时费用:', hourlyRate);
      console.log('💰 计算出的总价格:', totalPrice);

      // 🔧 按照后端实际接口要求构建请求数据（根据 Postman 测试成功的格式）
      const bookingData = {
        coachId: formData.coachId,
        storeId: formData.storeId,
        date: workDateStr,                    // 日期：yyyy-MM-dd
        startTime: startTime,                 // 开始时间：HH:mm:ss
        endTime: endTime,                     // 结束时间：HH:mm:ss
        note: formData.remark || undefined,   // 备注
      };

      console.log('📦 ==================== 最终提交数据 ====================');
      console.log('📦 字段格式已根据 Postman 测试结果调整');
      console.log(JSON.stringify(bookingData, null, 2));
      console.log('📦 ========================================================');

      console.log('🌐 请求接口: POST /member/appointments');
      console.log('🔗 完整URL:', `${window.location.origin}/api/member/appointments`);
      
      // 在发送前再次验证数据
      console.log('🔍 数据验证:');
      console.log('  - coachId:', bookingData.coachId, typeof bookingData.coachId);
      console.log('  - storeId:', bookingData.storeId, typeof bookingData.storeId);
      console.log('  - date:', bookingData.date, typeof bookingData.date);
      console.log('  - startTime:', bookingData.startTime, typeof bookingData.startTime);
      console.log('  - endTime:', bookingData.endTime, typeof bookingData.endTime);
      console.log('  - note:', bookingData.note, typeof bookingData.note);
      
      // 检查是否有空值
      const emptyFields = [];
      if (!bookingData.coachId) emptyFields.push('coachId');
      if (!bookingData.storeId) emptyFields.push('storeId');
      if (!bookingData.date) emptyFields.push('date');
      if (!bookingData.startTime) emptyFields.push('startTime');
      if (!bookingData.endTime) emptyFields.push('endTime');
      
      if (emptyFields.length > 0) {
        console.error('❌ 以下字段为空:', emptyFields);
        ElMessage.error(`以下字段不能为空: ${emptyFields.join(', ')}`);
        return;
      }
      
      console.log('✅ 所有必填字段已填写');
      
      const response: any = await request.post('/member/appointments', bookingData);
      
      console.log('✅ 预约接口返回响应:', response);
      console.log('✅ 响应数据类型:', typeof response);
      console.log('✅ 响应数据完整内容:', JSON.stringify(response, null, 2));
      
      // 检查响应是否成功（兼容多种响应格式）
      // 后端可能返回：
      // 1. 标准格式：{code: 200, message: "...", data: {...}}
      // 2. 直接返回数据对象：{appointmentNo: "...", id: 5, ...}
      // 3. 包装在data中：{code: 200, data: {appointmentNo: "..."}}
      const isSuccess = response?.code === 200 || 
                       response?.success === true || 
                       response?.data?.code === 200 ||
                       response?.appointmentNo ||  // 直接返回预约对象
                       response?.id;               // 包含id字段
      
      if (isSuccess) {
        console.log('🎉 预约成功！');
        console.log('📋 预约单号:', response.appointmentNo || response.data?.appointmentNo);
        console.log('📋 预约ID:', response.id || response.data?.id);
        ElMessage.success('预约成功！请等待管理员确认');
        bookingVisible.value = false;
        handleDialogClose();
      } else {
        console.warn('⚠️ 预约失败:', response);
        // 显示后端返回的具体错误信息
        const errorMsg = response?.message || response?.data?.message || '预约失败，请稍后重试';
        ElMessage.warning(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ ==================== 预约失败 ====================');
      console.error('❌ 错误对象:', error);
      console.error('❌ 错误消息:', error.message);
      console.error('❌ 错误响应:', error.response);
      console.error('❌ 错误响应状态:', error.response?.status);
      console.error('❌ 错误响应数据:', error.response?.data);
      console.error('❌ ====================================================');
      
      // 显示更详细的错误信息
      const errorMsg = error.response?.data?.message || error.message || '预约失败，请稍后重试';
      ElMessage.error('预约失败：' + errorMsg);
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
  formData.storeId = null;
  formData.coachId = null;
  formData.workDate = '';
  formData.timeSlot = '';
  formData.duration = 60;
  formData.purpose = '';
  formData.remark = '';
  availableSlots.value = [];
};

onMounted(() => {
  // 先加载门店列表
  loadStores();
  // 再加载教练列表
  loadCoaches();
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