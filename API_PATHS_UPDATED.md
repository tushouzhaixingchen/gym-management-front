# 教练预约管理接口路径映射

## 📋 接口路径汇总

本文档记录了教练预约管理模块的所有前后端接口路径映射关系。

---

## 1️⃣ 管理端接口（Admin）

### 基础路径：`/api/admin/appointments`

| 功能 | 请求方法 | 完整路径 | 说明 |
|------|---------|---------|------|
| 获取预约列表 | GET | `/api/admin/appointments` | 支持分页和筛选 |
| 获取预约详情 | GET | `/api/admin/appointments/{id}/detail` | 根据 ID 查询详情 |
| 确认预约 | POST | `/api/admin/appointments/{id}/confirm` | 待确认 → 已确认 |
| 完成预约 | POST | `/api/admin/appointments/{id}/complete` | 已确认 → 已完成 |
| 标记爽约 | POST | `/api/admin/appointments/{id}/no-show` | 已确认 → 已爽约 |
| 取消预约 | POST | `/api/admin/appointments/{id}/cancel` | 待确认/已确认 → 已取消 |

### 请求参数示例

#### 1. 获取预约列表
```
GET /api/admin/appointments?page=1&size=10&appointmentNo=APT001&memberName=张三&coachName=李教练&status=0
```

**查询参数**：
- `page`: 页码（默认 1）
- `size`: 每页数量（默认 10）
- `appointmentNo`: 预约单号（可选）
- `memberName`: 会员姓名（可选）
- `coachName`: 教练姓名（可选）
- `status`: 预约状态（可选）

#### 2. 获取预约详情
```
GET /api/admin/appointments/1/detail
```

#### 3. 确认预约
```
POST /api/admin/appointments/1/confirm
Content-Type: application/json
```

#### 4. 完成预约
```
POST /api/admin/appointments/1/complete
Content-Type: application/json

{
  "actualDuration": 60,
  "remark": "课程顺利完成"
}
```

#### 5. 标记爽约
```
POST /api/admin/appointments/1/no-show
Content-Type: application/json

{
  "reason": "教练未按时到场"
}
```

#### 6. 取消预约
```
POST /api/admin/appointments/1/cancel
Content-Type: application/json

{
  "cancelReason": "会员临时有事",
  "cancelBy": 2  // 2=管理员取消
}
```

---

## 2️⃣ 会员端接口（Member）

### 基础路径：`/api/member/appointments`

| 功能 | 请求方法 | 完整路径 | 说明 |
|------|---------|---------|------|
| 创建预约 | POST | `/api/member/appointments` | 会员预约教练 |
| 获取我的预约列表 | GET | `/api/member/appointments/my` | 当前会员的预约 |
| 获取预约详情 | GET | `/api/member/appointments/{id}` | 根据 ID 查询详情 |
| 取消预约 | POST | `/api/member/appointments/{id}/cancel` | 会员取消自己的预约 |
| 提交评价 | POST | `/api/member/appointments/{id}/feedback` | 课后评价 |

### 辅助接口

| 功能 | 请求方法 | 完整路径 | 说明 |
|------|---------|---------|------|
| 获取教练列表 | GET | `/api/coaches` | 所有可预约的教练 |
| 获取教练排班 | GET | `/api/coaches/{id}/schedules` | 指定教练的排班 |
| 获取门店列表 | GET | `/api/stores` | 所有门店 |

### 请求参数示例

#### 1. 创建预约
```
POST /api/member/appointments
Content-Type: application/json

{
  "storeId": 1,
  "coachId": 1,
  "purpose": "减脂",
  "durationMinutes": 60,
  "price": 200.00,
  "remark": "希望教练提前准备",
  "timeSlotStart": "2026-03-28 10:00:00",
  "timeSlotEnd": "2026-03-28 11:00:00"
}
```

#### 2. 获取我的预约列表
```
GET /api/member/appointments/my?page=1&size=10
```

