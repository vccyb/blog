---
title: Parallel, Sequence, Race Promises
author: Chen YuBo
date: 2024-02-27T15:00:02.813Z
featured: false
category: HTML-CSS-JS
draft: false
description: "Parallel, Sequence, Race Promises"
tags:
  - promise
---

有时有，对于一组 Promise，我们有着不同的处理方法

可能是，并行处理，可能是，串行处理，也可能是，竞争处理

让我们看看三种处理的代码是如何的？

先准备一下

```js
const promisify = (item, delay) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(item);
    }, delay);
  });
};

const a = () => promisify("a", 1000);
const b = () => promisify("b", 5000);
const c = () => promisify("c", 3000);
```

## Parallel

```js
async function parallel() {
  const promises = [a(), b(), c()];
  const [output1, output2, output3] = await Promise.all(promises);
  return `parallel is done: ${output1} ${output2} ${output3}`;
}

parallel().then(output => {
  console.log(output);
}
```

## Race

```js
async function race() {
  const promises = [a(), b(), c()];
  const output = await Promise.race(promises);
  return `race is done: ${output}`;
}
```

## Sequence

```js
async function sequence() {
  const output1 = await a();
  const output2 = await b();
  const output3 = await c();
  return `sequence is done: ${output1} ${output2} ${output3}`;
}
```
