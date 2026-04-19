# 强制修改初始密码功能说明

## 功能概述

当会员用户使用初始密码登录时，系统会强制要求修改密码，确保账号安全。

## 业务流程

```
会员登录 
  ↓
检查 isInitialPassword 字段
  ↓
┌─────────────┬──────────────┐
│  isInitialPassword = 1   │ isInitialPassword = 2
│  (初始密码)              │ (已修改)
└─────────────┴──────────────┘
  ↓                           ↓
强制跳转修改密码页面        正常登录
  ↓
修改密码成功
  ↓
清除登录状态
  ↓
跳转登录页面（自动填充账号）
  ↓
用户使用新密码登录
  ↓
正常进入系统
```

## 实现细节

### 1. **登录逻辑修改**

**文件**: `src/views/LoginView.vue`

**修改内容**:
```typescript
// 从后端响应中提取 isInitialPassword 字段
const isInitialPassword = userInfo.isInitialPassword || data.isInitialPassword

// 根据字段值决定跳转逻辑
if (finalRole === 'MEMBER' && isInitialPassword === 1) {
  // 会员且是初始密码，强制跳转修改密码页面
  router.push('/member/change-password')
} else if (finalRole === 'ADMIN') {
  router.push('/admin/home')
} else {
  router.push('/member/home')
}
```

**判断规则**:
- `isInitialPassword === 1`: 初始密码，需要强制修改
- `isInitialPassword === 2`: 已修改过密码，正常登录
- 仅对会员角色（MEMBER）生效，管理员不受影响

### 2. **强制修改密码页面**

**文件**: `src/views/MemberChangePasswordView.vue`（新建）

**功能特性**:
- ✅ 简洁的UI设计，紫色渐变背景
- ✅ 只需要输入新密码和确认密码（不需要旧密码）
- ✅ 密码长度验证（至少6位）
- ✅ 两次密码一致性验证
- ✅ 修改成功后自动清除登录状态
- ✅ 1.5秒后跳转登录页面，自动填充账号
- ✅ 显示成功提示信息

**表单验证**:
```typescript
const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
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
```

**提交逻辑**:
```typescript
await request({
  url: '/members/changePassword',
  method: 'post',
  data: {
    userId: userStore.userId,
    oldPassword: '',  // 初始密码修改不需要旧密码
    newPassword: form.value.newPassword
  }
})

// 修改成功后
userStore.logout()  // 清除登录状态
router.push({
  path: '/login',
  query: { 
    account: accountName,  // 自动填充账号
    passwordChanged: '1'   // 标识密码已修改
  }
})
```

### 3. **登录页面自动填充**

**文件**: `src/views/LoginView.vue`

**功能**:
```typescript
onMounted(() => {
  const account = route.query.account as string
  const passwordChanged = route.query.passwordChanged as string
  
  // 自动填充账号
  if (account) {
    form.value.account = account
  }
  
  // 显示修改成功提示
  if (passwordChanged === '1') {
    ElMessage.success('密码修改成功，请使用新密码登录')
  }
})
```

### 4. **路由配置**

**文件**: `src/router/index.ts`

```typescript
{
  path: '/member/change-password',
  name: 'MemberChangePassword',
  component: () => import('@/views/MemberChangePasswordView.vue'),
  meta: { title: '修改密码', requiresAuth: false }
}
```

**注意**: `requiresAuth: false` 因为用户此时还没有完成完整的登录流程

## 接口说明

### 修改密码接口

**请求**:
```
POST /api/members/changePassword
Content-Type: application/json

{
  "userId": 123,
  "oldPassword": "",        // 初始密码修改时为空字符串
  "newPassword": "newPass123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

### 登录接口

**请求**:
```
POST /api/auth/login
Content-Type: application/json

{
  "account": "user123",
  "password": "123456"
}
```

**响应**（需要包含 `isInitialPassword` 字段）:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "xxx",
    "userInfo": {
      "id": 123,
      "account": "user123",
      "realName": "张三",
      "userType": "MEMBER",
      "isInitialPassword": 1,  // ← 关键字段
      "storeId": 2,
      "storeName": "迈格健身-海淀店"
    }
  }
}
```

