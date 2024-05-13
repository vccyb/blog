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

## 11 只允许一次函数调用

```ts
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
type OnceFn = (...args: JSONValue[]) => JSONValue | undefined;

function once(fn: Function): OnceFn {
  let isCalled = false;
  return function (...args) {
    if (isCalled) return undefined;
    isCalled = true;
    return fn(...args);
  };
}
```

## 12 记忆函数

```ts
type Fn = (...params: number[]) => number;

function memoize(fn: Fn): Fn {
  const cache = {};
  return function (...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const functionOutput = fn(...args);
    cache[key] = functionOutput;
    return functionOutput;
  };
}
```

## 13 两个 Promise 对象相加

```ts
type P = Promise<number>;

async function addTwoPromises(promise1: P, promise2: P): P {
  const [a, b] = await Promise.all([promise1, promise2]);
  return a + b;
}
```

## 14 睡眠函数

```ts
async function sleep(millis: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve();
      }, millis);
    } catch (err) {
      reject(err);
    }
  });
}
```

## 15 执行可取消的延迟函数

```ts
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
type Fn = (...args: JSONValue[]) => void;

function cancellable(fn: Fn, args: JSONValue[], t: number): Function {
  const timer = setTimeout(() => {
    fn(...args);
  }, t);
  return () => {
    clearTimeout(timer);
  };
}
```

## 16 间隔取消

```ts
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
type Fn = (...args: JSONValue[]) => void;

function cancellable(fn: Fn, args: JSONValue[], t: number): Function {
  fn(...args);
  const timer = setInterval(() => {
    fn(...args);
  }, t);

  return () => {
    clearInterval(timer);
  };
}
```

## 17 有时间限制的 Promise 对象

```ts
type Fn = (...params: any[]) => Promise<any>;

function timeLimit(fn: Fn, t: number): Fn {
  return async function (...args) {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) =>
        setTimeout(() => reject("Time Limit Exceeded"), t)
      ),
    ]);
  };
}
```

## 18 有时间限制的缓存

```ts
class TimeLimitedCache {
  private cache;
  constructor() {
    this.cache = new Map();
  }

  set(key: number, value: number, duration: number): boolean {
    const existed = this.cache.get(key);
    this.cache.set(key, {
      value: value,
      duration: Date.now() + duration,
    });
    if (existed) {
      return existed.duration >= Date.now();
    } else {
      return false;
    }
  }

  get(key: number): number {
    const existed = this.cache.get(key);
    if (existed) {
      if (existed.duration >= Date.now()) return existed.value;
      this.cache.delete(key);
    }
    return -1;
  }

  count(): number {
    return [...this.cache.values()].filter((el) => el.duration >= Date.now())
      .length;
  }
}
```

## 19 函数防抖

```ts
function debounce(fn: F, t: number) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, ...args);
    }, t);
  };
}
```

## 20 并行执行异步函数

```ts
type Fn<T> = () => Promise<T>;

function promiseAll<T>(functions: Fn<T>[]): Promise<T[]> {
  return new Promise((resovle, reject) => {
    if (functions.length === 0) {
      resovle([]);
      return;
    }

    const res = new Array(functions.length).fill(null);
    let reslovedCount = 0;
    functions.forEach(async (el, idx) => {
      try {
        const subResult = await el();
        res[idx] = subResult;
        reslovedCount++;
        if (reslovedCount === functions.length) {
          resovle(res);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}
```

## 21 判断对象是否为空

```ts
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
type Obj = Record<string, JSONValue> | JSONValue[];

function isEmpty(obj: Obj): boolean {
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  return Object.keys(obj).length === 0;
}
```

## 22 分块数组

```ts
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
type Obj = Record<string, JSONValue> | Array<JSONValue>;

function chunk(arr: Obj[], size: number): Obj[][] {
  const result = [];
  for (let i = 0; i < arr.length; i = i + size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
```

## 23 数组原型对象的最后一个元素

```ts
declare global {
  interface Array<T> {
    last(): T | -1;
  }
}

Array.prototype.last = function () {
  if (this.length === 0) {
    return -1;
  }
  return this[this.length - 1];
};
```

## 24 分组

```js
/**
 * @param {Function} fn
 * @return {Object}
 */
Array.prototype.groupBy = function (fn) {
  const map = new Map();
  this.forEach((item) => {
    const key = fn(item);
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  });
  const ans = {};
  for (let [key, val] of map) {
    ans[key] = val;
  }
  return ans;
};

/**
 * [1,2,3].groupBy(String) // {"1":[1],"2":[2],"3":[3]}
 */
```

## 25 排序方式

```js
/**
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 */
var sortBy = function (arr, fn) {
  return arr.sort((a, b) => fn(a) - fn(b));
};
```

## 26 根据 ID 合并两个数组

```js
/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Array}
 */
var join = function (arr1, arr2) {
  const datas = new Map();
  for (let item of arr1) {
    update(item, datas);
  }
  for (let item of arr2) {
    update(item, datas);
  }

  return [...datas.values()].sort((a, b) => a.id - b.id);
};

function update(change, datas) {
  let target = {};
  if (datas.has(change.id)) target = datas.get(change.id);
  else datas.set(change.id, target);

  for (let key of Object.keys(change)) {
    target[key] = change[key];
  }
}
```

## 27 扁平化嵌套数组

```js
/**
 * @param {Array} arr
 * @param {number} depth
 * @return {Array}
 */
var flat = function (arr, n) {
  if (n <= 0) return arr;
  const res = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      res.push(...flat(item, n - 1));
    } else {
      res.push(item);
    }
  }
  return res;
};
```
