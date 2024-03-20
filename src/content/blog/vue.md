---
title: vue相关集合
author: Chen YuBo
pubDatetime: 2024-03-11T16:04:05.712Z
featured: false
draft: false
description: "vue相关集合"
tags:
  - vue
---

## 1 `v-size-ob` 指令

https://www.bilibili.com/video/BV18c411y7oi/?spm_id_from=333.337.search-card.all.click&vd_source=ff519b14c2f26ffed121e75322acc97e

`sizeDirect.js`

```js
const map = new WeakMap();
const ob = new ReactiveSizeObserver(entries => {
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

## 2 vue2 中 default中没有this

在开发过程中，碰到过props默认值的问题，由尝试使用this.xxx 作为默认值，发现都不行

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

1. 第一种写法，箭头函数，没有this，也就是使用当前的this，但是当前的this不是组件示例
2. 第二种写法的问题，这可能是因为此时 props 的默认值在组件实例化之前计算，导致 this 指向为 undefined。
3. 直接就是类型错误了

怎么解决，就是默认值不要去使用this这种, 简单在别的地方使用即可

```js
default: ''
{{ msg ? msg : '你想要的默认值' }}
```
