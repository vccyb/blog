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

<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
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

略

## 第四章 vscode上react配置

略，还是上面的内容

## 第五章 基本用法

useState

```ts
const [username, setUsername] = React.useState("");
```

style 写法

```jsx
<h2
  style={{
    textAlign: "center",
  }}
>
  Login Form
</h2>
```

注意： `style={}` 中的属性名，必须使用驼峰命名法

class写法

```jsx
<input
  type="text"
  className="input"
  value={username}
  onChange={event => setUsername(event.target.value)}
/>
```

注意：className中的值，会自动加到class上

derived state

```jsx
const [username, setUsername] = React.useState("");
const usernameError = username.length < 5 ? "用户名长度不能小于5" : "";
```

动态变化，把它理解为vue中的computed

## 第六章 动态圆圈

```jsx
function MyApp() {
  const [isPurple, setIsPurple] = React.useState("");
  const [textColor, setTextColor] = React.useState("");

  const [size, setSize] = React.useState(150);
  const [rotate, setRotate] = React.useState(0);

  const circleStyle = {
    height: `${size}px`,
    width: `${size}px`,
    lineHeight: `${size}px`,
    transform: `rotate(${rotate}deg)`,
  };

  console.log(size, rotate);
  return (
    <main>
      <label>
        Purple
        <input
          type="checkbox"
          value={isPurple}
          onChange={() => setIsPurple(!isPurple)}
        />
      </label>

      <label>
        text color
        <select onChange={e => setTextColor(e.target.value)} value={textColor}>
          <option value="" selected>
            White
          </option>
          <option value="text-black">Black</option>
          <option value="text-orange">Orange</option>
        </select>
      </label>

      <label>
        Circle Size
        <input
          type="number"
          value={size}
          onChange={e => setSize(e.target.value)}
        />
      </label>

      <label>
        Circle Rotate
        <input
          type="number"
          value={rotate}
          onChange={e => setRotate(e.target.value)}
        />
      </label>
      <div
        style={circleStyle}
        className={`circle ${isPurple ? "purple" : ""} ${textColor}`}
      >
        Hi!
      </div>
    </main>
  );
}

const appEl = document.querySelector("#app");
const root = ReactDOM.createRoot(appEl);

root.render(<MyApp />);
```
