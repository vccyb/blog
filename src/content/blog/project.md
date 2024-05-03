---
title: 工程化相关集合
author: Chen YuBo
date: 2024-03-11T16:04:05.712Z
draft: false
category: 前端工程化
featured: true
description: "工程化一些"
tags:
  - vue
---

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

## 2 浏览器性能指标 Web Performance Metrics

https://www.bilibili.com/video/BV1Ep421R7TY/?spm_id_from=333.337.search-card.all.click&vd_source=ff519b14c2f26ffed121e75322acc97e

RAIL 模型

- Response 响应时间
- Animation 动画帧率
- Idle 空闲时间
- Load 加载时间

具体的指标

1. **LCP (Largest Contentful Paint) 最大内容绘制**
2. **FCP (First Contentful Paint) 首次内容绘制**
3. CLS (Cumulative Layout Shift) 累计布局偏移
4. TBT (Total Blocking Time) 总阻塞时间

上面的都是实验室指标 只能参考

用户数据 服务监控/数据埋点

## 3 CORS 跨域

1. 同源策略

CORS 是一套机制，用于浏览器校验跨域请求

服务器表示通过，校验通过
服务器拒绝或者没有表示，则校验不通过

2. 使用的前提

   服务器上自己人

3. CORS 请求分类

简单请求：

- 请求方法是以下三种之一：HEAD, GET, POST
- HTTP 头部满足 CORS 安全规范 （简单理解，没有改动头就是简单）
- 请求头的 Content-Type 是以下三种之一：text/plain, multipart/form-data, application/x-www-form-urlencoded

非简单请求，会带一个预检请求

4. 两种请求的做法

- 简单请求

  - 浏览器直接发出 CORS 请求
    - 请求头中包含 Origin 字段，表示请求的源
  - 服务器返回响应，
    - 响应头中包含 Access-Control-Allow-Origin 字段，表示允许的源
    - 浏览器发现响应头中包含 Access-Control-Allow-Origin 字段，则浏览器认为跨域请求成功，否则失败

- 非简单请求

  - 浏览器先发出预检请求，询问服务器是否允许（options）
    - 带上 origin
    - Access-Control-Request-Method: 请求方法
    - Access-Control-Request-Headers: 请求头
  - 服务器返回响应，
    - 响应头中包含 Access-Control-Allow-Origin 字段，表示允许的源
    - Access-Control-Allow-Methods: 允许的请求方法
    - Access-Control-Allow-Headers: 允许的请求头
    - Access-Control-Max-Age: 预检请求的有效期，单位是秒
  - 通过，再发送真实请求

图解：

<div class="image-cols-2">
  <img src="/spinner.gif" data-src="/assets/images/project/cors-1.png">
  <img src="/spinner.gif" data-src="/assets/images/project/cors-3.png">
</div>
