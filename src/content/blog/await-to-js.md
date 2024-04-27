---
title: await-to-js 分析
author: Chen YuBo
pubDatetime: 2024-04-26T16:04:05.712Z
draft: false
featured: false
description: "await-to-js"
tags:
  - vue
---

## 目录

## 1 await-to-js

Async await wrapper for easy error handling
Async await 封装器可轻松处理错误

下载了await-to-js，他自己有个doc，可以打开来看看

有个介绍用法

```js
import to from "await-to-js";
// If you use CommonJS (i.e NodeJS environment), it should be:
// const to = require('await-to-js').default;

async function asyncTaskWithCb(cb) {
  let err, user, savedTask, notification;

  [err, user] = await to(UserModel.findById(1));
  if (!user) return cb("No user found");

  [err, savedTask] = await to(
    TaskModel({ userId: user.id, name: "Demo Task" })
  );
  if (err) return cb("Error occurred while saving task");

  if (user.notificationsEnabled) {
    [err] = await to(
      NotificationService.sendNotification(user.id, "Task Created")
    );
    if (err) return cb("Error while sending notification");
  }

  if (savedTask.assignedUser.id !== user.id) {
    [err, notification] = await to(
      NotificationService.sendNotification(
        savedTask.assignedUser.id,
        "Task was created for you"
      )
    );
    if (err) return cb("Error while sending notification");
  }

  cb(null, savedTask);
}

async function asyncFunctionWithThrow() {
  const [err, user] = await to(UserModel.findById(1));
  if (!user) throw new Error("User not found");
}
```

还有一个ts的用法

```ts
interface ServerResponse {
  test: number;
}

const p = Promise.resolve({ test: 123 });

const [err, data] = await to<ServerResponse>(p);
console.log(data.test);
```

## 2 库的作用

通过上述两段实例，我们可以发现这个库的作用是很明晰的

就是通过暴露的to，然后将错误状态和成功状态再同一个层级，一个数组结构返回了

通过使用此库提供的 to 函数，我们可以同时处理 Promise 的成功和失败情况，返回一个结构如 [error, result] 的数组。
在成功时，你会收到 [null, result]，而在失败时，你会收到包含错误信息的数组 [error, undefined]。

优势：我们不再需要过多的try-catch

## 3 源码分析

核心就是err和result放到一个数组了

```ts
/**
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parseError = Object.assign({}, err, errorExt);
        return [parseError, undefined];
      }
      return [err, undefined];
    });
}

export default to;
```

注意：这里它处理的事原来promise的状态

说实话，还是蛮简单的，就是我们自己返回了一个promise

## 4 试一试吧

```ts
import to from "./await-to-js";

const A = () => {
  return Promise.reject("reject");
};

const B = () => {
  return Promise.resolve("resolve");
};

async function asyncOp() {
  const [error, result] = await to(A(), { customInfo: "请尽快修复bug" });
  if (error) {
    console.log("error =>", error);
    return;
  }
  console.log("success and result =>", result);
}

asyncOp();
```
