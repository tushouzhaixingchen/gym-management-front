# 教练预约管理功能使用说明

## 📋 功能概述

本系统包含两个角色的教练预约管理功能：

### 管理端（ADMIN）
- **路径**: `/admin/bookings`
- **功能**: 查看、确认、完成、取消、标记爽约所有会员的教练预约
- **文件**: `src/views/BookingManageView.vue`

### 会员端（MEMBER）
- **预约教练**: `/member/coach-booking` - 查看教练列表并创建预约
- **我的预约**: `/member` (会员中心内的"我的预约"模块) - 查看和管理个人预约
- **文件**: 
  - `src/views/MemberCoachBookingView.vue` (预约教练页面)
  - `src/views/MemberView.vue` (会员中心，包含预约模块)

---

## 🚀 使用步骤

### 一、管理端操作流程

#### 1. 查看预约列表
1. 登录管理员账号
2. 进入"教练预约管理"菜单
3. 可查看预约列表，支持按以下条件筛选：
   - 预约单号
   - 会员姓名
   - 教练姓名
   - 预约状态

#### 2. 确认预约
- 状态为"待确认"的预约显示【确认】按钮
- 点击【确认】后，预约状态变为"已确认"

#### 3. 完成预约
- 状态为"已确认"的预约可操作【完成】
- 填写实际上课时长和备注后提交
- 预约状态变为"已完成"

#### 4. 标记爽约
- 状态为"已确认"的预约可操作【爽约】
- 填写爽约原因后提交
- 预约状态变为"已爽约"

#### 5. 取消预约
- 状态为"待确认"或"已确认"的预约可取消
- 填写取消原因并选择取消方（会员/管理员）
- 预约状态变为"已取消"

#### 6. 查看详情
- 点击任意行的【详情】按钮
- 查看该预约的完整信息，包括支付、评价等

---

### 二、会员端操作流程

#### 1. 预约教练
1. 登录会员账号
2. 进入"预约教练"页面
3. 搜索并选择心仪的教练
4. 点击教练卡片，弹出预约表单
5. 填写以下信息：
   - 选择门店
   - 选择日期（不能选择过去的日期）
   - 选择时间段（根据教练排班动态加载）
   - 选择时长（30/60/90/120 分钟）
   - 选择预约目的（减脂/增肌/康复/体态矫正/其他）
   - 填写备注（可选）
6. 系统自动计算费用
7. 点击【确认预约】提交
8. 等待管理员确认

#### 2. 查看我的预约
1. 进入"会员中心"
2. 滚动到"我的预约"模块
3. 默认显示最近 3 条预约记录
4. 支持切换标签页：
   - 全部
   - 待确认
   - 已完成

#### 3. 查看预约详情
- 点击任意预约卡片
- 弹出详情对话框，显示完整信息

#### 4. 取消预约
- 仅"待确认"状态的预约可取消
- 在详情页点击【取消预约】
- 确认后完成取消操作

#### 5. 课程评价
- "已完成"且未评价的预约显示【评价】按钮
- 点击【评价】弹出评价表单
- 填写评分（1-5 星）和评价内容
- 提交后完成评价

---

## 🔧 技术实现要点

### 1. 数据格式兼容
前端代码已兼容后端多种分页响应格式：
- MyBatis-Plus: `data.records` + `data.total`
- 通用分页：`data.list` + `data.total`
- 直接数组：`data` (Array)

### 2. 状态映射
```typescript
// 预约状态
0 -> 待确认 (warning)
1 -> 已确认 (success)
2 -> 已完成 (info)
3 -> 已取消 (info)
4 -> 已爽约 (danger)

// 支付状态
0 -> 未支付 (warning)
1 -> 已支付 (success)
```

### 3. 时间计算
- 结束时间 = 开始时间 + 时长（分钟）
- 日期选择器禁用过去日期
- 时间格式统一为 `yyyy-MM-dd HH:mm:ss`

### 4. 权限控制
- 路由守卫检查 `userType` 和 `roles`
- 管理端路由需要 `ADMIN` 角色
- 会员端路由需要 `MEMBER` 角色
- Token 存储在 `localStorage`

