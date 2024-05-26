---
title: vue相关集合
author: Chen YuBo
date: 2024-03-11T16:04:05.712Z
draft: false
category: Vue
featured: true
description: "vue相关集合"
tags:
  - vue
---

## 1 `v-size-ob` 指令

https://www.bilibili.com/video/BV18c411y7oi/?spm_id_from=333.337.search-card.all.click&vd_source=ff519b14c2f26ffed121e75322acc97e

`sizeDirect.js`

```js
const map = new WeakMap();
const ob = new ReactiveSizeObserver((entries) => {
  for (const entry of entries) {
    // 这个元素对应的回掉函数
    const handler = map.get(entry.target);
    if (handler) {
      const rect = entry.borderBoxSize[0]; // 默认border盒子
      handler({
        width: rect.inlineSize,
        height: rect.blockSize,
      });
    }
  }
});

export default {
  mounted(el, binding) {
    // 开启监听, 监听尺寸变化
    ob.observe(el);
    // binding.value 就是传给指令的值,绑定执行回掉的函数
    map.set(el, binding.value);
  },
  unmounted() {
    // 取消监听
    ob.unobserve(el);
  },
};
```

记得注册一下指令

```js
import sizeDirect from "./sizeDirect";
app.directive("size-ob", sizeDirect);
```

使用的时候

```vue
<div v-size-ob="handleSizeChange">...</div>
```

## 2 vue2 中 props 中的 default 中没有 this

在开发过程中，碰到过 props 默认值的问题，由尝试使用 this.xxx 作为默认值，发现都不行

```js
// 1
default: () => {
  console.log("default", this); // undefined
  return this.getChildMSg();
},
// 2.
default() {
  console.log("default", this); // undefined
  return this.getChildMSg();
},

// 3.
default: function () {
  return function (vm) {
    console.log("default", vm); // 会报类型的问题
    return vm.getChildMSg();
  };
},

```

这几种写法的问题：

1. 第一种写法，箭头函数，没有 this，也就是使用当前的 this，但是当前的 this 不是组件示例
2. 第二种写法的问题，这可能是因为此时 props 的默认值在组件实例化之前计算，导致 this 指向为 undefined。
3. 直接就是类型错误了

怎么解决，就是默认值不要去使用 this 这种, 简单在别的地方使用即可

```js
default: ''
{{ msg ? msg : '你想要的默认值' }}
```

## 3 vue 中读取文件的原始值

这里要分 vue2 和 vue3 两种来看

1. vue2 他是使用 vue-cli 基于的是 webpack，文件需要 loader
   所以需要告诉 webpack 给对应的 loader 处理，原始内容，可以使用 `raw-loader`

```js
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.dataurl$/,
          loader: "raw-loader",
        },
      ],
    },
  },
});
```

当然你记得安装一下这个 loader

使用的时候 引用即可，假设文件中是 base64

```ts
import dataurl from "./img.dataurl";
```

2. vite 呢？vue3 如果使用的是 vite

```ts
import dataurl from "./img.dataurl?raw";
```

使用 raw 后缀即可,获取就是文件内容 string

3. 其他的思路
   其他的思路就不是读取原始文件了，可以将放到 js 文件中，然后到处

```ts
export default "xxxx base64";
```

## 4 vue 中写样式的方式

1. 直接在 style 中写

```css
<style>
.red {
  color: red;
}
</style>
```

缺陷：类名冲突

2. scoped

```css
<style scoped>
.red {
  color: red;
}
</style>
```

vue 会给每一个元素加一个特殊属性 data-v-xxxx

你写的 选择器会带上这个属性选择器

```css
.red[data-v-xxxx] {
  color: red;
}
```

3. 使用一些 css 预编译器

```vue
<style lang="scss" scoped>
.red {
  color: red;
}
</style>
```

4. 组件样式提出去

```vue
<style src="./xxx.css" scoped></style>
```

## 5 组件命名

主要有两种：

1. 大驼峰 PascalCase StarRate （只能在脚手架情况下使用，工程化是交给构建工具的）

- 模板使用： `<StarRate/>` `<StarRate></StarRate>`
- 模板还支持：`<star-rate/>` `<star-rate></star-rate>`

2. 短横线 kebab-case StarRate

- 模板使用： `<star-rate/>` `<star-rate></star-rate>`

大驼峰是更加灵活的

```js
import StarRate from "./StarRate.vue";
export default {
  components: {
    StarRate,
  },
  // ...
};
```

几个推荐：

1. 命名大驼峰
2. 模板书写-大驼峰 区别 html
3. 如果使用短横线， 加前缀，方便识别和区分 html
4. 统一使用一种风格

## 6 vue 中缓存方法

如果你不能使用 computed, 解决计算属性没有参数传递的问题

```js
export function useComputed(fn) {
  const cache = new Map();
  function compare(args1, args2) {
    return (
      args1.length === args2.length &&
      args1.every((item, index) => Object.is(item, args2[index]))
    );
  }
  function getCache(args) {
    const keys = [...cache.keys()];
    const key = keys.find((key) => compare(key, args));
    if (key) {
      return cache.get(key);
    }
  }
  return function (...args) {
    const cachedResult = getCache(args);
    if (cachedResult) {
      return cachedResult.value;
    }
    const result = computed(() => fn(...args));
    cache.set(args, result);
    return result.value;
  };
}
```

使用

```js
function fn() {...}

const computedPrice = useComputed(fn);
```

## 7 展示组件和容器组件的分离

容器组件搞定逻辑
展示组件搞定界面

## 8 vue 方法中属性丢失的问题

```
methods
  querySearch

实例

this.querySearch = methods.querySearch.bind(this)

```

所以 实例上绑定的是 新方法 `bind`会返回一个新函数

简单解决，就是把方法放到 data 上就行了

## 9 防抖 + vue

我们常用的写法

```js
import { debounce } from "lodash";
const text = ref("");
const inputHandler = (e) => {
  text.value = e.target.value;
};
const debounceHandler = debounce(inputHandler, 1000); // 去使用这个函数
```

自定义 Ref 方式

```js title="debounceRef.js"
import { customRef } from "vue";
export function debounceRef(value, duration = 1000) {
  let timer;
  return customRef((track, trigger) => {
    return {
      get() {
        // 收集依赖
        track();
        return value;
      },
      set(val) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          // 派发更新
          trigger();
          value = val;
        }, duration);
      },
    };
  });
}
```

使用

```js
import { debounceRef } from ./debounceRef";
const text = debounceRef("", 500);
```
