---
title: "LeetCode JavaScript 30题"
date: 2024-05-07T12:25:58.155Z
description: "leetcode的js的30个相关小练习，地址是这个https://leetcode.cn/studyplan/30-days-of-javascript/"
---

地址：https://leetcode.cn/studyplan/30-days-of-javascript/

## 1 Hello World

```ts
function createHelloWorld() {
  return function (...args): string {
    return "Hello World";
  };
}
```

## 2 计数器

```ts
function createCounter(n: number): () => number {
  let res = n;
  return function () {
    return res++;
  };
}
```

## 3 相等还是不相等

```ts
type ToBeOrNotToBe = {
  toBe: (val: any) => boolean;
  notToBe: (val: any) => boolean;
};

function expect(val: any): ToBeOrNotToBe {
  return {
    toBe: (v: any) => {
      if (v !== val) throw Error("Not Equal");
      return true;
    },
    notToBe: (v: any) => {
      if (v === val) throw Error("Equal");
      return true;
    },
  };
}
```

## 4 计数器 II

```ts
type Counter = {
  increment: () => number;
  decrement: () => number;
  reset: () => number;
};

function createCounter(init: number): Counter {
  let currentCount = init;
  return {
    increment() {
      currentCount++;
      return currentCount;
    },
    decrement() {
      currentCount--;
      return currentCount;
    },
    reset() {
      currentCount = init;
      return currentCount;
    },
  };
}
```
