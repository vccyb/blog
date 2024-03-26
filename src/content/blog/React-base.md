---
title: react基础
author: Chen YuBo
pubDatetime: 2024-03-21T15:36:51.717Z
featured: false
draft: false
description: "react 基础"
tags:
  - promise
  - 手写源码
---

## 目录

## 第一章，体验react

```html
<div id="app"></div>
```

```js
function MyApp() {
  const [textInput, setTextInput] = React.useState("");
  return (
    <main>
      <h1>Title</h1>
      <input
        type="text"
        onChange={event => setTextInput(event.target.value)}
      ></input>
      <p>{textInput}</p>
    </main>
  );
}

const appEL = document.querySelector("#app");
const root = ReactDOM.createRoot(appEL);

root.render(<MyApp />);
```

## 第二章 介绍React课程

重点：

- 一定要上手，跟着做
- 不要跳过，找到自己的速度
- 拒绝精神内耗
- 复习

## 第三章 vscode 配置
