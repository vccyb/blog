---
title: "GSAP学习"
date: 2024-05-11T12:25:58.155Z
description: "学习GSAP，加强前端技能"
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

### 8.1 对象写法

```js
gsap.from("#page2  #box", {
  scale: 0,
  duration: 2,
  rotate: 360,
  scrollTrigger: {
    trigger: "#page2 #box",
    scroller: "body",
    markers: true,
    start: "top 60%",
  },
});
```

trigger: 指定了触发动画的元素，这里是 "#page2 #box"。

scroller: 指定了滚动的容器。在这个例子中，"body" 表示滚动将基于 body 元素。如果你的页面有特定的滚动容器，你可能需要指定它而不是 body。

markers: 当设置为 true 时，GSAP 将在 trigger 元素附近创建可视化标记，这可以帮助你了解动画触发的确切位置。这对于调试和精确控制动画非常有用。

start: 定义了动画开始的滚动位置。在这个例子中，"top 60%" 表示当 trigger 元素到达页面顶部 60% 的位置时，动画将开始。这个值可以是百分比，也可以是具体的像素值（如 "top 300px"）。

### 8.2 ScrollTrigger Demo

```js
gsap.from("#page2  h1", {
  opacity: 0,
  duration: 2,
  x: 500,
  scrollTrigger: {
    trigger: "#page2  h1",
    scroller: "body",
    markers: true,
    start: "top 50%",
  },
});
```

<img data-src="/assets/images/gifs/gsap-scrollTrigger-01.gif"/>

### 8.3 end 用法

```ts
scrollTrigger: {
  trigger: "#page2  #box",
  scroller: "body",
  markers: true,
  start: "top 60%",
  end: "top 30%",
  scrub: 2
}
```

- start: 定义了动画开始的滚动位置。"top 60%" 表示当 trigger 元素滚动到页面顶部 60% 的位置时，动画将开始。

- end: 定义了动画结束的滚动位置。"top 30%" 表示当 trigger 元素滚动到页面顶部 30% 的位置时，动画将结束。请注意，end 属性将覆盖 duration 属性，因为动画的持续时间将由滚动位置决定。

- scrub: 2 表示动画的播放速度是滚动速度的两倍。正值表示动画播放速度比滚动快，负值则相反。1 表示与滚动速度相同，0.5 表示是滚动速度的一半。

## 9 svg 动画

### 9.1 svg 基础知识

svg 标签就是一个容器，其中有很多类型的标签

```html
<svg width="190" height="160">
  <path d="M 10 80 Q 95 10 180 80" stroke="black" fill="transparent" />
</svg>
```

<img data-src="/assets/images/svg-01.png"/>

尝试调整一下

```html
<svg width="1900" height="160">
  <path d="M 0 80 Q 900 10 1800 80" stroke="black" fill="transparent" />
</svg>
```

<img data-src="/assets/images/svg-02.png"/>

### 9.2 gsap svg 小动画

```html
<div id="string">
  <svg width="1000" height="200">
    <path d="M 10 100 Q 500 100 990 100" stroke="white" fill="transparent" />
  </svg>
</div>
```

```js
const initialPath = `M 10 100 Q 500 100 990 100`;
const finalPath = `M 10 100 Q 500 100 990 100`;

const string = document.querySelector("#string");

string.addEventListener("mouseenter", (event) => {
  console.log("mouse enter");
});

string.addEventListener("mousemove", (event) => {
  console.log(event.y);
  path = `M 10 100 Q ${event.x} ${event.y} 990 100`;
  gsap.to("svg path", {
    attr: {
      d: path, // 这里使用gsap的attr属性来修改path的d属性
      duration: 0.3,
      ease: "power3.out",
    },
  });
});

string.addEventListener("mouseleave", () => {
  console.log("mouse leave");
  gsap.to("svg path", {
    attr: {
      d: finalPath, // 这里使用gsap的attr属性来修改path的d属性
      duration: 1.2,
      ease: "elastic.out(1,0.4)  ",
    },
  });
});
```

<img data-src="/assets/images/gifs/gsap-svg.gif"/>

## 10 gsap 项目 1 鼠标项目

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div id="cursor"></div>
    <div id="main">
      <div id="image">
        <div id="overlay"></div>
        <img src="./01.png" alt="" />
      </div>
    </div>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
      integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <script src="./script.js"></script>
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

#main {
  height: 100%;
  width: 100%;
  background-color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
}

#cursor {
  height: 20px;
  width: 20px;
  background-color: white;
  border-radius: 50%;
  position: fixed;
  font-size: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 9;
  background-color: #fffffff6;
}

#image {
  height: 36vw;
  width: 65vw;
  background-color: antiquewhite;
  position: relative;
}

