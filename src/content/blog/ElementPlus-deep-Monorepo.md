---
title: Element-Plus技术揭秘专栏的知识学习笔记-组件库工程化实战之 Monorepo 架构搭建
author: Chen YuBo
date: 2024-03-09T14:59:53.329Z
featured: false
category: 源码分析
draft: false
description: "学习笔记"
tags:
  - 专栏学习笔记
---

原文地址：https://juejin.cn/post/7146183222425518093#heading-12

## monorepo

### Workspace 协议，模块之间的相互依赖

```json
{
  "@vue/reactivity": "workspace:*",
  "@vue/runtime-core": "workspace:*",
  "@vue/runtime-dom": "workspace:*"
}
```

本地 workspace 包只要进行标注 workspace:_ 协议，这样依赖就本地的包了，而不需要从 npm registry 进行安装。还有一个好处就是子包间相互引用代码时，使用 workspace:_ 的写法来链接子包，而不是具体的版本号，这可以防止多人协作时因为修改版本的遗漏而发生冲突。

### Workspace 包的版本

workspace:_后面的 _ 表示任意版本，除了 \* 还有其他：~ 、^ 符号。

当 workspace 包打包发布时，将会动态替换这些 workspace: 依赖。

假设我们上面的包的版本都是 1.0.0 ，它们的 workspace 配置如下：

```json
{
  "dependencies": {
    "@vue/reactivity": "workspace:*",
    "@vue/runtime-core": "workspace:~",
    "@vue/runtime-dom": "workspace:^"
  }
}
```

将来发包的时候，使用相关的发包工具，比如使用 changesets 来发包，该工具会帮你自动升级版本、产生 CHANGELOG 、自动替换 workspace:\* 为具体版本、自动保持版本一致性。

比如上面的代码将来发布的时候将会被转化为：

```json
{
  "dependencies": {
    "@vue/reactivity": "workspace:1.0.0",
    "@vue/runtime-core": "workspace:~1.0.0",
    "@vue/runtime-dom": "workspace:^1.0.0"
  }
}
```

### 配置 pnpm 的 monorepo 工作区

在我们这个仓库下，我们需要管理多个项目，就可以采用 pnpm 的 monorepo。我们在仓库的根目录下创建一个 pnpm-workspace.yaml 文件，可以在 pnpm-workspace.yaml 配置文件中指定这个仓库中有多少个项目。

```yaml
packages:
  - play # 存放组件测试的代码
  - docs # 存放组件文档
  - packages/* # packages 目录下都是组件包
```

### 创建一些子包

```
├── README.md
├── package.json
├── packages
│   ├── components
│   │   └── package.json
│   ├── theme-chalk
│   │   └── package.json
│   └── utils
│       └── package.json
├── play
└── pnpm-workspace.yaml
```

子包 name，另外两个也是 `@cyb-ui/theme-chalk` 和 `@cyb-ui/utils`

```json
{
  "name": "@cyb-ui/components",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 包的相互调用

`@cyb-ui/components 、@cyb-ui/theme-chalk 、@cyb-ui/utils` 这几个包要互相进行调用呢，就需要把它们安装到仓库根目录下的 node_modules 目录中。

```shell
pnpm install @cyb-ui/components -w
pnpm install @cyb-ui/theme-chalk -w
pnpm install @cyb-ui/utils -w
```

安装好后，他的根目录的 package.json 的依赖如下

```json
  "dependencies": {
    "@cyb-ui/components": "workspace:^",
    "@cyb-ui/theme-chalk": "workspace:^",
    "@cyb-ui/utils": "workspace:^"
  }
