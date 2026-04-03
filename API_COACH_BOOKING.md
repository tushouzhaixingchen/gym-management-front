# 教练预约管理模块 API 接口文档

## 概述

本文档说明教练预约管理功能的前后端接口规范，包括管理端和会员端的所有接口。

## 基础信息

- **基础路径**: `/api`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **返回格式**: `{ code: number, message: string, data: any }`

---

## 1. 管理端 - 教练预约管理

### 1.1 获取预约列表（分页）

**接口**: `GET /appointments`

**请求参数**:
```typescript
{
  page?: number;          // 页码，默认 1
  size?: number;          // 每页数量，默认 10
  appointmentNo?: string; // 预约单号（模糊查询）
  memberName?: string;    // 会员姓名（模糊查询）
  coachName?: string;     // 教练姓名（模糊查询）
  status?: number;        // 预约状态：0-待确认 1-已确认 2-已完成 3-已取消 4-已爽约
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "success",
  data: {
    records: [  // 或 list
      {
        id: number,
        appointmentNo: string,      // 预约单号
        memberName: string,         // 会员姓名
        memberPhone: string,        // 会员电话
        coachName: string,          // 教练姓名
        storeName: string,          // 门店名称
        timeSlotStart: string,      // 开始时间 (yyyy-MM-dd HH:mm:ss)
        timeSlotEnd: string,        // 结束时间 (yyyy-MM-dd HH:mm:ss)
        durationMinutes: number,    // 时长（分钟）
        price: number,              // 价格
        coachShare: number,         // 教练分成
        purpose: string,            // 预约目的
        status: number,             // 状态
        payStatus: number,          // 支付状态：0-未支付 1-已支付
        payMethod: number,          // 支付方式：1-微信 2-支付宝 3-现金
        payTime: string,            // 支付时间
        confirmedAt: string,        // 确认时间
        confirmedBy: number,        // 确认人 ID
        coachCheckInTime: string,   // 教练签到时间
        coachCheckOutTime: string,  // 教练签退时间
        actualDuration: number,     // 实际上课时长
        memberCheckInTime: string,  // 会员签到时间
        feedbackScore: number,      // 评价评分 1-5
        feedbackContent: string,    // 评价内容
        cancelReason: string,       // 取消原因
        cancelBy: number,           // 取消方：1-会员 2-管理员
        remark: string,             // 备注
        createdAt: string,          // 创建时间
        updatedAt: string           // 更新时间
      }
    ],
    total: number
  }
}
```

### 1.2 确认预约

**接口**: `POST /appointments/:id/confirm`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "确认成功",
  data: null
}
```

### 1.3 完成预约

**接口**: `POST /appointments/:id/complete`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**请求体**:
```typescript
{
  actualDuration: number,  // 实际上课时长（分钟）
  remark: string           // 备注
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "完成成功",
  data: null
}
```

### 1.4 标记爽约

**接口**: `POST /appointments/:id/no-show`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**请求体**:
```typescript
{
  reason: string  // 爽约原因
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "标记成功",
  data: null
}
```

### 1.5 取消预约

**接口**: `POST /appointments/:id/cancel`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**请求体**:
```typescript
{
  cancelReason: string,  // 取消原因
  cancelBy: number       // 取消方：1-会员 2-管理员
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "取消成功",
  data: null
}
```

---

## 2. 会员端 - 预约教练

### 2.1 获取教练列表

**接口**: `GET /coaches`

**请求参数**:
```typescript
{
  page?: number;           // 页码
  size?: number;           // 每页数量
  storeId?: number;        // 门店 ID
  realName?: string;       // 教练姓名（模糊查询）
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "success",
  data: {
    records: [  // 或 list
      {
        id: number,
        realName: string,       // 教练姓名
        avatar: string,         // 头像
        title: string,          // 职称
        specialty: string,      // 擅长领域
        experience: number,     // 从业年限
        price: number,          // 课时费（元/小时）
        storeId: number,        // 所属门店 ID
        // ... 其他字段
      }
    ]
  }
}
```

### 2.2 获取教练排班可用时间段

**接口**: `GET /coaches/:coachId/schedules`

**路径参数**:
```typescript
{
  coachId: number  // 教练 ID
}
```

**查询参数**:
```typescript
{
  date: string  // 日期 (yyyy-MM-dd)
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "success",
  data: [
    {
      value: "09:00",           // 时间段值
      label: "09:00 - 10:00"    // 时间段显示文本
    },
    {
      value: "10:00",
      label: "10:00 - 11:00"
    }
    // ... 更多时间段
  ]
}
```

### 2.3 创建预约

**接口**: `POST /appointments`

**请求体**:
```typescript
{
  storeId: number,              // 门店 ID
  coachId: number,              // 教练 ID
  purpose: string,              // 预约目的
  durationMinutes: number,      // 预约时长（分钟）
  price: number,                // 预约价格
  remark: string,               // 备注
  timeSlotStart: string,        // 开始时间 (yyyy-MM-dd HH:mm:ss)
  timeSlotEnd: string           // 结束时间 (yyyy-MM-dd HH:mm:ss)
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "预约成功",
  data: {
    id: number,                 // 预约 ID
    appointmentNo: string       // 预约单号
  }
}
```

---

## 3. 会员端 - 我的预约

### 3.1 获取我的预约列表

**接口**: `GET /appointments/my`

**请求参数**:
```typescript
{
  page?: number;           // 页码
  size?: number;           // 每页数量
  status?: number;         // 状态筛选（可选）
}
```

**返回数据**: 同管理端获取预约列表

### 3.2 获取预约详情

**接口**: `GET /appointments/:id`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "success",
  data: {
    // 完整的预约对象（字段同列表项）
  }
}
```

