---
title: "node.js 学习"
date: 2024-05-19T07:20:55.819Z
---

<img data-src="/assets/images/node/node-01.png">

## 1 hello world

```js title="index.js"
console.log("hello world");
```

```shell
node index.js
```

## 2 module

Types of Modules

1. Local modules Modules that we create in our application
2. Built-in modules - Modules that Node.js ships with out of the box
3. Third party modules - Modules written by other developers that we can use in our application

## 3 commonjs

require 和 module.exports

```js
function add(a, b) {
  //...
}
module.exports = add;

const add = require("./add");
```

## 4 module wrapper

node.js 把 module.exports 的模块都包装了一下

```js
(function(exports, require, module,__filename, __dirname){
  const superHero = "Batman":
  console.log( superHero);
})
```
