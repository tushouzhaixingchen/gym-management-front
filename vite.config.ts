import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 如果需要 @ 别名

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 2. 使用 path.resolve 生成绝对路径
      '@': path.resolve(__dirname, './src'), 
    },
  },
  server: {
    port: 5173, // 前端端口
    proxy: {
      // 核心配置：将 /api 开头的请求转发到 8080
      '/api': {
        target: 'http://localhost:8080', // 后端地址
        changeOrigin: true, // 允许跨域
        // rewrite: (path) => path.replace(/^\/api/, '') // 👈 注释掉这行，保留 /api 前缀
      },
    },
  },
})