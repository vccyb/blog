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
