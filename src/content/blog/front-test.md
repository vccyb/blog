---
title: 前端测试合集
author: Chen YuBo
pubDatetime: 2024-04-27T16:04:05.712Z
draft: false
featured: true
description: "前端测试合集"
tags:
  - vue
---

## 目录

## 1 给jest 添加 babel 支持 ESModule的import导入

1. 添加babel

```shell
pnpm add @babel/core @babel/preset-env
```

2. 配置.babelrc

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```

好，之后测试就可以使用import导入你要测试的函数了

## 2 jest 中的 toEqual 和 toBe

1. toEqual

- `toEqual`用于检查两个对象的值是否相等。它会递归比较对象的所有属性值，而不仅仅是检查它们是否是同一个对象。
- 适用于检查对象、数组等复杂数据结构的内容是否相等。

```js
expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 }); // 通过
```

2. toBe

- `toBe`用于检查两个对象是否是同一个对象（在内存中的引用是否相同）。
- 适用于检查两个变量是否引用了同一个实际对象，而不关心它们的内容是否相同。

```js
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
const obj3 = obj1;

expect(obj1).toBe(obj3); // 通过，因为它们引用了同一个对象
expect(obj1).not.toBe(obj2); // 通过，因为它们引用了不同的对象
```
