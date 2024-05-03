---
title: Element-Plus技术揭秘专栏的知识学习笔记-组件库工程化实战之 组件实现的基本流程及 Icon 组件的实现
author: Chen YuBo
pubDatetime: 2024-03-18T13:46:10.211Z
date: 2024-03-18T13:46:10.211Z
featured: false
category: 源码分析
draft: false
description: "学习笔记"
tags:
  - 专栏学习笔记
---

原文地址：https://juejin.cn/post/7168835045984043022

结构

```
├── packages
│   ├── components
│   │   ├── icon
│   │   │   ├── __tests__       # 测试目录
│   │   │   ├── src             # 组件入口目录
│   │   │   │   ├── icon.ts     # 组件属性与 TS 类型
│   │   │   │   └── icon.vue    # 组件模板内容
│   │   │   ├── style           # 组件样式目录
│   │   │   └── index.ts        # 组件入口文件
│   │   └── package.json

```

## 组件定义

### 1 组件的 props 定义

- color: `Pick<CSSProperties, 'color'>`
- size: number 、 string

packages/components/icon/src/icon.ts

```js
import { ExtractPropTypes, PropType } from "vue";

// SFC 的 icon.vue 也需要导出
import type Icon from './icon.vue'
export type IconInstance = InstanceType<typeof Icon>

export const iconProps = {
  color: String,
  size: [Number, String] as PropType<number | string>, // size 可以说数字，也可以说字符串
} as const;

export type iconProps = ExtractPropTypes<typeof iconProps>;

```

### 2 编写 SFC 组件

packages/components/icon/src/icon.vue

```vue
<template>
  <div>
    <i :style="style">
      <slot></slot>
    </i>
  </div>
</template>

<script setup lang="ts">
import { iconProps } from "./icon";
import { computed, type CSSProperties } from "vue";

const props = defineProps(iconProps);
const style = computed<CSSProperties>(() => {
  if (!props.size && !props.color) return {};
  return {
    fontSize: props.size + "px",
    "--color": props.color, // 通过 CSS 变量方式进行设置 color
  };
});
</script>

<style scoped></style>
```

## vue 中的 css 变量

```vue
<template>
  <div class="content">
    <i class="info" :style="{ '--color': color }"> </i>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
const color = ref("green");
</script>
<style scoped>
.info {
  color: var(--color);
}
</style>
```

## 组件的注册

使用的时候一般有两种，setup 方式和 defineComponent 方式

setup 引入就可以直接模板使用了

```vue
<script setup lang="ts">
import ElIcon from "@cobyte-ui/components/icon";
import "@cobyte-ui/theme-chalk/src/index.scss";
</script>
```

defineComponent 方式需要使用`components`进行注册

```vue
<script lang="ts">
import { defineComponent } from "vue";
import ElIcon from "@cobyte-ui/components/icon";
import "@cobyte-ui/theme-chalk/src/index.scss";

export default defineComponent({
  name: "App",
  components: {
    ElIcon,
  },
  setup() {},
});
</script>
```

### install 方法

我们需要全局的注册，这边可以使用插件，给每个组件一个插件的方法，install，自动调用注册到全局上

```ts
import type { Plugin, App } from "vue";

// 通过 Vue 提供的 Plugin 类型和传进来的组件类型 T 的集合进行确定我们的组件类型具有 Plugin 类型方法，如 install 方法

export type SFCWithInstall<T> = T & Plugin;

export const withInstall = <T>(comp: T) => {
  (comp as SFCWithInstall<T>).install = (app: App) => {
    // 组件的注册名称参数暂时是写死了 ElIcon，在后面的小节，我们再详细说明如何进行设置动态组件名称
    app.component("ElIcon", comp as SFCWithInstall<T>);
  };
  return comp as SFCWithInstall<T>;
};
```

### 组件使用 install 导出一个插件

```ts
import { withInstall } from "@cobyte-ui/utils";
import Icon from "./src/icon.vue";
// 通过 withInstall 方法给 Icon 添加了一个 install 方法
const ElIcon = withInstall(Icon);
export default ElIcon;
// 导出 Icon 组件的 props
export * from "./src/icon";
```

### main.ts 注册全局组件

```ts
import ElIcon from "./components/icon/src/icon";
const components = [ElIcon];

// 是否已安装标识
const INSTALLED_KEY = Symbol("INSTALLED_KEY");
// 组件库插件

const ElementPlus = {
  install(app: App) {
    // 如果该组件库已经安装过了，则不进行安装
    if (app[INSTALLED_KEY]) return;
    // 将标识值设置为 true，表示已经安装了
    app[INSTALLED_KEY] = true;
    // 循环组件库中的每个组件进行安装
    components.forEach((c) => app.use(c));
  },
};

const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
```

## `<script setup>` 中可使用 defineOptions 宏

```shell
pnpm install unplugin-vue-define-options -D -w
```

配置

```ts
// ts
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-define-options/macros-global" /* ... */]
  }
}

// vite
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import DefineOptions from 'unplugin-vue-define-options/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), DefineOptions()],
})

```

使用

```vue
<script setup lang="ts">
defineOptions({
  name: "ElIcon",
});
</script>
```

动态设置组件名

```js
import type { Plugin } from 'vue'
// 通过 Vue 提供的 Plugin 类型和传进来的组件类型 T 的集合进行确定我们的组件类型具有 Plugin 类型方法，如 install 方法
export type SFCWithInstall<T> = T & Plugin
export const withInstall = <T>(comp: T) => {
  ;(comp as SFCWithInstall<T>).install = function (app) {
    // 动态设置组件的名称
    const { name } = comp as unknown as { name: string }
    app.component(name, comp as SFCWithInstall<T>)
  }
  return comp as SFCWithInstall<T>
}
```
