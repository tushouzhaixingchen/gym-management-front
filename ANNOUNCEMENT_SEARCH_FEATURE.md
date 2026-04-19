# 会员端公告搜索与过期标注功能说明

## 功能概述
为会员端公告查看功能新增搜索过滤和过期标注功能，提升用户体验。

## 新增功能

### 1. 🔍 搜索过滤功能

**搜索条件：**
- **关键字搜索**：支持按公告标题或内容关键字搜索
- **门店筛选**：按门店过滤公告
- **优先级筛选**：按优先级（普通/重要/紧急）过滤

**搜索特性：**
- ✅ 回车键快捷搜索
- ✅ 清空输入自动搜索
- ✅ 下拉选择自动搜索
- ✅ 重置按钮清空所有条件
- ✅ 详细的控制台日志输出

### 2. ⏰ 过期标注功能

**自动判断逻辑：**
- 根据公告的 `expireTime` 字段与当前时间比较
- 如果已过期，自动添加"已过期"标签
- 公告卡片整体置灰（透明度降低）
- 过期时间旁边显示红色"（已过期）"提示

**视觉标识：**
- 🔴 已过期标签：灰色，带闪烁动画
- 🎨 卡片样式：背景变灰，透明度 0.6
- 📝 文字提示：过期时间后显示红色标注

### 3. 📄 分页功能

**分页特性：**
- 支持每页显示 10/20/50 条
- 显示总记录数
- 支持跳转指定页码
- 页码导航和大小选择器

## 接口调整

### 修改前（管理员接口）
```
❌ GET /api/admin/announcements         - 获取公告列表
❌ GET /api/admin/announcements/:id     - 获取公告详情
```

### 修改后（会员端接口）
```
✅ GET /api/member/announcements         - 获取公告列表
✅ GET /api/member/announcements/:id     - 获取公告详情
```

### 请求参数

#### 获取公告列表
```typescript
GET /api/member/announcements
参数:
  - page: 页码（默认 1）
  - size: 每页数量（默认 10）
  - keyword: 关键字（可选）
  - storeId: 门店ID（可选）
  - priority: 优先级（可选）
```

**示例：**
```
GET /api/member/announcements?page=1&size=10&keyword=瑜伽&storeId=1&priority=2
```

#### 获取公告详情
```typescript
GET /api/member/announcements/:id
参数:
  - id: 公告ID
```

## 代码实现要点

### 1. 过期判断函数
```typescript
const isExpired = (item: any) => {
  if (!item.expireTime) return false
  const expireTime = new Date(item.expireTime).getTime()
  const now = new Date().getTime()
  return expireTime < now
}
```

### 2. 状态显示函数
```typescript
const getStatusType = (item: any) => {
  if (isExpired(item)) return 'info'  // 过期显示灰色
  return item.publishStatus === 1 ? 'success' : 'info'
}

const getStatusText = (item: any) => {
  if (isExpired(item)) return '已过期'
  return item.publishStatus === 1 ? '已发布' : '草稿'
}
```

### 3. 搜索逻辑
```typescript
const handleSearch = () => {
  currentPage.value = 1  // 重置到第一页
  loadAnnouncements()    // 重新加载数据
}
```

## 样式特点

### 搜索表单
- 响应式布局，自动换行
- 关键字输入框：250px 宽度
- 下拉选择框：180px 宽度
- 按钮组合紧凑排列

### 过期公告样式
```css
/* 已过期公告 */
.announcement-expired {
  opacity: 0.6;              /* 降低透明度 */
  background-color: #f5f5f5; /* 灰色背景 */
}

/* 过期标签闪烁动画 */
.expired-tag {
  animation: blink 2s infinite;
}
```

## 调试日志

所有关键操作都有详细的控制台日志：

```javascript
🏪 开始加载门店列表...
📥 门店列表响应: {...}
✅ 门店列表加载完成，数量: 3

🔍 执行搜索，条件: {keyword: '瑜伽', storeId: 1, priority: undefined}
📢 ========== 开始加载公告列表 ==========
📋 搜索条件: {...}
📋 分页参数: {page: 1, size: 10}
📥 ========== 公告列表原始响应 ==========
📦 响应类型: object
📦 完整响应数据: {...}
✅ 公告列表加载完成，数量: 5
```

## 测试步骤

### 1. 测试搜索功能
1. 访问公告列表页面
2. 在关键字输入框输入内容，按回车
3. 选择门店下拉框
4. 选择优先级下拉框
5. 点击"搜索"按钮
6. 点击"重置"按钮清空条件

### 2. 测试过期标注
1. 查看有过期时间的公告
2. 已过期的公告应显示：
   - ✅ 灰色背景
   - ✅ "已过期"标签（带闪烁）
   - ✅ 过期时间后显示"（已过期）"
   - ✅ 整体透明度降低

### 3. 测试分页功能
1. 当数据超过 10 条时，查看分页器
2. 切换每页显示数量（10/20/50）
3. 点击页码跳转
4. 输入页码跳转

## 注意事项

1. **接口路径**：已更新为会员端专用接口 `/api/member/announcements`
2. **权限验证**：会员端接口应该有相应的权限控制
3. **时间格式**：确保后端返回的 `expireTime` 是标准日期格式
4. **分页格式**：兼容多种分页数据格式（records/list/items）
5. **缓存问题**：修改后建议硬刷新（Ctrl+Shift+R）

## 数据兼容性

代码兼容多种后端响应格式：
- ✅ 直接返回数组：`[...]`
- ✅ 标准格式：`{ code: 200, data: [...] }`
- ✅ MyBatis-Plus：`{ code: 200, data: { records: [...], total: 100 } }`
- ✅ 通用分页：`{ code: 200, data: { list: [...], total: 100 } }`

## 文件清单

- ✅ `src/views/MemberAnnouncementView.vue` - 会员公告查看页面（已更新）
  - 新增搜索表单
  - 新增门店选择器
  - 新增优先级筛选
  - 新增过期标注
  - 新增分页功能
  - 更新接口路径为会员端
