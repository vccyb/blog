---
title: Element-Plus技术揭秘专栏的知识学习笔记-组件库工程化实战之 从终端命令解析器说起谈谈 npm 包管理工具的运行原理
author: Chen YuBo
pubDatetime: 2024-03-18T13:46:10.211Z
featured: false
draft: false
description: "学习笔记"
tags:
  - 专栏学习笔记
---

原文地址：https://juejin.cn/post/7161063570594070559

## 目录

## 终端命令的执行流程

通过命令操控计算机在 DOS、Linux 系统中最常用的方式。命令操作的核心便是命令解析器（如 Linux 中的 Shell）。命令解析器实现接收命令字符串，解析命令并执行相应操作。

常见命令解析器：

- shell：Unix操作系统下的命令解析器
- bash：Linux操作系统下的命令解析器
- cmd：Windows 命令解释器

本质：对用户输入的命令进行解析，调用对应的执行程序。

**命令执行流程**

用户输入一个命令后，系统的执行流程大致为

1. 路径判断

> 识别命令是否包含了路径，则会读取该路径下的命令文件执行，这就是通过命令路径执行命令

2. 判断命令说内部还是外部

> 内部命令：常驻内存，cd ls、 外部命令，在磁盘中，执行需要将此磁盘的命令代码读入内存才能执行

3. 在path变量中查找命令

> 如果，不是内部命令，有没有命令的路径，那么就去系统环境变了PATH配置的目录中查找

4. 其他 报错输入的不是命令

## Node安装和执行

- node的安装，自动给PATH环境变了添加一个node所在的目录

## npm run 发生了啥

### 全局命令和局部命令

```shell
npm install typescript -g
```

执行以上命令之后，我们就获得了一个全局命令 tsc。我们就可以在终端输入 tsc 开头的命令。这是因为我们执行上面的命令代码之后会在系统变量 PATH 中设置的 node 命令所在的目录上写入 tsc

局部呢？

```shell
npm install typescript -D
```

当前目录的 ./node_modules/.bin 文件目录下

这个时候我们是不能直接通过终端执行 tsc 命令的，因为此时 tsc 命令文件所在的目录并没有在系统变量 PATH 中进行设置。

在上述文章中，我们知道命令还可以通过路径进行执行，所以我们可以以下方式执行(绝对路径也可以)：

```
./node_modules/.bin/tsc -v
```

### npx

```
npx eslint --init
```

这是因为 npx 可以直接运行 node_modules/.bin 文件下的命令。npx 可以自动检查命令是否在 node_modules/.bin 目录中或者是否在系统环境变量 PATH 配置的目录路径中。npx 另外一个更实用的特点是，它在执行相关模块命令时会先进行依赖安装，但会在安装成功并执行完相关命令代码后便删除此依赖，从而避免了全局安装带来的问题。

### npm scripts

我们知道我们可以在 package.json 文件的 scripts 选项中进行自定义脚本，然后通过 npm run xxx 来执行。原理就是 npm run 会创建一个 shell 脚本，package.json 文件的 scripts 选项中自定义的脚本内容就会在这个新创建的 shell 脚本中运行。

所以我们上述局部安装 typescript 的命令还可以通过 package.json 文件的 scripts 选项中自定义的脚本内容方式进行执行。package.json 代码设置如下：

```json
"scripts": {
	"tsctest": "tsc -v"
}
```

### 小结

通过上文我们就可以知道 npm run 发生了什么。首先是 npm scripts 本质是一个 Shell 脚本，原理就是执行 npm run 的时候会自动新建一个 Shell，在这个 Shell 里面执行指定的脚本命令，同时会把当前目录下的 node_modules/.bin 目录路径添加到系统环境变量 PATH 中，这样 Shell 脚本的命令解析器就可以查找当前目录中的 node_modules/.bin 目录中的命令了，执行结束后，再将 PATH 变量恢复原样 。然后再通过命令执行对应的应用程序，然后输出结果。重点：Shell 在寻找命令的时候是按照系统环境变量 PATH 中配置的目录去查找的，如果找到了就执行对应的命令，若找不到就报错。

另外只要是 Shell 脚本可以运行的命令，都可以作为 npm scripts 脚本。因此它不一定是 Node 脚本，任何可执行文件都可以写在里面。比如如果系统安装了 ffmpeg ，也可以将 ffmpeg 脚本作为 npm scripts。npm 脚本的退出码也遵守 Shell 脚本规则。如果退出码不是 0，npm 就认为这个脚本执行失败。

