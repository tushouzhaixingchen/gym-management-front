<template>
  <div class="admin-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h4>管理员信息管理</h4>
          <el-button type="primary" @click="$emit('add')">
            <el-icon><Plus /></el-icon>
            新增管理员
          </el-button>
        </div>
      </template>
      <p>管理员列表内容区域（使用现有的 AdminView 组件）</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>

<style scoped>
.admin-list-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
}
</style>