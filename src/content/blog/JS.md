---
title: js相关技巧集合，也包含html和css
author: Chen YuBo
date: 2024-03-11T16:04:05.712Z
featured: true
draft: false
category: HTML-CSS-JS
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
    }).then((resp) => resp.json());
  } catch (e) {
    console.log("请求被取消");
  }
  createList(list);
};
```

axios 取消请求

关于 axios，axios 其实有两种取消请求的方式，一种是`cancelToken`，一种是`abort`。
不过现在官网也推荐我们使用 abort 这种方式了，代码也是很类似的

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

## 2 max-height 效果

https://www.bilibili.com/video/BV1ay421B7Sh/?spm_id_from=333.1007.tianma.1-3-3.click&vd_source=ff519b14c2f26ffed121e75322acc97e

1. height

```
height: 0;
height: auto
```

2. max-height
   会有 transition 的问题

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

1. 模块解析 url 地址补全 `***/main.js`, 下载对应的模块，解析
2. 所有 main.js 顶级静态的导入语句, 提到代码最上方

```js
import a from "./a.js";
import b from "./b.js";
```

3. 继续顺序解析，如果有重复的（正在下载的），不会重复下载的

4. 下载完成，执行代码 （解析完毕，真正的执行

动态导入是在运行时，进行处理的

## 4 base64 编码

```html
<img src="data:image/pmg;base64,xxxxxx" ></img>
<script src="data:application/javascript;base64,xxxxxx"></script>
<script src="data:application/javascript;alert(123)"></script>
```

dataurl 的格式，参考 wiki 百科

js 的 base64 编码 api

```js
const res = atob("YMxlxx..."); // 解码
const res = btoa("alert(123)"); // 编码64
```

选择文件，编码为 base64

```js
const inp = document.querySelector("input");

inp.onchange = function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    console.log(e.target.result); //dataurl
    preview.src = e.target.result; // 使用base64编码的图片
  };
  reader.readAsDataURL(file);
};
```

## 5 节流防抖

### 防抖 debounce

多少 s 后，执行，有重新计时的功能

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

#### 支持函数参数和 this

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

this 的问题：

1. 保障 xxx 和返回的是同一个 this
2. 函数使用箭头函数
3. 函数调用用 apply

### 节流 throttle

与防抖很类似

节流的定义：某一段时间，函数只执行一次

实现 1，利用防抖，就是等待 xs 后，注意区别（如果有计时，防抖会清空）

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

实现 2，立刻执行一次

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

## 6 jwt 理解

https://www.bilibili.com/video/BV1q64y1w7sr/?spm_id_from=333.337.search-card.all.click&vd_source=ff519b14c2f26ffed121e75322acc97e

## 7 给 fetch 添加超时功能

几种思路方向：

1. 直接修改 window.fetch 影响太大不好，第三方库容易出问题
2. 自定义一个函数 request，也不好，不会影响第三方库，但是调用不方便

高阶函数！

```js
function createRequestWithTimeout(timeout = 5000) {
  return function (url, options) {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      options = options || {};
      // 处理参数有信号的情况
      if (options.signal) {
        const signal = options.signal;
        signal.addEventListener("abort", () => {
          controller.abort();
        });
      }
      options.signal = controller.signal;
      fetch(url, options).then(resolve, reject);
      setTimeout(() => {
        reject(new Error("timeout"));
        // 终止请求
        controller.abort();
      }, timeout);
    });
  };
}
```

调用

```js
const request = createRequestWithTimeout(5000);
const request2 = createRequestWithTimeout(3000);
```

## 8 Reflect 的本质

Reflect 就是调用对象的基本操作（内部方法）

```js
const obj = {};
obj.a = 1; // [[SET]]
Reflect.set(obj, "a", 2); // [[SET]] 这个就是直接调用内部方法
obj.a; // [[GET]]
```

直接和间接调用的区别

1. 没有使用 Reflect，还有额外的步骤，只是其中的一个是调用基本方法

```js
const obj = {
  a: 1,
  b: 2,
  get c() {
    return this.a + this.b;
  },
};

console.log(obj.c); // 3
console.log(Reflect.get(obj, "c", { a: 3, b: 4 })); // 7
// 定义this obj
// 再调用基本方法 [[GET]](obj,'c', obj)
```

最常使用的场景就是代理对象的时候

```js
const obj = {
  a: 1,
  b: 2,
  get c() {
    return this.a + this.b;
  },
};

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log("get");
    // return target[key]; // 返回的原始对象
    return Reflect.get(target, key, receiver); // 使用Reflect指定this指向的对象
  },
});
```

## 9 参数的默认值

```js
function foo(a, b = 2, c = 3)
```

注意：

1. undefined 才会触发默认值
2. 参数的顺序是不能跳跃式传递
3. 函数的.length，参数默认值之前
4. 默认值放一个表达式，只有触发默认值的时候，才触发
5. 表达式，的入参数只能使用之前的，TDZ

```js
function foo(a, b = 2, c) {}
console.log(foo.length); // 1
```

## 10 消除异步的传染性

问题

```js
async function getUser() {
  return await fetch("url").then((resp) => resp.json());
}

