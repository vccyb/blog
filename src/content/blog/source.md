---
title: 源码系列
author: Chen YuBo
pubDatetime: 2024-04-26T16:04:05.712Z
draft: false
featured: true
description: "源码系列合集"
tags:
  - vue
---

## 目录

## 1 await-to-js

[await-to-js](/posts/await-to-js/)

Async await wrapper for easy error handling

一个处理promise的库，可以方便的在一个数组内获取成功和失败的promise信息
如果成功，返回`[null, result]`, 否者 `[error, undefined]`
