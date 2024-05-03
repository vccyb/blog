---
title: 学习CSS动画 一点点深入
author: Chen YuBo
date: 2024-02-18T14:08:58.680Z
featured: false
category: HTML-CSS-JS
draft: false
description: "基于 Chokcoco 深入浅出 CSS 动画 文章学习，一点点深入吧"
tags:
  - CSS
  - Animation
---

## CSS 动画基本介绍

动画包括两个部分: 描述动画的样式规则和用于指定动画开始、结束以及中间点样式的关键帧。

- 描述动画的规则 `animation: xxx`
- 指定动画的开始、结束以及中间点样式的关键帧 `@keyframes xxx`

```css
div {
  animation: change 3s;
}

@keyframes change {
  0% {
    color: #f00;
  }
  100% {
    color: #000;
  }
}
```

## CSS 动画语法

- 创建动画的时候
  需要使用`animation`属性或其子属性，该属性允许配置动画时间、时长以及其他动画细节，但该属性不能配置动画的实际表现，动画的实际表现是由`@keyframes`规则实现。
- 而`animation` 的子属性有很多

```
animation-name：指定由 @keyframes 描述的关键帧名称。
animation-duration：设置动画一个周期的时长。
animation-delay：设置延时，即从元素加载完成之后到动画序列开始执行的这段时间。
animation-direction：设置动画在每次运行完后是反向运行还是重新回到开始位置重复运行。
animation-iteration-count：设置动画重复次数， 可以指定 infinite 无限次重复动画
animation-play-state：允许暂停和恢复动画。
animation-timing-function：设置动画速度， 即通过建立加速度曲线，设置动画在关键帧之间是如何变化。
animation-fill-mode：指定动画执行前后如何为目标元素应用样式
@keyframes 规则，当然，一个动画想要运行，还应该包括 @keyframes 规则，在内部设定动画关键帧
```

对于一个动画：
必选项：`animation-name`、`animation-duration` 和 `@keyframes`规则

### `animation-name` 和 `animation-duration`

- `animation-name` 指定由 `@keyframes` 描述的关键帧名称。 (CSS 引擎回去找到对应由 keyframes 定义的动画)
- `animation-duration` 设置动画一个周期的时长。

### `animation-delay`

- `animation-delay` 设置延时，即从元素加载完成之后到动画序列开始执行的这段时间。

关于简写

```css
animation: move 2s 1s;
```

2s 就是 duration，1s 就是 delay

同时 delay 是可以为负值的

delay 的技巧可以看：https://juejin.cn/post/7052506940777168927?searchId=20240218215548147B9DC4344BF987A35F#heading-16

### `animation-timing-function` 缓动函数

1. 三次贝塞尔曲线缓动函数

```
/* Keyword values */
animation-timing-function: ease;  // 动画以低速开始，然后加快，在结束前变慢
animation-timing-function: ease-in;  // 动画以低速开始
animation-timing-function: ease-out; // 动画以低速结束
animation-timing-function: ease-in-out; // 动画以低速开始和结束
animation-timing-function: linear; // 匀速，动画从头到尾的速度是相同的
```

2. 步骤缓动函数

```
{
    /* Keyword values */
    animation-timing-function: step-start;
    animation-timing-function: step-end;

    /* Function values */
    animation-timing-function: steps(6, start)
    animation-timing-function: steps(4, end);
}
```

### `animation-play-state`

```
{
    animation-play-state: paused | running;
}
```

它可以控制动画的状态 -- 运行或者暂停。类似于视频播放器的开始和暂停。是 CSS 动画中有限的控制动画状态的手段之一
