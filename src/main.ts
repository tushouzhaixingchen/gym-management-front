import { createApp } from 'vue';
import App from './App.vue';
// 1. 导入 pinia 实例
import pinia from './stores';
import router from './router';
import { migrateLegacyAuthSession } from '@/utils/authSession';
import { useUserStore } from '@/stores/user';
// 导入 Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// 2. 安装 pinia 插件
app.use(pinia);
migrateLegacyAuthSession();
app.use(router);
router.isReady().then(() => {
  useUserStore().hydrateFromPath(router.currentRoute.value.path);
});

// 3. 使用 Element Plus
app.use(ElementPlus);

// 4. 全局注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');