## Node Cli 命令运行原理

### 创建 Node CLI 命令

我们先创建一个目录：npm-link-test，然后在根目录下进行 Node 项目初始化操作。即运行以下命令：

```shell
npm init -y
```

然后新建目录bin，在bin目录下新建一个index.js文件，这个文件到时是作为一个shell文件进行执行的，需要在文件开头加一行：

```
#!/usr/bin/env node
```

配置package.json文件，增加bin字段，如下：

```json
{
  "bin": {
    "npm-link-test": "./bin/index.js"
  }
}
```

这个配置的意思是说，这个指令名称是 npm-link-test  运行之后执行的是 "./bin/index.js" 这个文件的代码。

为我们只是为了理解 Node Cli 命令的运行原理，我们只需要在终端输入 npm-link-test 命令能运行起来即可。所以我们在 "./bin/index.js" 文件中加一行能体现我们命令运行成功的代码：

```js
#!/usr/bin/env node
console.log("这是测试命令");
```

所以只要在终端输入 npm-link-test 然后能打印：'这是测试命令' 即可。

## npm link

### 全局安装调试

我们开发了一个库包或者一个 Node CLI 工具，是不适合发布到线上进行调试的。所以我们可以利用 npm link 高效地进行本地调试。

进行全局虚拟安装，在项目根目录下执行以下命令：

```shell
npm link
```

其实我们执行 npm link 命令相当于执行了全局安装

当然别忘了，调试结束后执行 npm unlink 命令取消安装关联。

### 局部安装调试

我们上面是通过全局安装进行调试，但我们有可能需要进行具体项目的局部安装，也就是安装到具体的项目中。我们可以进入具体项目的根目录下执行：

```
npm link npm-link-test
```

但此种方式有可能会报错，我们还可以通过以下方式安装：

```
npx link L:\work2022\t\npm-link-test
```

也就是 `npx link <package-path>` 方式。这样就可以在具体的项目中的 node_modules/bin 目录中安装了相关命令文件。

## 小结

Node CLI 命令就是通过在 JavaScript 文件头部添加 Shell 脚本声明，然后通过 package.json 文件的 bin 选项定义 Node CLI 命令名称及 Shell 脚本文件的位置。然后安装的时候就会根据 package.json 文件的 bin 选项声明的 Node CLI 命令名称生成不同平台的命令文件，命令文件的主要内容就执行 Node CLI 命令文件的内容。通常安装的时候随着项目安装到对应的 node_modules 目录下，局部安装的时候 Node CLI 命令文件是在 node_modules/bin 目录中，全局安装的时候 Node CLI 命令文件则在系统环境变量 PATH 设置的 node 命令所在的目录中。

## npm install

npm run 主要是执行 package.json 中 scripts 选项定义的脚本，而 npm install 则是用来安装项目依赖。

执行 npm install 命令之后，当前项目如果定义了 preinstall 钩子此时会被执行。之后会获取 npm 配置，即 .npmrc 文件。

优先级：

1. 项目级的 .npmrc 文件
2. 用户级的 .npmrc 文件
3. 全局级的 .npmrc 文件
4. npm 内置的 .npmrc 文件

然后检查项目根目录中有没有 package-lock.json 文件，如果有 package-lock.json 文件，则检查 package-lock.json 文件和 package.json 文件中声明的版本是否一致。

一致，直接使用 package-lock.json 文件中的信息，从缓存或从网络仓库中加载依赖。
不一致，则根据 npm 版本进行处理。

- npm v5.0x：根据 package-lock.json 下载。
- npm v5.10 - v5.4.2：当 package.json 声明的依赖版本规范有符合的更新版本时，忽略 package-lock.json，按照 package.json 安装，并更新 package-lock.json
- npm v5.4.2 以上： 当 package.json 声明的依赖版本规范与 package-lock.json 安装版本兼容时，则根据 package-lock.json 安装；如果 package.json 声明的依赖版本规范与 package-lock.json 安装版本不兼容，则按照 package.json 安装，并更新 package-lock.json。

如果没有 package-lock.json 文件，则根据 package.json 文件递归构建依赖树，然后按照构建好的依赖树下载完整的依赖资源，在下载时会检查是否有相关缓存。

有，则将缓存内容解压到 node_modules 目录中。

没有，则先从 npm 远程仓库下载包资源，检查包的完整性，并将其添加到缓存，同时解压到 node_modules 目录中。

最后生成 package-lock.json 文件。

## 幽灵依赖

幽灵依赖可以看原文