#image img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

#overlay {
  width: 100%;
  height: 100%;
  background-color: transparent;
  position: absolute;
  z-index: 10;
}
```

```js
const main = document.querySelector("#main");
const cursor = document.querySelector("#cursor");
const imageDiv = document.querySelector("#image");

main.addEventListener("mousemove", (event) => {
  gsap.to("#cursor", {
    x: event.x,
    y: event.y,
    duration: 0.6,
    ease: "back.out",
  });
});

imageDiv.addEventListener("mouseenter", () => {
  cursor.innerHTML = "Hello Vccyb";
  gsap.to("#cursor", {
    scale: 4,
    duration: 0.3,
    backgroundColor: "#ffffff5c",
  });
});

imageDiv.addEventListener("mouseleave", () => {
  cursor.innerHTML = " ";
  gsap.to("#cursor", {
    scale: 1,
    duration: 0.3,
    backgroundColor: "#fffffff6",
  });
});
```

### 10.1 遮罩难点

这里有一个难点是，鼠标进入图片后，cursor 变大，就会阻碍鼠标的事件，就会有断断续续的感觉

<img data-src="/assets/images/gifs/gsap-p-01.png"/>

### 10.2 效果

<img data-src="/assets/images/gifs/gsap-p-02.gif"/>

## 11 gsap 项目 2 时间线动画

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="./style.css" />
    <link
      href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="main">
      <div id="nav">
        <h2>Chen YuBo</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
        >
          <path d="M3 4H21V6H3V4ZM9 11H21V13H9V11ZM3 18H21V20H3V18Z"></path>
        </svg>
      </div>
      <div id="full">
        <h4>Work</h4>
        <h4>About</h4>
        <h4>Vue</h4>
        <h4>React</h4>
        <h4>vite</h4>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
        >
          <path
            d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
          ></path>
        </svg>
      </div>
    </div>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
      integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <script src="./script.js"></script>
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

body {
  overflow: hidden;
}

#main {
  height: 100%;
  width: 100%;
  background-image: url(./01.png);
  background-size: cover;
  background-position: center;
}

#nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  color: #fff;
}

#nav i {
  font-size: 30px;
  font-weight: 800;
}

#full {
  height: 100%;
  width: 40%;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.544);
  right: 0;
  top: 0;
  backdrop-filter: blur(10px);
  padding: 150px 60px;
  display: flex;
  flex-direction: column;
  justify-self: center;
  gap: 1rem;
  right: -40%;
}

#full h4 {
  font-size: 50px;
  font-weight: 500;
}

#full svg {
  position: absolute;
  top: 5%;
  right: 10%;
  background-color: white;
  border-radius: 50%;
  font-weight: 600;
  cursor: pointer;
  font-size: 25px;
}
```

```js
const tl = gsap.timeline({
  paused: true,
});

tl.to("#full", {
  right: 0,
  duration: 0.6,
});

tl.from("#full h4", {
  x: 150,
  duration: 0.6,
  stagger: 0.3,
  opacity: 0,
});

tl.from("#full svg", {
  opacity: 0,
});

const menu = document.querySelector("#nav svg");
const close = document.querySelector("#full svg");
menu.addEventListener("click", () => {
  tl.play();
});

close.addEventListener("click", () => {
  tl.reverse();
});
```

### 11.1 效果

<img data-src="/assets/images/gifs/gsap-p-03.gif"/>

## 12 gsap 项目 3 文字动画

```html
<h1>Job Chen</h1>
```

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: gilory;
  color: white;
}

html,
body {
  height: 100%;
  width: 100%;
}

body {
  background-color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 100px;
  padding: 0 1rem;
  overflow: hidden;
}

h1 span {
  display: inline-block;
}
```

```js
function breakText() {
  const h1 = document.querySelector("h1");
  const splitText = h1.textContent.split("");

  let halfValue = splitText.length / 2;

  let textSpan = splitText.map((item, index) => {
    let className = index < halfValue ? "left" : "right";
    return (item = `<span class="${className}">${item}</span>`);
  });

  textSpan = textSpan.join("");

  h1.innerHTML = textSpan;
}

breakText();

// gsap.from("h1 span", {
//   y: 50,
//   opacity: 0,
//   duration: 0.8,
//   delay: 0.5,
//   stagger: 0.15,
// });

gsap.from("h1 .left", {
  y: 80,
  duration: 0.6,
  delay: 0.5,
  stagger: 0.15,
  opacity: 0,
});

gsap.from("h1 .right", {
  y: 80,
  duration: 0.6,
  delay: 0.5,
  stagger: -0.15,
  opacity: 0,
});
```

### 12.1 效果

<img data-src="/assets/images/gifs/gsap-p-04.gif"/>