#### 3. 获取预约详情
```
GET /api/member/appointments/1
```

#### 4. 取消预约
```
POST /api/member/appointments/1/cancel
Content-Type: application/json

{
  "cancelReason": "临时有事",
  "cancelBy": 1  // 1=会员取消
}
```

#### 5. 提交评价
```
POST /api/member/appointments/1/feedback
Content-Type: application/json

{
  "score": 5,
  "feedbackContent": "教练很专业，课程内容丰富"
}
```

---

## 3️⃣ 前端代码修改记录

### 修改的文件

1. **`src/views/BookingManageView.vue`** (管理端 - 教练预约管理)
   - ✅ 获取预约列表：`/appointments` → `/admin/appointments`
   - ✅ 获取预约详情：`/appointments/{id}/detail` → `/admin/appointments/{id}/detail`
   - ✅ 确认预约：`/appointments/{id}/confirm` → `/admin/appointments/{id}/confirm`
   - ✅ 完成预约：`/appointments/{id}/complete` → `/admin/appointments/{id}/complete`
   - ✅ 标记爽约：`/appointments/{id}/no-show` → `/admin/appointments/{id}/no-show`
   - ✅ 取消预约：`/appointments/{id}/cancel` → `/admin/appointments/{id}/cancel`

2. **`src/views/MemberCoachBookingView.vue`** (会员端 - 预约教练)
   - ✅ 创建预约：`/appointments` → `/member/appointments`

3. **`src/views/MemberView.vue`** (会员端 - 会员中心)
   - ✅ 获取我的预约：`/appointments/my` → `/member/appointments/my`
   - ✅ 取消预约：`/appointments/{id}/cancel` → `/member/appointments/{id}/cancel`

---

## 4️⃣ 状态码说明

### 预约状态（status）

| 值 | 状态 | 说明 |
|----|------|------|
| 0 | 待确认 | 会员已预约，等待管理员确认 |
| 1 | 已确认 | 管理员已确认，等待上课 |
| 2 | 已完成 | 课程已完成 |
| 3 | 已取消 | 预约已取消 |
| 4 | 已爽约 | 未按时上课 |

### 支付状态（pay_status）

| 值 | 状态 | 说明 |
|----|------|------|
| 0 | 未支付 | 尚未支付 |
| 1 | 已支付 | 已完成支付 |

---

## 5️⃣ 返回数据格式

### 统一返回格式

所有接口返回以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体数据
  }
}
```

### 分页数据格式

#### MyBatis-Plus 风格
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [...],
    "total": 100,
    "size": 10,
    "current": 1
  }
}
```

#### 通用分页风格
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

---

## 6️⃣ 调试建议

### 前端调试

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 查看请求的 URL、请求参数、响应数据
4. 检查控制台日志输出

### 后端调试

1. 查看后端日志，定位具体异常
2. 检查数据库表是否存在
3. 验证 SQL 语句是否正确
4. 确认 Controller/Service 注入是否正常

### Postman 测试

使用 `resources/健身房管理系统.postman_collection.json` 中的集合进行接口测试。

---

## 7️⃣ 常见问题

### Q1: 接口返回 500 错误
**原因**：后端代码异常、数据库表不存在、SQL 错误等  
**解决**：查看后端日志，根据错误信息修复

### Q2: 接口返回 404 错误
**原因**：接口路径不存在、Controller 未定义等  
**解决**：检查接口路径是否正确，确认后端是否实现该接口

### Q3: 跨域问题
**原因**：后端 CORS 配置不当  
**解决**：检查后端 CORS 配置，确保允许前端域名访问

---

## 📝 总结

- ✅ 管理端接口统一使用 `/api/admin/appointments` 前缀
- ✅ 会员端接口统一使用 `/api/member/appointments` 前缀
- ✅ 所有接口均已在前端代码中更新
- ✅ 前端代码已添加调试日志，便于排查问题

**下一步**：确保后端按照上述接口路径实现对应的 Controller 方法。