```

注意：workspace:^ 将来发布的时候会被转换成具体的版本号。

### monorepo 下的 typescript

```shell
pnpm install vue typescript @types/node -D -w
```

因为 vue 、 typescript 和 @types/node 只是开发环境需要的，所以安装的时候需要添加一个 -D 参数表示安装到开发环境，-w 表示安装到共公模块的 packages.json 中，也就是根目录下的 packages.json。

因为我们使用了 TypeScript，这样我们想要去校验我们的代码，让我们代码有提示，并且可以按照一些规则来解析我们的语法，给我们更友好的提示，我们就需要去初始化一下这个 TypeScript 配置命令。
又因为我们安装了 typescript，所以在 node_modules 目录下 bin 目录里面就会存在一个 tsc 的命令，这个命令，就可以帮我们进行初始化，我们可以使用 npm tsc --init 来初始化，也可以使用 pnpm tsc --init 那么执行这个命令，它就会去 node_modules 目录下 bin 目录找这个 tsc 命令进行执行。

```shell
pnpm tsc --init
```

## 组件 play 环境

我们已经创建好了子包, 用 vite 创建项目即可

```shell
pnpm create vite play --template vue-ts
pnpm install
```

我们希望在根目录下就可以运行 play 项目，我们可以在根目录的 package.json 文件的 scripts 选项进行以下配置：

```json
{
  "scripts": {
    "dev": "pnpm -C play dev"
  }
}
```

## Typescript 的 monorepo 设置

### TypeScript 项目引用 (project references)

tsconfig.json 文件有一个顶级属性"references"，它支持将 TypeScript  的程序项目分割成更小的组成部分，进而可以提高类型检查和编译的速度。我们的组件库已经采取 monorepo 的方式进行管理，也就是将项目根据功能的不同拆分成多个子项目，原则上各子项目之间尽量减少耦合度。比如说我们上面初步把组件库分成组件部分（packages）和展示部分（play），还有将来的测试部分（**tests**），测试和展示部分都是依赖组件部分的，但测试和展示部分是没有关联，所以测试或展示任何一部分发生了改变，应该只编译发生改变的部分，另外没有发生变化的部分不应该进行编译才对。
那么通过 tsconfig.json 文件的顶级属性"references"，就可以将我们的组件库再进行划分，从而变得更加的合理和编译性能的进一步提升。

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.web.json" }, // 组件包部分
    { "path": "./tsconfig.play.json" }, // 组件 play 部分
    { "path": "./tsconfig.vitest.json" } // 组件测试部分
  ]
}
```

### 拆分 tsconfig.json

公共配置项 tsconfig.base.json 文件：

```json
{
  "compilerOptions": {
    "outDir": "dist", // 指定输出目录
    "target": "es2018", // 目标语言的版本
    "module": "esnext", // 生成代码的模板标准
    "baseUrl": ".", // 解析非相对模块的基地址，默认是当前目录
    "sourceMap": false, // 是否生成相应的Map映射的文件，默认：false
    "moduleResolution": "node", // 指定模块解析策略，node或classic
    "allowJs": false, // 是否允许编译器编译JS，JSX文件
    "strict": true, // 是否启动所有严格检查的总开关，默认：false，启动后将开启所有的严格检查选项
    "noUnusedLocals": true, // 是否检查未使用的局部变量，默认：false
    "resolveJsonModule": true, // 是否解析 JSON 模块，默认：false
    "allowSyntheticDefaultImports": true, // 是否允许从没有默认导出的模块中默认导入，默认：false
    "esModuleInterop": true, // 是否通过为所有导入模块创建命名空间对象，允许CommonJS和ES模块之间的互操作性，开启改选项时，也自动开启allowSyntheticDefaultImports选项，默认：false
    "removeComments": false, // 删除注释
    "rootDir": ".", // 指定输出文件目录(用于输出)，用于控制输出目录结构
    "types": [],
    "paths": {
      // 路径映射，相对于baseUrl
      "@cyb-ui/*": ["packages/*"]
    }
  }
}
```

