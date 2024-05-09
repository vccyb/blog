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

## 6 配置

大多数脚手架上支持配置的，一个比较好的实践上在`package.json`中书写脚手架的配置

```json title="testProject/package.json"
{
  "name": "testProject",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "tool": {
    "port": 9999 // 此处我们使用一个配置
  }
}
```

脚手架就需要针对配置进行进行不同功能

```js title="tool/bin/index.js"
#!/usr/bin/env node
const arg = require("arg");
const chalk = require("chalk");
const path = require("path");

try {
  const args = arg({
    "--start": Boolean,
    "--build": Boolean,
  });

  if (args["--start"]) {
    // 这里就能拿到package.json了
    const pkg = require(path.join(process.cwd(), "package.json"));
    // TODO: do something with pkg
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

但是这个时候我们到子目录去执行命令`tool --start`，是会报错的，因为 cwd 的地址就不是项目的根目录了

优化， 使用第三方的包

```js
const pkgUp = require("pkg-up");

//...
if (args["--start"]) {
  const pkgPath = pkgUp.sync({ cwd: process.cwd() });
  const pkg = require(pkgPath);
  if (pkg.tool) {
    console.log("Found configuration", pkg.tool);
    // TODO: do something with configuration
  } else {
    console.log(chalk.yellow("Could not find configuration, using default"));
    // TODO: get default configuration
  }
  console.log(chalk.bgCyanBright("starting the app"));
}
```

补充坑点：

1. 我们是 tool 命令去查询配置，所以 pkg-up 的依赖谁装到 tool
2. pkg-up 这个包大版本升级后从 commonjs 到 esmodule 了，3 的大版本是 commonjs，可以使用 require 语法

解决完上面的问题，如果你的配置也是 9999,执行`tool --start`,出现结果

```shell
Found configuration { port: 9999 }
```

## 7 重构代码

让我们暂时从配置中休息一下，来重构一下我们的代码。
我们将在我们的`tool`项目中创建一个名为 `src` 的目录，并在其内部创建两个目录：`commands` 和 `config`。在 `commands` 中，我们将创建一个 `start.js` 文件，在 `config` 中，我们将创建一个 `config-mgr.js` 文件。

```js title="tool/src/commands/start.js"
const chalk = require("chalk");

module.export = function start(config) {
  console.log(chalk.bgCyanBright("  Starting the app  "));
  console.log(chalk.gray("Received configuration in start -"), config);
};
```

```js title="tool/src/config/config-mgr.js"
const chalk = require("chalk");
const pkgUp = require("pkg-up");

module.exports = function getConfig() {
  const pkgPath = pkgUp.sync({ cwd: process.cwd() });
  const pkg = require(pkgPath);

  if (pkg.tool) {
    console.log("Found configuration", pkg.tool);
    return pkg.tool;
  } else {
    console.log(chalk.yellow("Could not find configuration, using default"));
    return { port: 1234 };
  }
};
```

写了两个模块后，我们去修改`bin/index.js` 使用该模块

```js
const arg = require("arg");
const chalk = require("chalk");
const getConfig = require("../src/config/config-mgr");
const start = require("../src/commands/start");

try {
  const args = arg({
    "--start": Boolean,
    "--build": Boolean,
  });
  if (args["--start"]) {
    const config = getConfig();
    start(config);
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

## 8 js 配置文件

之前我们是把配置项放到 package.json 里面，现在我们要放到 js 文件里

```js title="tool/src/config/config-mgr.js"
const chalk = require("chalk");
const { cosmiconfigSync } = require("cosmiconfig");
const configLoader = cosmiconfigSync("tool");

module.exports = function getConfig() {
  const result = configLoader.search(process.cwd());
  if (!result) {
    console.log(chalk.yellow("Could not find configuration, using default"));
    return { port: 1234 };
  } else {
    console.log("Found configuration", result.config);
    return result.config;
  }
};
```

```js title="tool.config.js"
module.exports = {
  port: 6666,
};
```

这里上面的 cosmiconfig 就会找到对应的配置`tool.config.js` 并加载输出
