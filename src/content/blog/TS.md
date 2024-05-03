---
title: Typescript 知识小集合
author: Chen YuBo
date: 2024-03-09T16:38:03.129Z
draft: false
category: Typescript
featured: true
description: "ts的一些知识点和收集"
tags:
  - typescript
---

## TS 中的模块化

1. 使用`ESModule`语法，导入导出

> 小 tips：默认到处，在 ts 里面是不能自动修复，享受不到自动导入的便利，这是默认到处，你导入的时候是可以更改名字的

2. 导入模块的时候，不能加`.ts`后缀

ts 是需要编译的，编译之后，如果加了.ts 的后缀，还会保留，就出问题的

3. 不是用 ts 模块写的，commonjs 的模块，没有默认导出

```js
// import fs from "fs";
// 可以用下面两种方法
import { readFileSync } from "fs";
import * as fs from "fs";
```

或者可以 tsconfig.json 里面配置

```json
esModuleInterop: true  // 启用后就可以了
```

4. 如果你一定要在 ts 中写 commonjs 的语法代码呢？**不建议**，但是也可以写

```js
// module.exports = {
//   ...
// }

// 使用下面这种，才有类型提示
export = {

}

// 导入呢？
// const myModule = require("./myModule"); 不能使用这种

import myModule from './myModule'; // 基于esModuleInterop: true
import myModule = require('./myModule');
```

5. 模块解析

模块解析策略：应该去什么位置寻找模块

- classic: 默认的解析策略，经典 过时了
- node: node 解析策略 => 和 node 的模块解析策略一样，唯一的变化，将 js 替换为 ts
  - 相对路径： require('./xxx') import('./xxx')
    - 1. 当前目录
    - 2 package.json 中的 "main" 字段
    - 3. 把 xxx 当作一个文件夹，找 main 字段这个文件
    - 3. 把 xxx 当作一个文件夹，找 index.js
  - 全局模块： 非相对路径 require('jquery') import('jquery')
    - 1. node_modules 当前文件夹
    - 2. 往上的文件夹的 node_modules
    - 3. 一直到根目录
