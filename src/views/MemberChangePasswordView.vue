<template>
  <div class="change-password-container">
    <div class="password-card">
      <div class="card-header">
        <div class="icon-wrapper">
          <el-icon :size="48"><Lock /></el-icon>
        </div>
        <h2>修改初始密码</h2>
        <p class="subtitle">为了您的账号安全，请修改初始密码</p>
      </div>

      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        label-position="top"
        class="password-form"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            placeholder="请输入新密码（至少6位）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="loading"
          class="submit-btn"
        >
          确认修改
        </el-button>
      </el-form>

      <div class="tips">
        <el-alert
          title="密码安全提示"
          type="warning"
          :closable="false"
          show-icon
        >
          <ul>
            <li>密码长度不能少于 6 位</li>
            <li>建议使用字母、数字组合</li>
            <li>修改成功后将自动跳转到登录页面</li>
          </ul>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { getMemberLastPassword } from '@/utils/authSession'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const form = ref({
  newPassword: '',
  confirmPassword: ''
})

// 🔧 页面加载时自动填充旧密码
onMounted(() => {
  const lastPassword = getMemberLastPassword()
  if (lastPassword) {
    console.log('🔑 自动填充旧密码:', '*'.repeat(lastPassword.length))
  }
})

const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== form.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      // 🔧 从 sessionStorage 获取登录时保存的密码
      const lastPassword = getMemberLastPassword() || ''
      
      const requestData = {
        oldPassword: lastPassword,  // 使用登录时的密码
        newPassword: form.value.newPassword
      }
      
      console.log('📝 ========== 开始修改密码 ==========')
      console.log('完整请求URL:', '/api' + '/member/security/password')
      console.log('请求方法: PUT')
      console.log('用户ID:', userStore.userId)
      console.log('用户账号:', userStore.name)
      console.log('新密码:', form.value.newPassword)
      console.log('新密码长度:', form.value.newPassword.length)
      console.log('旧密码:', '*'.repeat(lastPassword.length))
      console.log('发送给后端的请求数据:', requestData)
      console.log('注意：使用 PUT /member/security/password 接口')
      console.log('注意：自动使用登录时的密码作为旧密码')
      console.log('=========================================')
      
      const response: any = await request({
        url: '/member/security/password',  // 使用正确的会员修改密码接口
        method: 'put',
        data: requestData
      })
      
      console.log('后端返回的响应:', response)
      console.log('响应类型:', typeof response)
      console.log('响应值:', response)
      console.log('响应是否为字符串:', typeof response === 'string')
      console.log('响应是否为空:', !response || response === '' || response === '""')
      
      // 🔧 修复：后端返回的是字符串而不是对象
      // 如果没有抛出异常，说明请求成功（HTTP 200）
      const isSuccess = !response || 
                        typeof response === 'string' || 
                        response === true ||
                        (response && (response.code === 200 || response.code === 0 || response.success === true))
      
      if (isSuccess) {
        console.log('✅ 密码修改成功')
        console.log('后端返回的原始值:', response)
        ElMessage.success('密码修改成功，即将跳转到登录页面')
        
        // 保存账号信息（在清除登录状态之前）
        const accountName = userStore.name
        
        // 清除登录状态
        userStore.logout('MEMBER')
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 跳转到登录页，并自动填充账号
          router.push({
            path: '/login',
            query: { 
              account: accountName || '',
              passwordChanged: '1'
            }
          })
        }, 1500)
      } else {
        // 🔧 修改失败，不跳转
        console.error('❌ 密码修改失败，后端返回:', response)
        ElMessage.error(response?.message || '密码修改失败，请重试')
      }
    } catch (error: any) {
      console.error('❌ ========== 密码修改失败 ==========')
      console.error('错误信息:', error.message)
      console.error('错误详情:', error.response?.data)
      console.error('HTTP状态码:', error.response?.status)
      console.error('=========================================')
      ElMessage.error(error.message || '密码修改失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.change-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.password-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.password-form {
  margin-bottom: 24px;
}

.password-form .el-form-item {
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.tips {
  margin-top: 24px;
}

.tips ul {
  margin: 8px 0 0;
  padding-left: 20px;
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}

.tips li {
  margin-bottom: 4px;
}
</style>
