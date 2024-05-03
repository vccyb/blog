---
title: arrfy 分析
author: Chen YuBo
date: 2024-04-26T16:04:05.712Z
draft: false
category: 源码分析
featured: false
description: "arrfy 源码分析"
tags:
---

## arrfy 的作用

作用很简单，就是将传入的值，用数组的形式进行返回

## arrfy 源码解析

```js
export default function arrify(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return [value];
  }

  if (typeof value[Symbol.iterator] === "function") {
    return [...value];
  }

  return [value];
}
```