### 3.3 取消预约（会员端）

**接口**: `POST /appointments/:id/cancel`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**请求体**:
```typescript
{
  cancelReason: string,  // 取消原因
  cancelBy: number       // 取消方：固定为 1（会员）
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "取消成功",
  data: null
}
```

### 3.4 提交评价

**接口**: `POST /appointments/:id/feedback`

**路径参数**:
```typescript
{
  id: number  // 预约 ID
}
```

**请求体**:
```typescript
{
  feedbackScore: number,     // 评分 1-5
  feedbackContent: string    // 评价内容
}
```

**返回数据**:
```typescript
{
  code: 200,
  message: "评价成功",
  data: null
}
```

---

## 4. 辅助接口

### 4.1 获取门店列表

**接口**: `GET /stores`

**返回数据**:
```typescript
{
  code: 200,
  message: "success",
  data: [
    {
      id: number,
      name: string,
      address: string,
      // ... 其他字段
    }
  ]
}
```

---

## 5. 状态码说明

### 预约状态 (status)
- `0`: 待确认
- `1`: 已确认
- `2`: 已完成
- `3`: 已取消
- `4`: 已爽约

### 支付状态 (payStatus)
- `0`: 未支付
- `1`: 已支付

### 支付方式 (payMethod)
- `1`: 微信
- `2`: 支付宝
- `3`: 现金

### 取消方 (cancelBy)
- `1`: 会员
- `2`: 管理员

---

## 6. 注意事项

1. **分页格式兼容**: 前端代码已兼容多种分页响应格式（MyBatis-Plus 的 `records`、通用的 `list`、直接数组），后端可灵活选择。

2. **时间格式**: 所有时间字段统一使用 `yyyy-MM-dd HH:mm:ss` 格式字符串。

3. **预约单号**: 建议后端自动生成，格式如：`APT202603280001`（APT + 日期 + 序号）。

4. **权限控制**: 
   - 管理端接口需要 `ADMIN` 角色
   - 会员端接口需要 `MEMBER` 角色
   - 会员只能查看和操作自己的预约

5. **并发控制**: 创建预约时，后端需要检查教练同一时间段是否已被预约，避免冲突。

6. **自动关闭**: 建议设置定时任务，超过一定时间未确认的预约自动取消。

---

## 7. 调试建议

1. **使用 Postman**: 导入项目中的 `健身房管理系统.postman_collection.json` 文件，已包含基础接口定义。

2. **浏览器控制台**: 前端代码中已添加关键日志输出（`console.log`），可通过浏览器控制台查看后端返回的实际数据结构。

3. **字段映射**: 如果表格显示为空，检查后端返回字段名是否与前端期望的字段名一致（如 `realName` vs `name`）。

4. **清理缓存**: 每次修改路由或配置后，执行 `localStorage.clear()` 并刷新页面。