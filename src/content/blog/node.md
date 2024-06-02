---
title: "node.js 学习"
date: 2024-05-19T07:20:55.819Z
---

## 1 概述

### 1.1 node.js 基本概念

1. node.js 是一个 javvascript 运行环境(runtime)
   <img data-src="/assets/images/node/node-01.png">

2. Nodejs 是构建在 V8 引擎之上的，V8 引擎是由 C/C++编写的，因此我们的 JavaSCript 代码需要由 C/C++转化后再执行。

3. NodeJs 使用异步 I/O 和事件驱动的设计理念，可以高效地处理大量并发请求，提供了非阻塞式 I/O 接口和事件循环机制，使得开发人员可以编写高性能、可扩展的应用程序,异步 I/O 最终都是由 libuv 事件循环库去实现的。

4. NodeJs 使用 npm 作为包管理工具类似于 python 的 pip，或者是 java 的 Maven，目前 npm 拥有上百万个模块。 www.npmjs.com/

5. nodejs 适合干一些 IO 密集型应用，不适合 CPU 密集型应用，nodejsIO 依靠 libuv 有很强的处理能力，而 CPU 因为 nodejs 单线程原因，容易造成 CPU 占用率高，如果非要做 CPU 密集型应用，可以使用 C++插件编写 或者 nodejs 提供的 cluster。(CPU 密集型指的是图像的处理 或者音频处理需要大量数据结构 + 算法)

### 1.2 使用场景

前端

- Vue Angular React nuxtjs nextjs

基建端

- webpack vite rollup gulp

...

