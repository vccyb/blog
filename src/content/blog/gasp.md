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