async function m1() {
  return await getUser();
}

async function m2() {
  return await m1();
}

async function m3() {
  return await m2();
}

async function main() {
  const user = await m3();
  console.log(user);
}
```

解答：

```js
function getUser() {
  return fetch("url").then((resp) => resp.json());
}

function m1() {
  return getUser();
}

function m2() {
  return m1();
}

function m3() {
  return m2();
}

function main() {
  const user = m3();
  console.log(user);
}

function run(func) {
  let cache = [];
  let i = 0;
  const _originFetch = window.fetch;
  window.fetch = (...args) => {
    //
    if (cache[i]) {
      if (cache[i].status === "fulfilled") {
        return cache[i].data;
      } else if (cache[i].status === "rejected") {
        throw cache[i].err;
      }
    }
    const result = {
      status: "pending",
      data: null,
      err: null,
    };
    cache[i++] = result;
    const prom = _originFetch(...args)
      .then((resp) => resp.json())
      .then(
        (resp) => {
          result.status = "fulfilled";
          result.data = resp;
        },
        (err) => {
          result.status = "rejected";
          result.err = err;
        }
      );
    //报错
    throw prom;
  };
  try {
    func();
  } catch (err) {
    if (err instanceof Promise) {
      const reRun = () => {
        i = 0;
        func();
      };
      err.then(reRun, reRun);
    }
  } finally {
    window.fetch = _originFetch;
  }
}

run(main);
```

## 11 this 的指向问题

1. 如果直接 this，就看环境，浏览器上 window，node 上 空对象
2. 函数里面，就是取决于函数上如何调用的

| 方式              | this 指向         |
| ----------------- | ----------------- |
| 通过`new`调用     | this 指向新的对象 |
| 直接调用          | this 指向全局对象 |
| 通过对象调用      | 前面的对象        |
| call、apply、bind | 指向第一个参数    |

箭头函数没有`this`，基于闭包，编译的时候确定，词法作用域，定义时候

## 12 获取元素的维度

You can use getBoundingClientRect method to get the dimensions of an element.

```js
const roadmapWrapper = document.querySelector(".roadmap-wrapper");
const dimensions = roadmapWrapper.getBoundingClientRect();

console.log(dimensions); // DOMRect { x: 8, y: 8, width: 784, height: 784, top: 8, right: 792, bottom: 792, left: 8 }
```

## 13 冻结对象

要使对象不可变，可以使用 object.freeze（）方法。它可以防止修改现有特性值并防止添加新特性。

```js
const roadmap = {
  name: "JavaScript",
};

Object.freeze(roadmap);

roadmap.name = "JavaScript Roadmap"; // throws an error in strict mode
console.log(roadmap.name); // JavaScript
```

## 14 基于 CSS 变量的主题切换

css 变量方案有兼容性的问题

### 1 定义两套主题

```css
/* 暗色主题 */
html[data-theme="dark"] {
  --text-color: #fff;
  --bg1: #102128;
  --bg2: #2d5567;
}

/* 默认亮色主题 */
:root {
  --text-color: #333;
  --bg1: #c7ffdd;
  --bg2: #fbd988;
}
```

### 2 定义切换

如何 html 生效，就是加上自定义属性

```html
<html data-theme="dark"></html>
```

为啥定义到 html 里面，继承，这些变量定义在`html`里面，所有的子元素可以继承

### 3 样式使用 css 变量

```vue
<style scoped>
.main {
  background: var(--bg1);
  color: var(--text-color);
}
</style>
```

### 4 全局记录当前主题

```ts
import { ref } from "vue";

const theme = ref("light");

export function useTheme() {
  return {
    theme,
    toggleTheme() {
      theme.value = theme.value === "light" ? "dark" : "light";
    },
  };
}
```

### 5 需要使用当前主题的地方

```js
import { useTheme } from "@/composables/useTheme";
const { theme, toggleTheme } = useTheme();

//...
<div>
  <p>{{ theme }}</p>
  <h1>{{theme === 'light' ? '亮色' : '暗色'}}</h1>
</div>;
```

这里假设 div 需要用到当前主题

### 6 全局数据和根元素的属性关联上

```ts title="useTheme.ts"
import { ref, watchEffect } from "vue";

const theme = ref("light");

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
});

export function useTheme() {
  return {
    theme,
    toggleTheme() {
      theme.value = theme.value === "light" ? "dark" : "light";
    },
  };
}
```

### 7 持久化主题

```ts
type Theme = "light" | "dark";
const key = "__theme__";
const theme = ref<Theme>((localStorage.getItem(key) as Theme) || "light");

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem(key, theme.value);
});
```

## 15 AJAX 的进度监控

### AJAX 的两套实现

1. XHR XMLHttpRequest axios
2. fetch umi-request

### XHR 和 Fetch 的区别

<img data-src="/assets/images/JS/JS-01.png" class="w-[100%]">

### 响应的进度监控

XHR, 主要就是触发 progress 这个事件，上传的时候会一直触发

```js
xhr.addEventListener("progress", (e) => {
  console.log(e.loaded, e.total);
  opProcess &&
    onProcess({
      loaded: e.loaded,
      total: e.total,
    });
});

