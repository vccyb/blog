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

## 第七章 列表渲染和条件渲染

```jsx
function MyApp() {
  return (
    <main>
      {
        // 遍历cities数组，生成每个城市的列表项
        cities.map(city => (
          <section className="city">
            <h2>{city.country}</h2>
            <h3>{city.name}</h3>
            {
              // 判断city.forecast数组是否为空，如果为空则显示"No forecast data available"
              city.forecast && city.forecast.length > 0 ? (
                <ul>
                  {city.forecast.map(day => (
                    <li>
                      {day.date}
                      <span>
                        {" "}
                        temperature: {day.temperature}℃({day.weather})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>No Data</div>
              )
            }
          </section>
        ))
      }
      <section className="city">
        <h2>UK</h2>
        <h3>London</h3>

        <ul>
          <li>
            {new Date().toLocaleDateString()}
            <span> temperature: 20℃(Sunny)</span>
          </li>
          <li>
            {new Date().toLocaleDateString()}
            <span> temperature: 19℃(Cloudy)</span>
          </li>
          <li>
            {new Date().toLocaleDateString()}
            <span> temperature: 12℃(Rain)</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
```

列表渲染 主要就是 map

```jsx
{
  cities.map(city => (
    ...
  ))
}
```

条件渲染

```jsx
{
  city.forecast && city.forecast.length > 0 ? (...) : (...)
}
```

## 补充：userState的细节

### 组件会重新执行，避免死循环

1. 正常使用

```jsx
function MyApp() {
  console.log("组件-执行了");
  const [count, setCount] = React.useState(0);
  const handleClick = () => {
    setCount(count + 1);
    console.log("点击了");
  };
  return <h1 onClick={handleClick}>Hello, CYB! {count}</h1>;
}
```

2. 放到setTimeout中

```jsx
function MyApp() {
  console.log("组件-执行了");
  const [count, setCount] = React.useState(0);
  setTimeout(() => {
    setCount(count + 1); // 加1 -> 更新组件
  }, 1000);
  const handleClick = () => {
    setCount(count + 1);
    console.log("点击了");
  };
  return <h1 onClick={handleClick}>Hello, CYB! {count}</h1>;
}
```

更新组件-> 执行setTimeout -> 更新组件 -> 执行setTimeout -> 更新组件 -> ...

3. 直接使用，无限循环报错

```jsx
function MyApp() {
  console.log("组件-执行了");
  const [count, setCount] = React.useState(0);
  setCount(count + 1);
  const handleClick = () => {
    setCount(count + 1);
    console.log("点击了");
  };
  return <h1 onClick={handleClick}>Hello, CYB! {count}</h1>;
}
```

上述代码会无限循环，直接报错

### 异步执行

```jsx
const [count, setCount] = React.useState(0);
const handleClick = () => {
  setCount(count + 1);
  console.log("点击了", count); // count 还是 0, 因为异步
};
```

```jsx
const handleClick = () => {
  setCount(count + 1); // 0 + 1
  setCount(count + 1); // 0 + 1
  setCount(count + 1); // 0 + 1
  setCount(count + 1); // 0 + 1
  console.log("点击了", count);
};
```

页面上还是1，我们执行的时候，count还没变，还是拿到原来的值去加1

问题：

1. 设置数据，后面的代码没法立刻获取新值
2. 多次设置无效

解决：
使用函数形式 - 解决多次设置问题

```jsx
const handleClick = () => {
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => count + 1);
  console.log("点击了", count);
};
```

注意：多次修改数据，合并到一起一次更新

获取新值

```jsx
const handleClick = () => {
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => {
    console.log(count);
    return count;
  });
};

// 或者这样也可以
// let tmp = count + 1;
// setCount(tmp);
// tmp = tmp + 1;
// setCount(tmp);
// console.log(tmp);
```

### 缓存效果

```jsx
let x = 100;
const [count, setCount] = React.useState(0);
const handleClick = () => {
  setCount(count => {
    x += 1;
    count += 1;
    console.log(`count ${count}, x ${x}`);
    return count;
  });
};
```

```
count 2, x 101
Inline Babel script:33 组件-执行了
Inline Babel script:40 count 3, x 101
Inline Babel script:33 组件-执行了
Inline Babel script:40 count 4, x 101
Inline Babel script:33 组件-执行了
Inline Babel script:40 count 5, x 101
Inline Babel script:33 组件-执行了
Inline Babel script:40 count 6, x 101
Inline Babel script:33 组件-执行了
Inline Babel script:40 count 7, x 101
Inline Babel script:33 组件-执行了
Inline Babel script:40 count 8, x 101
```

就是useState有缓存，它的实现不在这个组件内，有缓存能力，可以读取上一次的值
而普通变量没有，每次都是100开始

当然你也可以，不让组件刷新即可，不写setCount就ok了，组件就不会重新执行

什么时候用：

1. 响应式变化
2. 需要缓存能力

### 写在函数内部;

只能写在函数组件内部

## 第八章 待办清单 TodoList

```jsx
function MyApp() {
  const [currentTodoItem, setCurrentTodoItem] = React.useState("");

  const [todoList, setTodoList] = React.useState([
    { id: 1, text: "Learn React", isCompleted: false },
    { id: 2, text: "Learn Angular", isCompleted: true },
  ]);

  const sortTodo = (o1, o2) => {
    if (o1.isCompleted !== o2.isCompleted) {
      return o1.isCompleted ? 1 : -1;
    }

    return o1.id - o2.id;
  };
  function handleAddTodo() {
    if (!currentTodoItem.length) {
      alert("Please enter a todo item");
      return;
    }
    const addedList = [
      {
        id: Math.random() + Date.now(),
        text: currentTodoItem,
        isCompleted: false,
      },
      ...todoList,
    ];

    addedList.sort(sortTodo);
    setTodoList(addedList);
    setCurrentTodoItem("");
  }

  function handleToggleTodo(id) {
    const toggledTodoList = todoList.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          isCompleted: !todo.isCompleted,
        };
      }
      return todo;
    });
    toggledTodoList.sort(sortTodo);
    setTodoList(toggledTodoList);
  }

  function handleDeleteTodo(id) {
    const deletedTodoList = todoList.filter(todo => todo.id !== id);
    deletedTodoList.sort(sortTodo);

    setTodoList(deletedTodoList);
  }

  return (
    <main>
      <h1>React Todo List</h1>
      <input
        type="text"
        placeholder="Add item into as todo"
        value={currentTodoItem}
        onChange={e => setCurrentTodoItem(e.target.value)}
      ></input>
      <button onClick={handleAddTodo}>Add</button>
      <ul>
        {todoList.map(todo => {
          return (
            <li className={todo.isCompleted ? "deleted" : ""} key={todo.id}>
              <input
                type="checkbox"
                defaultChecked={todo.isCompleted}
                onClick={() => handleToggleTodo(todo.id)}
              ></input>
              {todo.text}
              <button onClick={() => handleDeleteTodo(todo.id)}>delete</button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

const appEl = document.querySelector("#app");
const root = ReactDOM.createRoot(appEl);
root.render(<MyApp />);
```
