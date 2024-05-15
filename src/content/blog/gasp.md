---
title: "GASP学习"
date: 2024-05-11T12:25:58.155Z
description: "学习GASP，加强前端技能"
---

这里我们以油管博主的一个教程来看

## 1 什么是 GSAP

官网其实有一段介绍:适用于专业人员的强大 JavaScript 动画库

> A wildly robust JavaScript animation library built for professionals

动画的关键是体验增强：帮助我们增强用户体验，留存用户

## 2 基础工程搭建

我们现搞个基础 base 的模板，然后再用 gsap 玩一玩

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div id="box"></div>
    <script src="script.js"></script>
  </body>
</html>
```

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
}

#box {
  height: 300px;
  width: 300px;
  background-color: blueviolet;
}
```

## 3 使用 GSAP

这里我们使用 GSAP CDN，可以用 bootCDN 的地址即可

```html
...
<script src="https://cdn.bootcdn.net/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="script.js"></script>
```

## 4 盒子小动画

```js
gsap.to("#box", {
  x: 200, // 水平方向移动200像素
  duration: 2, // 动画持续时间
  delay: 1, // 动画延迟1秒再执行
});
```

就和我们写 css 动画一样，很方便

### 4.1 gsap.to 和 gsap.from 的区别

```js
gsap.to("#box1", {
  x: 1200,
  duration: 2,
  delay: 1,
  rotate: 360,
  backgroundColor: "blue",
  borderRadius: "50%",
  scale: 0.5,
});

gsap.from("#box2", {
  x: 1200,
  duration: 2,
});
```

<img data-src="/assets/images/gifs/gsap-box.gif"/>

## 5 文字动画 与 stagger

```js
gsap.from("h1", {
  opacity: 0,
  duration: 1,
  y: 30,
  stagger: 0.3,
});
```

> 0.3: stagger 属性设置了动画之间的时间间隔。在这个例子中，如果页面上有多个 h1 元素，每个后续 h1 元素的动画将比前一个延迟 0.3 秒开始。如果只有一个 h1 元素，stagger 属性将不会对动画产生影响，因为没有什么可以被错开

## 6 无限动画 repeat 和 反向播放 yoyo

```js
gsap.to("#box", {
  x: 1000,
  duration: 2,
  delay: 1,
  rotate: 360,
  repeat: -1,
  yoyo: true,
});
```

## 7 时间的控制

### 7.1 duraton 和 delay

```js
gsap.to("#box", {
  x: 1000,
  duration: 2,
  delay: 1,
  rotate: 360,
  // yoyo: true,
});

gsap.to("#box1", {
  x: 1000,
  duration: 2,
  delay: 3,
  rotate: 360,
});

gsap.to("#box2", {
  x: 1000,
  duration: 2,
  delay: 5,
  scale: 0.5,
});
```

主要就是控制 duration 和 delay

### 7.2 timeline

上面的写法可以改造为 timeline 的写法

```js
gsap
  .timeline({
    defaults: { duration: 2 }, // 设置时间线的默认持续时间为2秒
  })
  .to("#box", {
    x: 1000,
    rotate: 360,
    // yoyo: true, // 如果你想在时间线中使用 yoyo 效果，可以在这里添加
  })
  .to("#box1", {
    x: 1000,
    rotate: 360,
  })
  .to("#box2", {
    x: 1000,
    scale: 0.5,
  });
```

- 同步性：
  - Timeline：在 Timeline 中，动画是同步进行的，这意味着你可以控制动画的开始、结束和持续时间，以及它们之间的相对顺序。
  - gsap.to()：如果你使用多个 gsap.to() 调用，除非它们被添加到同一个 Timeline，否则它们将默认同时开始，并且它们的同步性不能被控制。
- 嵌套：
  - Timeline：可以创建嵌套的 Timeline，这意味着你可以在一个 Timeline 内部开始另一个 Timeline，这样可以创建复杂的、多层次的动画序列。
  - gsap.to()：gsap.to() 调用本身不能被嵌套，但你可以并排使用它们来创建多个动画。
- 控制：
  - Timeline：提供了更高级的控制，如全局速度控制、更容易的倒放和更复杂的回调函数。
  - gsap.to()：提供了基本的动画控制，但要实现更高级的功能，可能需要更多的代码和逻辑。
- 回调和事件：
  - Timeline：可以在 Timeline 的特定时间点添加回调，或者监听 Timeline 的事件，如开始、更新、重复和完成。
  - gsap.to()：每个 gsap.to() 动画可以有自己的回调，但要实现跨多个动画的复杂逻辑，可能需要额外的代码。
- 性能：
  - Timeline：通过将多个动画组织到一个 Timeline 中，可以减少浏览器的重绘和重排次数，从而提高性能。
  - gsap.to()：单独的动画可能不会导致性能问题，但如果有大量的动画同时进行，并且它们没有被有效地组织，可能会影响性能。
- 代码组织：
  - Timeline：提供了一种更清晰、更结构化的方式来组织动画代码，使得维护和更新更容易。
  - gsap.to()：虽然使用 gsap.to() 可以快速简单地创建动画，但随着动画逻辑的复杂化，代码可能会变得更加难以管理。

### 7.3 timeline Demo

```html
<div id="nav">
  <h2>sheryians</h2>
  <div id="part2">
    <h4>Work</h4>
    <h4>About</h4>
    <h4>Courses</h4>
    <h4>Blog</h4>
  </div>
</div>

<h1>Chenyubo Coding Cool</h1>
```

```css
#nav {
  background-color: blueviolet;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  padding: 30px 50px;
}

#part2 {
  display: flex;
  gap: 50px;
}
h1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  white-space: nowrap;
}
```

```js
let tl = gsap.timeline();

tl.from("h2", {
  y: -20,
  opacity: 0,
  duration: 1,
  delay: 0.5,
});

tl.from("h4", {
  y: -20,
  opacity: 0,
  duration: 1,
  stagger: 0.3,
});

tl.from("h1", {
  y: 20,
  opacity: 0,
  duration: 0.5,
  scale: 0.2,
});
```

<img data-src="/assets/images/gifs/gsap-nav.gif"/>

## 8 ScrollTrigger

```html
<div id="page1">
  <div id="box"></div>
</div>
<div id="page2">
  <div id="box"></div>
</div>
<div id="page3">
  <div id="box"></div>
</div>
```

记得引 scrollTrigger 的 cdn

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
}

#page1 {
  height: 100%;
  width: 100%;
  background-color: lightblue;
  display: flex;
  justify-content: center;
  align-items: center;
}

#page2 {
  height: 100%;
  width: 100%;
  background-color: rgb(39, 196, 248);
  display: flex;
  justify-content: center;
  align-items: center;
}

#page3 {
  height: 100%;
  width: 100%;
  background-color: rgb(8, 130, 191);
  display: flex;
  justify-content: center;
  align-items: center;
}

#box {
  height: 300px;
  width: 300px;
  background-color: crimson;
}
```

js

```js
gsap.from("#page1 #box", {
  scale: 0,
  delay: 1,
  duration: 2,
  rotate: 360,
});

gsap.from("#page2  #box", {
  scale: 0,
  delay: 1,
  duration: 2,
  rotate: 360,
  scrollTrigger: "#page2 #box",
});
```
