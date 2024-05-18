---
title: "service worker"
date: 2024-05-18T18:39:07.885Z
---

## service worker 的 基本概念

<img data-src="/assets/images/sw/service-work-01.png">

1. Service Worker 运行在浏览器的独立线程中，与主线程（UI 线程）分离，因此无法直接访问 DOM。

## 一些使用场景

1. 离线缓存

通过 service worker 实现离线的缓存机制，减少对网络可用性的依赖，改善用户体验，并且为候选的请求提供更快的加载时间

2. 后台操作

比如使用 service worker 定期检查应用是否需要更新，并通知用户
