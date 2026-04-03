# 健身房管理系统 - 前端

## 项目介绍

基于 Vue 3 + TypeScript + Vite 构建的健身房管理系统前端应用，实现了基于角色的权限控制系统。

## 角色体系

系统定义了两类主要角色：

### 1. 管理员（ADMIN）
- **超级管理员**：拥有系统全部权限
- **普通管理员**：拥有日常管理权限
- 登录后默认进入管理后台（`/admin`）
- 可访问管理员信息管理页面

### 2. 会员（MEMBER）
- 普通会员用户
- 登录后默认进入会员中心（`/member`）
- 可访问以下功能模块：
  - 个人信息管理
  - 会员卡券管理
  - 课程预约
  - 入场记录查询

## 功能特性

### 权限控制
- ✅ 基于角色的路由访问控制
- ✅ 登录成功后根据角色自动跳转
- ✅ 路由守卫拦截未授权访问
- ✅ 动态菜单和界面展示

### 会员中心功能

#### 1. 个人信息
- 显示会员基本信息（姓名、手机号、等级）
- 会员有效期显示
- 支持编辑个人资料
- 支持修改密码

#### 2. 我的卡券
- **会员卡**：
  - 查看已购买的会员卡
  - 显示卡号、有效期、剩余次数
  - 状态标识（使用中/已过期）
- **优惠券**：
  - 查看可用优惠券
  - 显示优惠金额、使用条件
  - 状态标识（可使用/已使用）

#### 3. 我的课程
- **今日课程**：查看当天预约的课程
- **已预约课程**：查看所有已预约的课程
- **已完成课程**：查看历史完成课程
- 支持取消课程预约

#### 4. 入场记录
- 查看最近入场记录
- 显示入场时间、离场时间
- 自动计算锻炼时长
- 状态标识（已完成/进行中）

#### 5. 快捷操作
- 扫码入场（开发中）
- 课程预约（开发中）
- 购买卡券（开发中）
- 联系客服（开发中）

## 技术栈

- **框架**: Vue 3.5.30
- **语言**: TypeScript 5.9.3
- **构建工具**: Vite 8.0.1
- **UI 框架**: Element Plus 2.13.6
- **状态管理**: Pinia 3.0.4
- **路由**: Vue Router 4.6.4
- **HTTP 客户端**: Axios 1.13.6

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建产物
```bash
npm run preview
```

## 后端接口要求

### 登录接口
**请求**: `POST /api/auth/login`

**请求体**:
```json
{
  "account": "用户名",
  "password": "密码"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "xxx",
    "name": "张三",
    "role": "ADMIN",  // 或 "MEMBER"
    "userId": 123
  }
}
```

### 会员相关接口

#### 获取会员信息
`GET /api/members/{userId}`

#### 更新会员信息
`PUT /api/members/{userId}`

#### 修改密码
`POST /api/members/changePassword`

#### 获取我的卡券
`GET /api/members/{userId}/cards`

响应数据结构：
```json
{
  "code": 200,
  "data": {
    "membershipCards": [
      {
        "id": 1,
        "cardName": "年卡",
        "cardNumber": "CARD20240101001",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "remainingTimes": 100,
        "totalTimes": 365,
        "status": 1
      }
    ],
    "coupons": [
      {
        "id": 1,
        "name": "满 100 减 20",
        "amount": 20,
        "description": "满 100 元可用",
        "endDate": "2024-12-31",
        "status": 1
      }
    ]
  }
}
```

#### 获取我的课程
`GET /api/members/{userId}/courses`

响应数据结构：
```json
{
  "code": 200,
  "data": {
    "today": [],
    "booked": [
      {
        "id": 1,
        "courseName": "瑜伽基础",
        "courseTime": "2024-01-15 14:00",
        "location": "朝阳店 - 瑜伽室",
        "coachName": "李教练"
      }
    ],
    "completed": []
  }
}
```

#### 取消课程预约
`DELETE /api/course-bookings/{id}`

#### 获取入场记录
`GET /api/members/{userId}/access-records?page=1&pageSize=10`

响应数据结构：
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "accessTime": "2024-01-15 10:00:00",
        "leaveTime": "2024-01-15 12:30:00",
        "storeName": "朝阳店",
        "status": 1
      }
    ],
    "total": 100
  }
}
```

## 项目结构

```
src/
├── components/          # 通用组件
├── router/             # 路由配置
│   └── index.ts       # 路由守卫和角色权限配置
├── stores/             # 状态管理
│   ├── index.ts       # Pinia 实例
│   └── user.ts        # 用户状态（包含角色信息）
├── utils/              # 工具函数
│   └── request.ts     # Axios 封装
├── views/              # 页面组件
│   ├── LoginView.vue  # 登录页
│   ├── HomeView.vue   # 首页（根据角色显示不同内容）
│   ├── AdminView.vue  # 管理员管理页（仅 ADMIN 可访问）
│   └── MemberView.vue # 会员中心（仅 MEMBER 可访问）
├── App.vue            # 根组件
└── main.ts            # 入口文件
```

## 注意事项

1. **角色字段**: 后端登录接口必须返回 `role` 字段，值为 `ADMIN` 或 `MEMBER`
2. **Token 存储**: Token 和角色信息会同步存储到 localStorage，刷新页面不丢失
3. **路由权限**: 未登录用户访问需要认证的页面会自动重定向到登录页
4. **角色切换**: 不同角色用户登录后会自动跳转到对应的首页

## 后续开发计划

- [ ] 完善课程预约功能
- [ ] 实现卡券购买功能
- [ ] 添加扫码入场功能
- [ ] 实现在线客服功能
- [ ] 添加消息通知功能
- [ ] 完善个人信息编辑功能
- [ ] 添加会员等级系统

## 许可证

MIT