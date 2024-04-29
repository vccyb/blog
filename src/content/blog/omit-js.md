---
title: omit.js 分析
author: Chen YuBo
pubDatetime: 2024-04-26T16:04:05.712Z
draft: false
featured: false
description: "omit.js"
tags:
  - vue
---

## 目录

## 1 omit.js库的使用

可以通过单元测试看下

```js
describe("omit", () => {
  it("should create shallow copy", () => {
    const benjy = { name: "Benjy", a: 1 };
    const copy = omit(benjy, []);
    // 用来测试 copy 和 benjy 的递归深度属性是否相同 和 俩个对象的浅层内存是否不同
    expect(copy).toEqual(2{ name: "Benjy", a: 1 });
    expect(benjy).not.toBe(copy);
  });

  it("should drop fields which are passed in", () => {
    const benjy = { name: "Benjy", age: 18 };
    // 用 omit 来剔除属性后 来校验 深度属性是否相同
    expect(omit(benjy, ["age"])).toEqual({ name: "Benjy" });
    expect(omit(benjy, ["age", "name"])).toEqual({});
  });
});
```

omit 就是ts里面的那个omit工具类型一样的作用，剔除某个属性

## 2 源码

```js
/**
 *
 * @param {object} obj
 * @param {string[]} fields
 */
export function omit(obj, fields) {
  const shallowCopy = Object.assign({}, obj);
  for (let index = 0; index < fields.length; index++) {
    const key = fields[index];
    delete shallowCopy[key];
  }
  return shallowCopy;
}
```

## 3 补充 toBe 和 toEqual

1. toEqual用于检查两个对象的值是否相等。它会递归比较对象的所有属性值，而不仅仅是检查它们是否是同一个对象。
   适用于检查对象、数组等复杂数据结构的内容是否相等。
2. toBe用于检查两个对象是否是同一个对象（在内存中的引用是否相同）。
   适用于检查两个变量是否引用了同一个实际对象，而不关心它们的内容是否相同。
