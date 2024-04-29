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

## 浏览器性能指标 Web Performance Metrics

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
