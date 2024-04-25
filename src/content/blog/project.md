---
title: 工程化相关集合
author: Chen YuBo
pubDatetime: 2024-03-11T16:04:05.712Z
draft: false
featured: true
description: "工程化一些"
tags:
  - vue
---

## 目录

## 1 对等依赖报错处理

一般报错信息是：
unable to resolve dependency tree ....

```
project 主项目
  vue 3.0.0
  my-vue-plugin  (针对vuexx)
    peerDependencies  表示的对等依赖，没有直接依赖关系，但是用它需要一个对等的版本
```

如果你真的确定无影响，

```
npm i --legacy-peer-deps // 只是忽略安装的报错，运行是咋样还咋样
```