**字段说明**:
- `isInitialPassword = 1`: 初始密码，需要修改
- `isInitialPassword = 2`: 已修改过密码

## 测试步骤

### 测试场景 1: 初始密码登录

1. **使用初始密码登录会员账号**
   - 账号: [member001](file://d:\WorkStation\gym-management\gym-management-front\src\views\MemberManageView.vue#L554-L554)
   - 密码: `123456`

2. **查看跳转**
   - ✅ 应该跳转到 `/member/change-password` 页面
   - ✅ 不应该进入会员中心

3. **修改密码**
   - 输入新密码（至少6位）
   - 确认密码
   - 点击"确认修改"

4. **查看结果**
   - ✅ 显示"密码修改成功，即将跳转到登录页面"
   - ✅ 自动跳转到登录页面
   - ✅ 账号字段自动填充
   - ✅ 显示"密码修改成功，请使用新密码登录"提示

5. **使用新密码登录**
   - ✅ 正常进入会员中心

### 测试场景 2: 已修改密码登录

1. **使用已修改的密码登录会员账号**
   - 账号: [member002](file://d:\WorkStation\gym-management\gym-management-front\src\views\MemberManageView.vue#L555-L555)
   - 密码: `newPass123`

2. **查看跳转**
   - ✅ 直接进入会员中心 `/member/home`
   - ✅ 不出现修改密码页面

### 测试场景 3: 管理员登录

1. **使用管理员账号登录**
   - 账号: `admin`
   - 密码: `admin123`

2. **查看跳转**
   - ✅ 直接进入管理后台 `/admin/home`
   - ✅ 不受 [isInitialPassword](file://d:\WorkStation\gym-management\gym-management-front\src\views\MemberManageView.vue#L451-L451) 影响

### 测试场景 4: 密码验证

1. **修改密码时不输入密码**
   - ✅ 提示"请输入新密码"

2. **密码少于6位**
   - ✅ 提示"密码长度不能少于6位"

3. **两次密码不一致**
   - ✅ 提示"两次输入的密码不一致"

## 控制台日志

### 登录时
```
🚀 开始登录...
  - 账号: member001
  - 密码: ******
📦 登录接口完整响应: {...}
  - isInitialPassword: 1
🎯 准备跳转，当前角色: MEMBER
🔐 是否需要修改初始密码: 1
  → 检测到初始密码，强制跳转到修改密码页面
```

### 修改密码时
```
📝 开始修改密码...
用户ID: 123
✅ 密码修改成功
```

### 登录页自动填充
```
📝 自动填充账号: member001
✅ 显示密码修改成功提示
```

## 注意事项

1. **后端支持**
   - 后端登录接口必须返回 [isInitialPassword](file://d:\WorkStation\gym-management\gym-management-front\src\views\MemberManageView.vue#L451-L451) 字段
   - 字段值: `1` = 初始密码, `2` = 已修改

2. **安全性**
   - 修改密码后立即清除所有登录状态
   - 必须重新登录才能进入系统
   - 防止用户跳过修改密码步骤

3. **用户体验**
   - 自动填充账号，减少用户操作
   - 清晰的成功提示
   - 1.5秒延迟跳转，让用户看到提示信息

4. **兼容性**
   - 仅对会员角色生效
   - 管理员不受影响
   - 兼容现有登录流程

## 文件清单

- ✅ `src/views/LoginView.vue` - 登录页面（已修改）
  - 添加 [isInitialPassword](file://d:\WorkStation\gym-management\gym-management-front\src\views\MemberManageView.vue#L451-L451) 字段检查
  - 添加自动填充账号功能
  - 添加成功提示

- ✅ `src/views/MemberChangePasswordView.vue` - 强制修改密码页面（新建）
  - 简洁的UI设计
  - 密码验证
  - 自动跳转

- ✅ `src/router/index.ts` - 路由配置（已修改）
  - 添加 `/member/change-password` 路由

## 后续优化建议

1. **密码强度验证**
   - 要求包含字母和数字
   - 禁止使用常见弱密码

2. **修改记录**
   - 记录密码修改时间
   - 记录修改IP地址

3. **多次失败锁定**
   - 连续修改失败多次后锁定账号

4. **邮件/短信通知**
   - 密码修改成功后发送通知