---

## 📁 文件结构

```
src/
├── views/
│   ├── BookingManageView.vue          # 管理端 - 预约管理
│   ├── MemberCoachBookingView.vue     # 会员端 - 预约教练
│   └── MemberView.vue                 # 会员端 - 会员中心（含预约模块）
├── router/
│   └── index.ts                       # 路由配置（新增会员端预约路由）
└── utils/
    └── request.ts                     # HTTP 请求封装
```

---

## 🔌 后端接口需求

以下是需要后端实现的接口清单：

### 管理端接口
```
GET    /api/appointments              # 获取预约列表（分页）
POST   /api/appointments/:id/confirm  # 确认预约
POST   /api/appointments/:id/complete # 完成预约
POST   /api/appointments/:id/no-show  # 标记爽约
POST   /api/appointments/:id/cancel   # 取消预约
```

### 会员端接口
```
GET    /api/coaches                   # 获取教练列表
GET    /api/coaches/:id/schedules     # 获取教练排班时间段
POST   /api/appointments              # 创建预约
GET    /api/appointments/my           # 获取我的预约列表
GET    /api/appointments/:id          # 获取预约详情
POST   /api/appointments/:id/cancel   # 取消预约（会员）
POST   /api/appointments/:id/feedback # 提交评价
```

### 辅助接口
```
GET    /api/stores                    # 获取门店列表
```

详细接口规范见 `API_COACH_BOOKING.md`

---

## 🎨 UI 组件说明

### Element Plus 组件
- `el-card`: 卡片容器
- `el-table`: 数据表格
- `el-dialog`: 对话框
- `el-form`: 表单
- `el-input`: 输入框
- `el-select`: 下拉选择
- `el-date-picker`: 日期选择器
- `el-radio-group`: 单选组
- `el-button`: 按钮
- `el-tag`: 标签
- `el-descriptions`: 描述列表
- `el-rate`: 评分
- `el-empty`: 空状态
- `el-pagination`: 分页器
- `el-avatar`: 头像

### 图标
所有图标来自 `@element-plus/icons-vue`，已全局注册。

---

## ⚠️ 注意事项

### 1. 开发环境
- 确保已安装依赖：`npm install`
- 启动开发服务器：`npm run dev`
- 访问地址：`http://localhost:5173`

### 2. 测试流程
1. 先使用管理员账号测试管理端功能
2. 再使用会员账号测试会员端功能
3. 验证完整的预约流程：
   - 会员创建预约 → 管理员确认 → 管理员完成 → 会员评价

### 3. 数据测试
建议准备以下测试数据：
- 至少 2 个门店
- 至少 3 个教练（不同门店）
- 至少 2 个会员账号
- 教练排班数据（未来 7 天）

### 4. 常见问题排查

**问题 1: 表格显示为空**
- 检查后端返回数据的字段名是否与前端期望一致
- 在浏览器控制台查看 `console.log` 输出
- 确认分页数据结构（records vs list）

**问题 2: 路由跳转失败**
- 清除 localStorage: `localStorage.clear()`
- 刷新页面重新登录
- 检查路由守卫中的角色判断逻辑

**问题 3: 时间段加载失败**
- 确认教练排班接口返回格式
- 检查日期格式是否为 `yyyy-MM-dd`
- 验证教练 ID 是否正确传递

---

## 📝 后续优化建议

1. **预约冲突检测**: 前端增加实时检测，避免重复预约同一时间段
2. **教练评价展示**: 在教练列表页显示平均评分和评价数量
3. **预约统计**: 管理端增加数据统计图表（预约量、完成率等）
4. **消息通知**: 预约状态变化时发送站内信或短信通知
5. **批量操作**: 支持批量确认、批量取消等功能
6. **导出功能**: 导出预约记录为 Excel 文件

---

## 📞 技术支持

如有问题，请查看：
- API 接口文档：`API_COACH_BOOKING.md`
- Postman 集合：`resources/健身房管理系统.postman_collection.json`
- 项目主文档：`README.md`