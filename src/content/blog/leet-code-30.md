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

## 5 转换数组中的每个元素

```ts
function map(arr: number[], fn: (n: number, i: number) => number): number[] {
  let res = [];
  arr.forEach((item, index) => {
    res.push(fn(item, index));
  });
  return res;
}
```

## 6 过滤数组中的元素

```ts
type Fn = (n: number, i: number) => any;

function filter(arr: number[], fn: Fn): number[] {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i)) {
      res.push(arr[i]);
    }
  }
  return res;
}
```

## 7 数组归约运算

```ts
type Fn = (accum: number, curr: number) => number;

function reduce(nums: number[], fn: Fn, init: number): number {
  let accumulator = init;
  for (const element of nums) {
    accumulator = fn(accumulator, element);
  }
  return accumulator;
}
```

## 9 复合函数

```ts
type F = (x: number) => number;

function compose(functions: F[]): F {
  return function (x) {
    if (functions.length === 0) return x;
    let input = x;
    for (let i = functions.length - 1; i >= 0; i--) {
      const currFunc = functions[i];
      input = currFunc(input);
    }
    return input;
  };
}
```

## 10 返回传递的参数的长度

```ts
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

function argumentsLength(...args: JSONValue[]): number {
  return args.length;
}
```
