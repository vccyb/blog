---
title: "构建一个脚手架"
date: 2024-05-06T12:25:58.155Z
description: 这篇文章基于网络上的教程，构建一个自己的脚手架
---

## 1 两个工程的设置

1. 我们需要创建两个目录：`tool`和 `testProject`
2. 两个目录下，`pnpm init`
3. 在`tool`项目下，创建一个`bin`目录，并创建`index.js`
4. `index.js` 书写代码

```js title="too/bin/index.js"
console.log("hello tool");
```

## 2 配置包的二进制文件

```json title="too/package.json"
{
  "name": "tool",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "bin": "./bin/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

补充：如果是多个二进制文件，对象形式

```js
"bin": {
  "binary1": "./bin/index.js",
  "binary2": "./some-other-file.js",
  "binary3": "./some/subdirectory/and-another.js"
},
```

## 3 link 符号链接

我们的测试是，在 `testProject` 中测试 `tool`，
所以我们需要通过 `link` 技术，在 `testProject` 添加一个符号链接到 `tool`

操作：

1. `tool`工程 link - 创建链接
2. `testProject` link `tool` - 使用链接

```shell
tool-tutorial$ cd tool
tool-tutorial/tool$ npm link
// ...
tool-tutorial/tool$ cd ../testProject
tool-tutorial/testProject$ npm link tool
// ...

// 如果是pnpm，有点不一样
// testProject pnpm link ../tool
```

3. 在`testProject` 测试一下

```shell
tool;
hello tool
```

## 4 处理命令行参数

```js title="tool/bin/index.js"
console.log(process.argv);
```

回到我们测试工程，进行测试

```
tool --start
[
  '/Users/user/.nvm/versions/node/v12.16.1/bin/node',
  '/Users/user/tool-tutorial/tool/bin/index.js',
  '--start'
]
```

process.argv 返回一个数组，

- 其中数组的第一个成员是节点可执行文件，
- 第二个是执行文件的名称，
- 第三个及以后是我们传递给脚本的参数。

补充：处理命令行参数，有一些相关的库

1. arg
2. Commander
3. yargs

利用 arg 优化

```js title="tool/bin/index.js"
const arg = require("arg");

try {
  const args = arg({
    "--start": Boolean,
    "--build": Boolean,
  });

  if (args["--start"]) {
    console.log("starting the app");
  }
} catch (e) {
  console.log(e.message);
  console.log();
  usage();
}

function usage() {
  console.log(`tool [CMD]
  --start\tStarts the app
  --build\tBuilds the app`);
}
```

效果

```shell
tool-tutorial/testProject$ tool --publish
Unknown or unexpected option: --publish

tool [CMD]
  --start		Starts the app
  --build		Builds the app
```

## 5 使用颜色

```js
const arg = require("arg");
const chalk = require("chalk");

try {
  const args = arg({
    "--start": Boolean,
    "--build": Boolean,
  });

  if (args["--start"]) {
    console.log(chalk.bgCyanBright("starting the app"));
  }
} catch (e) {
  console.log(chalk.yellow(e.message));
  console.log();
  usage();
}

function usage() {
  console.log(`${chalk.whiteBright("tool [CMD]")}
  ${chalk.greenBright("--start")}\tStarts the app
  ${chalk.greenBright("--build")}\tBuilds the app`);
}
```
