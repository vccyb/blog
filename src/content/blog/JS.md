---
title: js相关技巧集合
author: Chen YuBo
pubDatetime: 2024-03-11T16:04:05.712Z
featured: false
draft: false
description: "js相关技巧集合"
tags:
  - JS
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

## 2 max-height效果

https://www.bilibili.com/video/BV1ay421B7Sh/?spm_id_from=333.1007.tianma.1-3-3.click&vd_source=ff519b14c2f26ffed121e75322acc97e

1. height

```
height: 0;
height: auto
```

2. max-height
   会有transition的问题

3. scale
   导致内容压缩的问题

4. 网格布局
   0fr -> 1fr
   兼容性问题

推荐的写法：Flip

```js
const btn = document.querySelector(".btn");
const detail = document.querySelector(".detail");

btn.onmouseenter = function () {
  detail.style.height = "auto";
  const { height } = detail.getBoundingClientRect();
  detail.style.height = 0;
  detail.style.transition = "height 0.5s";
  detail.offsetHeight; // reflow
  detail.style.height = height + "px";
};

btn.onmouseleave = function () {
  detail.style.height = "0";
};
```

## 3 ESModule 浏览器环境下怎么工作的

```html
<script src="./main.js" type="module">
```

浏览器怎么做的

1. 模块解析 url地址补全 `***/main.js`, 下载对应的模块，解析
2. 所有main.js 顶级静态的导入语句, 提到代码最上方

```js
import a from "./a.js";
import b from "./b.js";
```

3. 继续顺序解析，如果有重复的（正在下载的），不会重复下载的

4. 下载完成，执行代码 （解析完毕，真正的执行

动态导入是在运行时，进行处理的

## 4 base64编码

```html
<img src="data:image/pmg;base64,xxxxxx" ></img>
<script src="data:application/javascript;base64,xxxxxx"></script>
<script src="data:application/javascript;alert(123)"></script>
```

dataurl的格式，参考wiki百科

js的base64编码api

```js
const res = atob("YMxlxx..."); // 解码
const res = btoa("alert(123)"); // 编码64
```

选择文件，编码为base64

```js
const inp = document.querySelector("input");

inp.onchange = function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    console.log(e.target.result); //dataurl
    preview.src = e.target.result; // 使用base64编码的图片
  };
  reader.readAsDataURL(file);
};
```

## 5 节流防抖

### 防抖 debounce

多少s后，执行，有重新计时的功能

电梯关门，触发事件，让你触发，如果一段时间内又触发，等待不算数，只有最后一次触发，一段时间后，我再执行

#### 基本写法

```js
function debounce(fn, delay) {
  let timeId;
  return function () {
    clearTimeout(timeId);
    timeId = setTimeout(fn, delay);
  };
}
```

例子

```js
function layout() {
  console.log("layout");
}

let func = debounce(layout, 1000);

function debounce(func, wait) {
  let timerId;
  return function () {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func();
    }, wait);
  };
}

window.onresize = () => {
  // console.log("resize");
  func();
};
```

#### 支持函数参数和this

```js
function debounce(fn, wait) {
  let timeId;
  return function (...args) {
    clearTimeout(timeId);
    timeId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

const xxx = debounce(layout, 1000);
```

this的问题：

1. 保障xxx和返回的是同一个this
2. 函数使用箭头函数
3. 函数调用用apply

### 节流

与防抖很类似

节流的定义：某一段时间，函数只执行一次

实现1，利用防抖，就是等待xs后，注意区别（如果有计时，防抖会清空）

```js
function throttle(func, wait) {
  let timerId;
  return function () {
    if (timerId) return;
    timerId = setTimeout(() => {
      func.apply(this, arguments);
      timerId = null;
    }, wait);
  };
}
```

实现2，立刻执行一次

```js
function throttle(func, wait) {
  let time;
  return function () {
    // 立刻执行和 距离上一次执行的时间拆过wait
    if (!time || Date.now() - time >= wait) {
      func.apply(this, arguments);
      time = Date.now();
    }
  };
}
```
