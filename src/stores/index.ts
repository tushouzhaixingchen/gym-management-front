// 1. 只导入值 (createPinia 是一个函数，是运行时的值)
import { createPinia } from 'pinia';

// 2. 只导入类型 (PiniaPluginContext 是一个类型定义，仅用于编译时检查)
import type { PiniaPluginContext } from 'pinia';

// 3. 导入你的 Store
import { useUserStore } from './user.ts';

const pinia = createPinia();

// 4. 在使用时，你可以像之前一样使用类型注解
pinia.use((context: PiniaPluginContext) => {
  // ... 你的逻辑
});

export { useUserStore };
export default pinia;