xhr.open(method, url);
xhr.send(data);
```

fetch 其实就是获取总量和以及响应的

```js
const resp = await fetch(url, {
  method,
  body: data,
});

const total = +resp.headers.get("content-length");
const decoder = new TextDecoder();
let body = "";
const reader = resp.body.getReader();
let loaded = 0;
while (1) {
  const { done, value } = await reader.read();
  if (done) {
    break;
  }
  loaded += value.length;
  body += decoder.decode(value);
  onProcess && onProcess({ loaded, total });
}
```

### 上传的进度监控

fetch 的设计基于 promise，就是成功失败

XHR 监控上传的接口即可

```js
xhr.upload.addEventListener("progress", (e) => {
  console.log(e.loaded, e.total);
});
```

## 16 模拟微任务

```js
/**
 * 将传入的函数放入微队列中执行
 */
function runMicroTask(task) {
  if (typeof Promise === "function") {
    Promise.resolve().then(task);
    return;
  }

  if (typeof MutationObserver === "function") {
    let ob = new MutationObserver(task);
    let node = document.createTextNode("");
    ob.observe(node, {
      characterData: true,
    });
    node.data = 1;
    return;
  }

  // node
  if (process && typeof process.nextTick === "function") {
    process.nextTick(task);
    return;
  }
}
```

## 17 函数重载

https://www.bilibili.com/video/BV1ju4y127xX/?spm_id_from=333.788&vd_source=ff519b14c2f26ffed121e75322acc97e

假设我们希望实现一个这样的重载

```js
getUser();
getUser(1);
getUser(1, 20);
getUser("张");
getUser("张", "男");
```

```js
import createOverload from "@/utils/overload";
const getUser = createOverload();

// 无参的
getUsers.addImpl(() => {
  console.log("查询所有用户");
});

const searchPage = (page, size = 10) => {
  console.log("按照页码和数量查询用户");
};

// 对应2、3
getUsers.addImpl("number", searchPage);
getUsers.addImpl("number", "number", searchPage);

// 对应一个字符串
getUsers.addImpl("string", (name) => {
  console.log("按照姓名查询用户");
});

// 对应2个字符串
getUsers.addImpl("string", "string", (name, gender) => {
  console.log("按照姓名和性别查询用户");
});



调用呢？

getUser('a')
```

那么怎么实现呢？

```js title="overload"
function createOverload() {
  const callMap = new Map();
  return overload(...args) {
    const key = args.map(arg => typeof arg).join(',')
    const fn = callMap.get(key)
    if(fn) {
      return fn.apply(this, args)
    }
    throw new Error('no impl method')
  }

  overload.addImpl = function (...args) {
    const fn = args.pop();
    if(!fn || typeof fn !== 'function') {
      return
    }
    const types = args;
    callMap.set(types.join(','), fn);
  }

}

export default createOverload;
```

## 18 使用代理实现单例

```js
function singleton(className) {
  let ins;
  let parameters;
  return new Proxy(className, {
    construct(target, args) {
      if (!ins) {
        ins = new className(target, ...args);
        parameters = args;
      }
      if (!isSame(parameters, args)) {
        throw new Error("参数不一致");
      }
      return ins;
    },
  });
}
```

## 19 深度克隆

解决循环引用问题

```js
function deepClone(value) {
  const cache = new weakMap();
  function _deepClone(value) {
    if (value === null || typeof value !== "object") {
      return value;
    }
    if (cache.has(value)) {
      return cache.get(value);
    }
    const result = Array.isArray(value) ? [] : {};
    cache.set(value, result);
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = deepClone(value[key]);
      }
    }
    return result;
  }

  return _deepClone(value);
}
```

## 20 数据的流式获取

传统的请求接口

```js
async function getResponse() {
  // 这里只是相应头
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "xxx",
    }),
  });
  // 响应体
  const msg = await resp.text();
  console.log(msg);
}
```

但是这种体验不好，要等待好久

优化

```js
async function getResponse() {
  // 这里只是相应头
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "xxx",
    }),
  });
  // 流读取
  const reader = resp.body.getReader();
  const textDecoder = new TextDecoder();
  while (1) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const str = textDecoder.decode(value);
    console.log(str);
  }
}
```

## 21 数组的，并集、交集、差集

```js
const arr1 = [33, 22, 55, 33, 11, 33, 5];
const arr2 = [22, 55, 77, 88, 88, 99, 99];

// 并集
const union = [...new Set([...arr1, ...arr2])];

// 交集
const cross = [...new Set(arr1.filter((it) => arr2.includes(it)))];

// 差集
const diff = union.filter((it) => !cross.includes(it));
```

## 22 编码顺序和字典顺序

默认是编码顺序,如果要使用字典排序

```js
names.sort((a, b) => a.localeCompare(b));
```
