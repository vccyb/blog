---
title: 手写promise
author: Chen YuBo
pubDatetime: 2024-03-03T09:32:43.593Z
featured: false
draft: false
description: "手写promise"
tags:
  - promise
  - 手写源码
---

## 目录

## 基本实现

```js
class APromise {
  static PENDING = "PENDING";
  static FULFILLED = "FULFILLED";
  static REJECTED = "REJECTED";
  constructor(executor) {
    this.PromiseState = APromise.PENDING;
    this.PromiseResult = null;
    this.callbacks = [];
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(value) {
    if (this.PromiseState === APromise.PENDING) {
      this.PromiseState = APromise.FULFILLED;
      this.PromiseResult = value;
      // 先把本次同步的执行完，resolve的之后在执
      queueMicrotask(() => {
        this.callbacks.map(callback => {
          callback.onFulfilled(value);
        });
      });
    }
  }
  reject(reason) {
    if (this.PromiseState === APromise.PENDING) {
      this.PromiseState = APromise.REJECTED;
      this.PromiseResult = reason;
      queueMicrotask(() => {
        this.callbacks.map(callback => {
          callback.onRejected(reason);
        });
      });
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : reason => {
            throw reason;
          };

    const promise2 = new APromise((resolve, reject) => {
      if (this.PromiseState === APromise.PENDING) {
        this.callbacks.push({
          onFulfilled: value => {
            this.parse(promise2, onFulfilled(value), resolve, reject);
          },
          onRejected: value => {
            this.parse(promise2, onRejected(value), resolve, reject);
          },
        });
      }
      if (this.PromiseState === APromise.FULFILLED) {
        // 下一次执行
        queueMicrotask(() => {
          this.parse(
            promise2,
            onFulfilled(this.PromiseResult),
            resolve,
            reject
          );
        });
      }

      if (this.PromiseState === APromise.REJECTED) {
        // 下一次执行
        queueMicrotask(() => {
          this.parse(promise2, onRejected(this.PromiseResult), resolve, reject);
        });
      }
    });
    return promise2;
  }

  parse(promise2, result, resolve, reject) {
    if (promise2 === result) {
      throw new TypeError("Chaining cycle detected for promise");
    }
    try {
      if (result instanceof APromise) {
        result.then(resolve, reject);
      } else {
        resolve(result);
      }
    } catch (e) {
      reject(e);
    }
  }
}
```