参考[小满 node.js 第一章](https://juejin.cn/post/7258881840823713848)

## 2 node.js 安装

官网下载就可以，但是还有更好的方式 nvm-desktop

https://nodejs.org/en/

https://github.com/1111mp/nvm-desktop

检查是否安装成功

```shell
node -v
v20.11.1
```

## 3 npm 与 package.json

### 3.1 npm

`npm`（全称 Node Package Manager）是 Node.js 的包管理工具，它是一个基于命令行的工具，用于帮助开发者在自己的项目中安装、升级、移除和管理依赖项。

www.npmjs.com/

### 3.2 npm 常用命令

1. `npm init`：初始化一个新的 npm 项目，创建 package.json 文件。
2. `npm install`：安装一个包或一组包，并且会在当前目录存放一个 node_modules。
3. `npm install <package-name>`：安装指定的包。
4. `npm install <package-name> --save`：安装指定的包，并将其添加到 package.json 文件中的依赖列表中。
   - 简写 `npm i xxx`
5. `npm install <package-name> --save-dev`：安装指定的包，并将其添加到 package.json 文件中的开发依赖列表中。

   - 简写 `npm i xxx -D`

6. `npm install -g <package-name>`：全局安装指定的包。
7. `npm update <package-name>`：更新指定的包。
8. `npm uninstall <package-name>`：卸载指定的包。
9. `npm run <script-name>`：执行 package.json 文件中定义的脚本命令。
10. `npm search <keyword>`：搜索 npm 库中包含指定关键字的包。
11. `npm info <package-name>`：查看指定包的详细信息。
12. `npm list`：列出当前项目中安装的所有包。
13. `npm outdated`：列出当前项目中需要更新的包。
14. `npm audit`：检查当前项目中的依赖项是否存在安全漏洞。
15. `npm publish`：发布自己开发的包到 npm 库中。
16. `npm login`：登录到 npm 账户。
17. `npm logout`：注销当前 `npm 账户。
18. `npm link`: 将本地模块链接到全局的  node_modules  目录下
19. `npm config list` 用于列出所有的 npm 配置信息。执行该命令可以查看当前系统和用户级别的所有 npm 配置信息，以及当前项目的配置信息（如果在项目目录下执行该命令）
20. `npm get registry` 用于获取当前 npm 配置中的 registry 配置项的值。registry 配置项用于指定 npm 包的下载地址，如果未指定，则默认使用 npm 官方的包注册表地址
21. `npm set registry npm config set registry <registry-url>`  命令，将 registry 配置项的值修改为指定的  <registry-url>  地址

### 3.3 package.json

执行 npm init 便可以初始化一个 package.json

1. name：项目名称，必须是唯一的字符串，通常采用小写字母和连字符的组合。
2. version：项目版本号，通常采用语义化版本号规范。
3. description：项目描述。
4. main：项目的主入口文件路径，通常是一个 JavaScript 文件。
5. keywords：项目的关键字列表，方便他人搜索和发现该项目。
6. author：项目作者的信息，包括姓名、邮箱、网址等。
7. license：项目的许可证类型，可以是自定义的许可证类型或者常见的开源许可证（如 MIT、Apache 等）。
8. dependencies：项目所依赖的包的列表，这些包会在项目运行时自动安装。
9. devDependencies：项目开发过程中所需要的包的列表，这些包不会随项目一起发布，而是只在开发时使用。
10. peerDependencies：项目的同级依赖，即项目所需要的模块被其他模块所依赖。
11. scripts：定义了一些脚本命令，比如启动项目、运行测试等。
12. repository：项目代码仓库的信息，包括类型、网址等。
13. bugs：项目的 bug 报告地址。
14. homepage：项目的官方网站地址或者文档地址。

## 4 npm install 原理

> 首先安装的依赖都会存放在根目录的 node_modules,默认采用扁平化的方式安装，并且排序规则.bin 第一个然后@系列，再然后按照首字母排序 abcd 等，并且使用的算法是广度优先遍历，在遍历依赖树时，npm 会首先处理项目根目录下的依赖，然后逐层处理每个依赖包的依赖，直到所有依赖都被处理完毕。在处理每个依赖时，npm 会检查该依赖的版本号是否符合依赖树中其他依赖的版本要求，如果不符合，则会尝试安装适合的版本

1. 扁平化安装依赖，，尝试吧公共依赖抽取
2. 广度优先算法，先处理跟目录的依赖，再逐层处理每个依赖包的依赖

### 4.1 扁平化

https://juejin.cn/post/7261119531891490877

**安装某个二级模块时，若发现第一层级有相同名称，相同版本的模块，便直接复用那个模块**

因为 A 模块下的 C 模块被安装到了第一级，这使得 B 模块能够复用处在同一级下；且名称，版本，均相同的 C 模块

**非复用情况**

因为 B 和 A 所要求的依赖模块不同，（B 下要求是 v2.0 的 C，A 下要求是 v1.0 的 C ）所以 B 不能像 2 中那样复用 A 下的 C v1.0 模块 所以如果这种情况还是会出现模块冗余的情况，他就会给 B 继续搞一层 node_modules，就是非扁平化了。

### 4.2 npm install 原理图

   <img data-src="/assets/images/node/node-npm-01.png">

## 5 npm run 原理

### 5.1 命令

我们装一个 vite，然后在 package.json 中配置一个 scripts，然后运行 `npm run dev`
vite 会自动找到 index.html

可执行文件哪

```
node_modules
  .bin
    vite
```

这个.bin 下的可执行文件哪来的，是 vite 安装的时候添加的, 具体可以看

```js title="node_modules/vite/package.json"
  "bin": {
    "vite": "bin/vite.js"
  },
```

### 5.2 执行命令-查找规则

1. 当前项目找 node_modules/.bin
2. 全局的 node_modules/.bin
3. 环境变量去找
4. 报错

### 5.3 npm 生命周期

```json
"scripts": {
    "predev": "node prev.js",
    "dev": "node index.js",
    "postdev": "node post.js"
}
```

## 6 npx

`npx`它允许用户在不安装全局包的情况下，运行已安装在本地项目中的包或者远程仓库中的包。

**npx 的优势**

- 避免全局安装：npx 允许你执行 npm package，而不需要你先全局安装它。
- 总是使用最新版本：如果你没有在本地安装相应的 npm package，npx 会从 npm 的 package 仓库中下载并使用最新版。
- 执行任意 npm 包：npx 不仅可以执行在 package.json 的 scripts 部分定义的命令，还可以执行任何 npm package。
- 执行 GitHub gist：npx 甚至可以执行 GitHub gist 或者其他公开的 JavaScript 文件。

**npm 和 npx 区别**

- npx 侧重于执行命令的，执行某个模块命令。虽然会自动安装模块，但是重在执行某个命令
- npm 侧重于安装或者卸载某个模块的。重在安装，并不具备执行某个模块的功能。

查找规则

- 当前项目找 node_modules/.bin
- 全局
- 官网下载 用完就删

## 7 发布 npm 包

发布 npm 包的好处

- 方便团队或者跨团队共享代码，使用 npm 包就可以方便的管理，并且还可以进行版本控制

```
npm adduser
npm login
npm publish
```

## 8 npm 私服

**构建私服有什么收益吗？**

- 可以离线使用，你可以将 npm 私服部署到内网集群，这样离线也可以访问私有的包。
- 提高包的安全性，使用私有的 npm 仓库可以更好的管理你的包，避免在使用公共的 npm 包的时候出现漏洞。
- 提高包的下载速度，使用私有 npm 仓库，你可以将经常使用的 npm 包缓存到本地，从而显著提高包的下载速度，减少依赖包的下载时间。这对于团队内部开发和持续集成、部署等场景非常有用

**搭建**
Verdaccio 是可以帮我们快速构建 npm 私服的一个工具

具体地址：https://juejin.cn/post/7261872148213415994

## 9 模块化

### 9.1 commonjs 规范

package.json type 不写，或者是 commonjs

**引入模块**

```js
// 1. 引入模块
require("./test.js");

// 2. 引入第三方模块
const md5 = require("md5");

// 3. node.js 内置模块
const fs = require("node:fs");

// 4. c++扩展  node-gyp .node 模块

// 5. json
const data = require("./data.json");
```

导出模块

```js
module.exports = {};

module.exports = 123;
```

### 9.2 es module 规范

package.json type 是 module

导入

```js
import xxx from "./test.js";

import { testA } from "./test.js";

import { testB as myTestB } from "./test.js";

import * as all from "./test.js";

import json from "./data.json" assert { type: "json" };
```

导出

```js
export default {
  xxx,
};

export const testA = 123;
export const testB = () => console.log("hello world");
```

### 9.3 区别

Cjs 和 ESM 的区别

- Cjs 是基于运行时的同步加载，esm 是基于编译时的异步加载
- Cjs 是可以修改值的，esm 值并且不可修改（可读的）
- Cjs 不可以 tree shaking，esm 支持 tree shaking
- commonjs 中顶层的 this 指向这个模块本身，而 ES6 中顶层 this 指向 undefined

## 10 全局变量&全局 API

没有 Dom、和 Bom

### 10.1 定义全局变量

```js
global.xxx = "xxx";
```

注意代码执行的先后顺序，每个模块都能访问到

```js
globalThis.name = xxx;
```

这个会自动识别环境，换成 global 或者 window

### 10.2 nodejs 内置 api

```js
__dirname; // 当前模块所在目录的绝对路径
__filename; // 当前文件的绝对路口，包裹文件名和扩展名

process;
```

- process.argv: 这是一个包含命令行参数的数组。第一个元素是 Node.js 的执行路径，第二个元素是当前执行的 JavaScript 文件的路径，之后的元素是传递给脚本的命令行参数。
- process.env: 这是一个包含当前环境变量的对象。您可以通过 process.env 访问并操作环境变量。
- process.cwd(): 这个方法返回当前工作目录的路径。
- process.on(event, listener): 用于注册事件监听器。您可以使用 process.on 监听诸如 exit、uncaughtException 等事件，并在事件发生时执行相应的回调函数。
- process.exit([code]): 用于退出当前的 Node.js 进程。您可以提供一个可选的退出码作为参数。
- process.pid: 这个属性返回当前进程的 PID（进程 ID）。

## 11 CSR SSR SEO

jsdom 是一个模拟浏览器环境的库，可以在 Node.js 中使用 DOM API

```js
const fs = require("node:fs");
const { JSDOM } = require("jsdom");

const dom = new JSDOM(`<!DOCTYPE html><div id='app'></div>`);

const document = dom.window.document;

const window = dom.window;

fetch("https://api.thecatapi.com/v1/images/search?limit=10&page=1")
  .then((res) => res.json())
  .then((data) => {
    const app = document.getElementById("app");
    data.forEach((item) => {
      const img = document.createElement("img");
      img.src = item.url;
      img.style.width = "200px";
      img.style.height = "200px";
      app.appendChild(img);
    });
    fs.writeFileSync("./index.html", dom.serialize());
  });
```

### 11.1 CSR SSR

我们上面的操作属于 SSR （Server-Side Rendering）服务端渲染请求数据和拼装都在服务端完成，而我们的 Vue,react 等框架这里不谈(nuxtjs,nextjs)，是在客户端完成渲染拼接的属于 CSR（Client-Side Rendering）客户端渲染
CSR 和 SSR 区别

1. 页面加载方式：

   - CSR：在 CSR 中，服务器返回一个初始的 HTML 页面，然后浏览器下载并执行 JavaScript 文件，JavaScript 负责动态生成并更新页面内容。这意味着初始页面加载时，内容较少，页面结构和样式可能存在一定的延迟。
   - SSR：在 SSR 中，服务器在返回给浏览器之前，会预先在服务器端生成完整的 HTML 页面，包含了初始的页面内容。浏览器接收到的是已经渲染好的 HTML 页面，因此初始加载的速度较快。

2. 内容生成和渲染：

   - CSR：在 CSR 中，页面的内容生成和渲染是由客户端的 JavaScript 脚本负责的。当数据变化时，JavaScript 会重新生成并更新 DOM，从而实现内容的动态变化。这种方式使得前端开发更加灵活，可以创建复杂的交互和动画效果。
   - SSR：在 SSR 中，服务器在渲染页面时会执行应用程序的代码，并生成最终的 HTML 页面。这意味着页面的初始内容是由服务器生成的，对于一些静态或少变的内容，可以提供更好的首次加载性能。

3. 用户交互和体验：

   - CSR：在 CSR 中，一旦初始页面加载完成，后续的用户交互通常是通过 AJAX 或 WebSocket 与服务器进行数据交互，然后通过 JavaScript 更新页面内容。这种方式可以提供更快的页面切换和响应速度，但对于搜索引擎爬虫和 SEO（搜索引擎优化）来说，可能需要一些额外的处理。
   - SSR：在 SSR 中，由于页面的初始内容是由服务器生成的，因此用户交互可以直接在服务器上执行，然后服务器返回更新后的页面。这样可以提供更好的首次加载性能和对搜索引擎友好的内容。

### 11.2 SEO

SEO （Search Engine Optimization，搜索引擎优化）

CSR 应用对 SEO 并不是很友好

因为在首次加载的时候获取 HTML 信息较少 搜索引擎爬虫可能无法获取完整的页面内容

而 SSR 就不一样了 由于 SSR 在服务器端预先生成完整的 HTML 页面，搜索引擎爬虫可以直接获取到完整的页面内容。这有助于搜索引擎正确理解和评估页面的内容

## 12 path

```js
const path = require("node:path");

// 1. basename 返回给定路径的最后一部分
// c.html
console.log(path.basename("/foo/bar/baz/xx/c.html"));

// 如果是MacOs 系统性处理windows路径
path.win32.basename("\\foo\\bar\\baz\\xx\\c.html");

// 2. dirname 返回路径的目录名称
// /foo/bar/baz/xx
console.log(path.dirname("/foo/bar/baz/xx/c.html"));

// 3. extname 返回后缀名
// .js
console.log(path.extname("/a/b/c/index.js"));

// 4. path.join() 拼接路径
// /a/b/
console.log(path.join("/a", "/b", "/c", "../"));

//5 path.resolve() 解析路径，返回的是绝对路径
// 都是绝对路径返回最后一个
console.log(path.resolve("/a")); // -> /a
console.log(path.resolve("./index.js"));

console.log(path.resolve(__dirname, "./index.js"));

//6 parse 和 format
console.log(path.parse("/home/user/dir/file.txt"));

console.log(
  path.format({
    root: "/",
    dir: "/home/user/documents",
    base: "file.txt",
    ext: ".txt",
    name: "file",
  })
);
```

## os
