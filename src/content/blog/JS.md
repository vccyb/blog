---
title: js相关技巧集合
author: Chen YuBo
pubDatetime: 2024-03-11T16:04:05.712Z
featured: false
draft: false
description: "js相关技巧集合"
tags:
  - sql
---

## 1 请求的取消

https://www.bilibili.com/video/BV1Yw411S7uc/?spm_id_from=333.788.recommend_more_video.0&vd_source=ff519b14c2f26ffed121e75322acc97e

有时候我们会有请求连续发送，根据结果展示的情况，我们可能需要取消前一次的请求，如果我们连续发送请求，可能我们想要的是最后一次请求的返回的内容，而不是之前的。这时候我们就需要取消之前的请求（如果还没有返回的话）

核心就是使用`AbortController`这个对象，它包含一个`abort`方法，调用这个方法可以取消当前的控制器。

```js
let controller = null;
input.oninput = async () => {
  controller && controller.abort(); // 取消前一次请求
  controller = new AbortController(); // 控制器
  try {
    const list = await fetchData("xxx" + input.value, {
      signal: controller.signal, // 控制器的信号
    }).then(resp => resp.json());
  } catch (e) {
    console.log("请求被取消");
  }
  createList(list);
};
```

axios取消请求

关于 axios，axios其实有两种取消请求的方式，一种是`cancelToken`，一种是`abort`。
不过现在官网也推荐我们使用abort这种方式了，代码也是很类似的

```js
const controller = new AbortController();

axios
  .get("/foo/bar", {
    signal: controller.signal,
  })
  .then(function (response) {
    //...
  });
// 取消请求
controller.abort();
```