组件包部分配置项 tsconfig.web.json 文件：

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "composite": true, // 是否开启项目编译，开启该功能，将会生成被编译文件所在的目录，同时开启declaration、declarationMap和incremental，默认：false
    "jsx": "preserve", // 指定JSX代码生成用于的开发环境
    "lib": ["ES2018", "DOM", "DOM.Iterable"], // 指定项目运行时使用的库
    "types": ["unplugin-vue-define-options"], // 用来指定需要包含的模块，并将其包含在全局范围内
    "skipLibCheck": true // 是否跳过声明文件的类型检查，这可以在编译期间以牺牲类型系统准确性为代价来节省时间，默认：false
  },
  "include": ["packages"], // 使用 include 来指定应从绝对类型中使用哪些类型
  "exclude": [
    // 提供用于禁用 JavaScript 项目中某个模块的类型获取的配置
    "node_modules",
    "**/dist",
    "**/__tests__/**/*",
    "**/gulpfile.ts",
    "**/test-helper",
    "packages/test-utils",
    "**/*.md"
  ]
}
```

组件 play 部分配置项 tsconfig.play.json 文件：

```json
{
  "extends": "./tsconfig.web.json",
  "compilerOptions": {
    "allowJs": true, // 是否允许编译器编译JS，JSX文件
    "lib": ["ESNext", "DOM", "DOM.Iterable"] // 指定项目运行时使用的库
  },
  "include": [
    // 使用 include 来指定应从绝对类型中使用哪些类型
    "packages",
    "typings/components.d.ts",
    "typings/env.d.ts",

    // playground
    "play/main.ts",
    "play/env.d.ts",
    "play/src/**/*"
  ]
}
```

### 类型检查

Element Plus 组件库是采用 rollup-plugin-esbuild 来进行打包的，此插件的基本原理就是结合使用 ESBuild 和 Rollup 来编译 ESNext 和 TypeScript 代码，而 ESbuild 在编译的时候是不会进行 TypeScript 的类型检查的，所以我们需要在编译之前就进行 TypeScript 的类型检查。

对于纯 TS 文件的项目，我们可以通过 tsc --noEmit 命令来进行类型检查，tsc --noEmit 的意思就是只进行 TypeScript 的语法检测，而不会进行编译。那么 Element Plus 组件库有哪些项目是纯 TS 文件的呢？就是我们的构建程序。在调用 tsc 命令时可以使用命令行参数--project（或-p）指定配置文件进行执行。

```json
{
  "scripts": {
    "typecheck:node": "tsc -p tsconfig.node.json --noEmit"
  }
}
```

包含 SFC 单文件组件的项目，我们则可以使用 Vue 官方提供的 vue-tsc 工具进行类型检查。
vue-tsc  提供的针对单文件组件的命令行类型检查和生成。vue-tsc 是一个基于 volar 的 Vue3 命令行类型检查工具，我们也是可以在执行 vue-tsc --noEmit 时使用命令行参数--project（或-p）指定配置文件进行配置需要检查的内容和方式。

```json
{
  "scripts": {
    "typecheck:web": "vue-tsc -p tsconfig.web.json --composite false --noEmit",
    "typecheck:play": "vue-tsc -p tsconfig.play.json --composite false --noEmit"
  }
}
```

--composite false 不进行增量编译，增量编译指的是生成 .d.ts 和 tsconfig.tsbuildinfo 文件，使用 vue-tsc 法语检查时不能设置为 true。
--noEmit 不进行编译，只进行语法检测。
--composite false --noEmit 不进行编译，也不进行增量编译，只进行语法检测。

## 串并行脚本

原生的串并行

```json
// 串行 使用 &&
{
  "scripts": {
    "runall": "pnpm run typecheck:web && pnpm run typecheck:play && pnpm run typecheck:node && pnpm run typecheck:vitest"
  }
}

// 并行使用 &
{
    "scripts":{
        "runall":"pnpm run typecheck:web & pnpm run typecheck:play & pnpm run typecheck:node & pnpm run typecheck:vitest"
    }
 }

```

- 一个 & 是代表并行执行左指令和右侧指令
- 两个 && 是代表串行执行，先执行左侧指令，再执行右侧命令
- 如果一个命令中既包含 & ,也包含 &&。&并行的级别要高一些，首先会执行&左右两侧的命令，然后再根据左右两侧指令情况进行执行。
