---
title: lodash-get 分析
author: Chen YuBo
pubDatetime: 2024-05-01T16:04:05.712Z
draft: false
featured: false
description: "lodash-get"
tags:
  - vue
---

## 目录

## 1 lodash-get

lodash中有个get函数，支持从对象中方便的获取对应的属性值

总的来说有几个特点：

1. 字符串或者数组形式的嵌套获取对象属性值
2. 获取不到时候的默认值

## 2 源码分析

```js
function get(object, path, defaultValue) {
  let obj = object;
  // 将字符串改造为数组形式
  if (typeof path === "string") {
    const reg = /^[\[\].]+/g;
    path = path.match(reg);
  }
  for (const key of path) {
    if (!obj) {
      return defaultValue;
    }
    obj = object[key];
  }
  return obj === undefined ? defaultValue : obj;
}

export default get;
```

## 3 测试

```js
const object = { a: [{ b: { c: 3 } }] };

// console.log(get(object, ["a", "0", "b", "c"], "default")); // 输出: 3
console.log(get(object, "a[0].b.c", "default")); // 输出: "default"
```
