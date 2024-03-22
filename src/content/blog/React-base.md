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
