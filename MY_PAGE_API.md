# "我的"页面功能接口说明

## 概述
本文档详细说明了会员中心"我的"页面所涉及的所有后端API接口。

---

## 1. 会员信息管理

### 1.1 获取会员详情
**接口地址**: `GET /api/members/{id}`

**请求参数**:
- `id`: 会员ID（路径参数）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "realName": "张三",
    "phone": "13800138000",
    "gender": 1,
    "email": "zhangsan@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "level": 2,
    "cardType": "period",
    "expiryDate": "2026-12-31",
    "remark": "VIP会员",
    "joinDate": "2025-01-01",
    "registerStoreId": 1
  }
}
```

**字段说明**:
- `gender`: 1-男，2-女
- `level`: 会员等级（1-普通，2-银卡，3-金卡，4-钻石）
- `cardType`: 卡类型（period-期限卡，times-次卡）

---

### 1.2 编辑会员信息
**接口地址**: `PUT /api/members/{id}`

**请求参数**:
```json
{
  "realName": "张三",
  "phone": "13800138000",
  "gender": 1,
  "remark": "备注信息"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 1.3 修改密码
**接口地址**: `POST /api/members/changePassword`

**请求参数**:
```json
{
  "userId": 1,
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

## 2. 教练预约管理

### 2.1 获取我的预约列表
**接口地址**: `GET /api/member/appointments/my`

**请求参数**:
- `page`: 页码（默认1）
- `size`: 每页数量（默认10）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "appointmentNo": "APT202604180001",
        "memberId": 1,
        "coachId": 1,
        "coachName": "李教练",
        "storeId": 1,
        "storeName": "总店",
        "timeSlotStart": "2026-04-20T10:00:00",
        "timeSlotEnd": "2026-04-20T11:00:00",
        "durationMinutes": 60,
        "price": 200.00,
        "status": 1,
        "payStatus": 1,
        "purpose": "增肌训练",
        "remark": "第一次上课",
        "feedbackScore": 0,
        "feedbackContent": "",
        "createdAt": "2026-04-18T09:00:00"
      }
    ]
  }
}
```

**状态说明**:
- `status`: 0-待确认，1-已确认，2-已完成，3-已取消，4-已爽约
- `payStatus`: 0-未支付，1-已支付

---

### 2.2 获取预约详情
**接口地址**: `GET /api/member/appointments/{id}`

**请求参数**:
- `id`: 预约ID（路径参数）

**响应示例**: 同列表中的单个记录

---

### 2.3 取消预约
**接口地址**: `POST /api/member/appointments/{id}/cancel`

**请求参数**:
```json
{
  "cancelReason": "会员主动取消",
  "cancelBy": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "取消成功",
  "data": null
}
```

---

### 2.4 提交评价
**接口地址**: `POST /api/appointments/{id}/feedback`

**请求参数**:
```json
{
  "feedbackScore": 5,
  "feedbackContent": "教练很专业，课程效果很好！"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "评价成功",
  "data": null
}
```

---

## 3. 会员卡券管理

### 3.1 获取会员卡券
**接口地址**: `GET /api/members/{id}/cards`

**注意**: 如果后端没有此接口，可以从会员详情接口中获取卡券信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "membershipCards": [
      {
        "id": 1,
        "cardName": "年卡",
        "cardNumber": "MC20260001",
        "startDate": "2026-01-01",
        "endDate": "2026-12-31",
        "remainingTimes": 999,
        "totalTimes": 999,
        "status": 1
      }
    ],
    "coupons": [
      {
        "id": 1,
        "name": "新人优惠券",
        "amount": 50.00,
        "description": "满200减50",
        "endDate": "2026-06-30",
        "status": 1
      }
    ]
  }
}
```

**状态说明**:
- `status`: 1-可使用/使用中，0-已使用/已过期

---

## 4. 入场记录管理

### 4.1 获取签到记录
**接口地址**: `GET /api/members/{id}/check-in-records`

**请求参数**:
- `page`: 页码（默认1）
- `size`: 每页数量（默认10）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 1,
        "memberId": 1,
        "storeId": 1,
        "storeName": "总店",
        "accessTime": "2026-04-18T09:00:00",
        "leaveTime": "2026-04-18T11:30:00",
        "status": 1,
        "checkInMethod": "qrcode"
      }
    ]
  }
}
```

**状态说明**:
- `status`: 1-已完成，0-进行中（已入场未离场）

---

## 5. 课程管理（会员视角）

### 5.1 获取我的课程
**接口地址**: `GET /api/members/{id}/courses`

**注意**: 如果后端没有此接口，可以通过预约接口获取课程信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "today": [
      {
        "id": 1,
        "courseName": "瑜伽初级班",
        "courseTime": "2026-04-18 10:00-11:00",
        "location": "瑜伽室A",
        "coachName": "王教练",
        "status": 1
      }
    ],
    "booked": [],
    "completed": []
  }
}
```

---

## 6. 会员签到

### 6.1 会员签到
**接口地址**: `POST /api/members/{id}/check-in`

**请求参数**:
```json
{
  "memberId": 1,
  "storeId": 1,
  "checkInMethod": "qrcode",
  "remark": "前台扫码签到"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "id": 1,
    "accessTime": "2026-04-18T09:00:00"
  }
}
```

---

## 数据字典

### 性别
- 1: 男
- 2: 女

### 会员等级
- 1: 普通会员
- 2: 银卡会员
- 3: 金卡会员
- 4: 钻石会员

### 预约状态
- 0: 待确认
- 1: 已确认
- 2: 已完成
- 3: 已取消
- 4: 已爽约

### 支付状态
- 0: 未支付
- 1: 已支付

### 签到方式
- qrcode: 二维码签到
- manual: 手动签到
- face: 人脸识别签到

---

## 注意事项

1. **所有接口都需要在请求头中携带Token**
   ```
   Authorization: Bearer {token}
   ```

2. **日期时间格式**
   - 统一使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss`
   - 例如：`2026-04-18T10:00:00`

3. **分页参数**
   - `page`: 页码，从1开始
   - `size`: 每页数量，默认10

4. **错误处理**
   - 所有接口返回统一格式：`{ code, message, data }`
   - `code === 200` 表示成功
   - 其他状态码表示失败，`message` 中包含错误信息

5. **前端适配建议**
   - 如果某些接口后端尚未实现，可以先使用模拟数据
   - 建议在开发环境中添加详细的日志输出，便于调试
   - 对于可选功能（如卡券、入场记录），如果接口不存在，不应影响主流程

---

## 后续优化建议

1. **添加缓存机制**
   - 会员基本信息可以缓存，减少请求次数
   - 设置合理的缓存过期时间

2. **下拉刷新/上拉加载**
   - 预约列表、入场记录等支持分页加载
   - 提供更好的用户体验

3. **实时通知**
   - 预约状态变更时推送通知
   - 可以使用 WebSocket 或轮询机制

4. **数据统计**
   - 添加健身数据统计图表
   - 展示运动时长、消费金额等趋势

5. **个性化推荐**
   - 根据历史记录推荐教练和课程
   - 智能推荐适合的健身计划
