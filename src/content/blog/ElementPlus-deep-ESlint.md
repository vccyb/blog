---
title: Element-Plus技术揭秘专栏的知识学习笔记-组件库工程化实战之 ESlint全解
author: Chen YuBo
pubDatetime: 2024-03-12T11:49:42.677Z
featured: false
draft: false
description: "学习笔记"
tags:
  - 专栏学习笔记
---

原文地址：https://juejin.cn/post/7157743898939359262#heading-31

## 目录

## ESlint 的主要作用

ESLint 的主要作用在最后一项已经进行了总结：**检查语法，发现问题、强制代码风格**。

## ESlint的工作原理

ESLint 是如何读懂我们的代码的呢？答案是靠 AST。ESLint 主要通过 AST 进行工作的，把源码通过编译器编译成 AST，然后遍历 AST 节点进行和我们配置的 ESLint 规则进行匹配，匹配成功了就通过规则里的函数进行对 AST 节点的操作，找到问题和要修复的地方，遍历完所有 AST 节点之后遍进行相应提示或修复。

- 源码编译器编译为AST
- 遍历AST节点，匹配规则
- 匹配成功，进行响应的函数操作
- 遍历完所有AST节点，提示问题或修复

### ESlint 如何读取配置的

在启动了 ESLint 检测命令之后，ESLint 将自动在待校验的文件目录里寻找 ESLint 配置文件，接着是父级目录，一直到系统的根目录，除非在 ESLint 配置文件中指定 root: true 停止向上寻找。这也是 ESLint 配置文件中 root: true 配置项的作用。

在读取配置的过程中有一个点是需要特别注意的，就是配置文件中的 extends 选项的理解，extends 选项就是继承其他配置文件，通过 extends 选项我们可以使用自身的配置（eslint: 开头）或者插件中的配置（plugin: 开头）或者是第三方模块中的配置。最终 ESLint 会通过递归处理 extends，合并成一个配置对象。

### 编译源码获取AST

在加载完毕配置之后，ESlint就进行编译器的确定，选一个编译器对源码进行编译

> 当用户没有指定 parser 时，默认使用 espree，若有指定 parser 则使用指定的 parser。通过编译器编译源码之后就获得了 AST，然后就可以通过 AST 去操作我们的源码了。

### Rules的原理

在前面读取配置的时候，就已经把所有的 plugin 和它的 rules 加载进来了。

Rules 的原理就是针对源码的 AST 节点添加处理函数，也就是访问者函数。在该函数内进行该 AST 节点的分析操作，看看该 AST 节点有没有存在我们不希望存在的情况，有那么就进行输出警报信息和记录怎么修复的信息。

### 最后输出警报和修复

在通过编译器获得 AST 之后，就可以遍历 AST，然后查看规则中有没有配置针对该 AST 节点进行检查的 visitor 函数，如果存在就会调用该 visitor 函数进行处理，获得警报信息或者要修复的信息，最后输出警报信息和进行相关源码修复。

## 创建一个ESlint 插件

### 创建一个ESLint的插件开发环境

```
├── README.md
├── package.json
├── packages
│   ├── eslint-guide
│   │   ├── .eslintrc.js
│   │   └── package.json
│   └── eslint-plugin-colint
│       └── package.json
└── pnpm-workspace.yaml
```

创建一个 monorepo的工程

我们进入 `eslint-plugin-colint` 目录运行以下命令：

```
pnpm add yo generator-eslint -g
```

生成插件模板

```
yo eslint:plugin
```

> tips: 这里要特别说明一下的是 ESLint 的插件 npm 包的名称必须以 eslint-plugin- 开头，而我们上面通过命令创建的 ESLint 插件则自动命名为了 eslint-plugin-colint，我们查看一下 eslint-plugin-colint 目录下的 package.json 的 name 属性值就知道了。

生成规则

```
yo eslint:rule
```

接着会在 lib 目录下生成一个 rules 目录及一个 no-var.js 的文件。

### 调试及编写ESlint插件

接着我们先把插件运行起来。我们回到根目录把我们的插件安装起来：

```shell
pnpm install eslint-plugin-colint@workspace -w
```

注意你的`pnpm-workspace.yaml` 要包含子包

```
packages:
  - packages/*
```

安装完毕之后的根目录的package.json 文件如下：

```json
  "dependencies": {
    "eslint-plugin-cyb": "workspace:^"
  }
```

再进到 eslint-guide 目录下把我们上面创建的 ESLint 插件在 .eslintrc.js 中配置起来：

```json
{
  "plugins": ["colint"],
  "rules": {
    "colint/no-var": ["error"]
  }
}
```

注意：ESLint 插件在配置项 plugins 中只需要写插件名称即可。eslint-plugin- 此部分不用填写。

给我们的 no-var这条规则加上监听

```js
module.exports = {
  meta: {
    //...
  },

  create(context) {
    return {
      VariableDeclaration(node) {
        console.log(node);
      },
    };
  }
```

可以看到打印的信息

有因为变量声明有 const、let、var 所以又进一步判断是不是 var，如果是 var 那么我们就可以通过上下文对象 context.report() 方法进行发布警告或错误，相关代码如下：

```js
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === "var") {
          context.report({ node, message: "不能使用 var" });
        }
      },
    };
  }
```

再次执行试试

```
/Users/chenyubo/readingBox/readingBox/源码系列/Element专栏/ESlint/packages/eslint-guide/test.js
  1:1  error  不能使用 var  cyb/no-var

✖ 1 problem (1 error, 0 warnings)
```

成功进行警告，说明我们的插件代码编写是成功的。

### ESlint 修复代码

```js
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "自定义插件",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code", // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: {},
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      VariableDeclaration(node) {
        if (node.kind === "var") {
          context.report({
            node,
            message: "不能用var",
            fix(fixer) {
              const varToken = sourceCode.getFirstToken(node);
              return fixer.replaceText(varToken, "let");
            },
          });
        }
      },
    };
  },
};
```

再运行 `npx eslint test.js --fix` 要修复代码必须加 --fix

### 插件规则配置集成共享

我们一个插件里面可能会有很多 rules。从下图 eslint-plugin-vue 插件的目录结构可以看到 eslint-plugin-vue 插件有非常多的规则。

如果都像我们上面自定义的规则那样在 .eslintrc.js 的 plugins 中配置引入，再在 rules 中进行具体每一条的配置，那么这样则让使用者太麻烦了，所以我们可以把相关的规则集成一个组合推荐给用户，用户自己使用推荐的规则组合即可。

```js
module.exports = {
  plugins: ["cyb"],
  rules: {
    "cyb/no-var": "error",
    // ... 很多很麻烦
  },

```

ok，怎么共享呢？

我们自己的eslint插件暴露一个`index.js`, 比如我们的eslint-plugin-cyb,就是 `ESlint/packages/eslint-plugin-cyb/lib/index.js`

```js
module.exports = {
  rules: requireIndex(__dirname + "/rules"),
  configs: {
    recommended: {
      plugins: ["colint"],
      rules: {
        "colint/no-var": ["error"],
      },
    },
  },
};
```

这样表明我们在 configs 选项中设置了一组 recommended 的规则，后续用户可以直接使用该集成的规则配置，而不用自己手动在 .eslintrc.js 文件中的 rules 中进行一个个规则配置了。

用户使用的时候呢？直接extends，就能继承所有的写到里面的rules了

```js
module.exports = {
  extends: ["plugin:colint/recommended"],
};
```

一样的效果，更加的清爽好用！！！

## 创建可共享的ESlint 配置

我们现在的前端项目基本都需要配置 ESLint 的，相同的项目的 ESLint 的配置都是差不多的。如果每一个项目都需要进行从头开始配置的话，那么就非常浪费不必要的时间了，所以我们希望可以针对一些相同的项目只进行一次配置然后在其他项目中直接引用即可，这就是 ESLint 共享配置。并且还可以把 ESLint 共享配置上传到 npm 服务器供其他人下载下来在其项目中安装使用。

一个 ESLint 共享配置, 加入这个包名叫`eslint-config-cobytelint`

一般这种配置命名都是 `eslint-config-xxx`

```js
module.exports = {
  extends: ["plugin:colint/recommended"],
};
```

用户使用

```js
module.exports = {
  extends: ["cobytelint"],
};
```

注意：共享配置包在配置项 extends 中只需要填写 eslint-config- 后面部分即可

## 核心概念再次梳理 ESLint 配置文件中 extends、plugin 及 rules 的区别

### ESLint 的核心 — rules

ESLint 的核心就是它的规则，通过规则进行代码校验和代码修复。我们把上面我们实现的 no-var 的 ESLint 规则 的文件夹 rules 拷贝到我们的测试目录 eslint-guide 中。

对 .eslintrc.js 文件进行以下配置：

```js
module.exports = {
  rules: {
    "no-var": ["error"],
  },
};
```

命令制定rules目录

```js
npx eslint test.js --rulesdir rules // --rulesdir 指定运行的规则目录
```

那么如果我想分享我写的 ESLint 规则给其他人使用，要怎么做呢？ESLint 则提供了 plugins 的插件机制来实现这一功能。

### ESLint 的插件机制 — plugins

ESLint 本身已经提供了很多的规则，但也覆盖不了所有的情况，所以我们可以通过自定义规则进行处理。如果我们想对自定义的规则进行共享，那么就可以通过 ESLint 提供的 plugins 机制进行。

例如我们上文中就实现了一个 ESLint 插件 eslint-plugin-colint。我们就可以把该插件发布成 npm 包，然后提供给他人下载使用。

插件通常是针对某一种特定场景定义开发的一系列规则，例如 eslint-plugin-vue 就是针对 Vue 项目开发的 ESLint 插件，eslint-plugin-prettier 就是针对 Prettier 开发的 ESLint 插件。

插件的使用

```js
// .eslintrc.js
{
    plugins: ['prettier'],
    rules: {
      	// prettier
    	'prettier/prettier': 'error',
    }
}
```

插件可以通过在 .eslintrc.js 文件中的 plugins 填写插件名称就可以进行引入了，比如 eslint-plugin-prettier 只需要填 prettier，eslint-plugin-vue 只需要填 vue 即可。在 plugins 中进行引入之后，还需要在 rules 选项中进行设置你需要的规则。**但如果规则非常多，都需要手动进行设置的话，就太麻烦了，所以还可以简便方式使用插件本身已经配置好的推荐选项。**例如进行以下设置：

```js
// .eslintrc.js
{
    extends: ['plugin:vue/vue3-recommended']
}

```

在 extends 选项中进行设置，其中 plugin: 表示这是一个插件，后面跟着的就是插件名称，/ 后面表示的该插件配置集成选项，也就是该插件已经进行相关的 rules 设置，使用者只需要使用它推荐的就可以了。

比如eslint-plugin-vue，他的lib/index.js

```json

config: {
  'vue3-recommended': {
    //...
  }
}

```

即便在 extends 引用了推荐的配置选项，但你还是可以在 rules 选项中进行重新配置相关 rules。

```js
// .eslintrc.js
{
    extends: ['plugin:vue/vue3-recommended'],
    rules: {
       'vue/no-v-html': 'off'
    }
}
```

### extends 继承

在上一小节中我们已经通过 extends 选项进行配置 ESLint 插件进行使用了，extends 选项除了配置 ESLint 插件之外，还可以配置一个 npm 包，也可以理解为继承他人的 ESLint 配置方案，可以看成实际就是一份别人配置好的 .eslintrc.js 。

extends 配置一个 npm 包，对此 npm 包的名称是有要求的，我们在前文中也有说到了，在这里再重申说明一下，ESLint 的共享配置 npm 包必须是以 eslint-config-xxx 开头或者 @xxx/eslint-config 此种类型，其中 xxx 是具体的名字，这是 ESLint 共享配置 npm 包名称的约定。

下面是 ELement-Plus 的 ESLint 配置的 extends 选项。

```js
extends: [
    'eslint:recommended',
    'plugin:import/recommended', // 插件中的 extends
    'plugin:eslint-comments/recommended',
    'plugin:jsonc/recommended-with-jsonc',
    'plugin:markdown/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
],
```

- eslint: 开头表示的是 ESLint 自身的规则
- plugin: 开头的示的是 ESLint 插件的规则
- 此外的则是 ESLint 共享配置

总的来说 extends 选项就是继承其他配置文件，秉着尽可能复用的原则，ESLint 允许我们使用自身的配置（eslint: 开头）或者插件中的配置（plugin: 开头）或者是第三方模块中的配置。

## ESlint 的强项

我们在上文中已经对 ESLint 的主要作用进行了总结：检查语法，发现问题、强制代码风格。再进一步概括就是两项：代码质量问题 和 代码风格问题。

我们一般只使用 ESLint 做代码校验，而强制代码风格我们则使用 Prettier，因为 ESLint 处理代码风格的能力并没有 Prettier 专业。专业的人做专业的事，所以让 Prettier 接管我们的代码风格。

### ESlint 与 Prettier

ESLint 已经有部分代码风格的检测，直接和 Prettier 进行使用会发生冲突，所以我们需要把发生冲突的规则都关闭掉。我们可以使用 `eslint-config-prettier` 来关掉所有和 Prettier 冲突的 ESLint 的配置项。具体就是在 .eslintrc.js 配置文件里面将 prettier 设为最后一个 extends。

```js
// .eslintrc.js
{
    extends: ["prettier"] // 必须是最后一个，才能确保覆盖
}
```

当我们希望运行 ESLint 命令 --fix 的时候，也可以进行代码风格修复，那么我们就需要安装 `eslint-plugin-prettier` 。

```js
// .eslintrc.js
{
    plugins: ['prettier'],
    extends: ["prettier"], // prettier 必须是最后一个，才能确保覆盖
    rules: {
      	// prettier
    	'prettier/prettier': 'error',
    }
}
```

`extends` 中的 `prettier` 代表的是 `eslint-config-prettier`，是进行关掉所有和 Prettier 冲突的 ESLint 的配置项。

`plugins` 中的 `prettier` 代表的是 `eslint-plugin-prettier`，引入 ESLint 的 Prettier 插件，然后在 rules 选项中进行配置 `'prettier/prettier': 'error'`，这样就开启了 ESLint 的 Prettier 插件。这样我们就可以在运行 ESLint 命令 --fix 的时候，也可以进行代码风格修复。

其实上面的 .eslintrc.js 文件还可以合并成以下方式，这也是官方推荐的配置：

```js
// .eslintrc.js
{
   extends: ["plugin:prettier/recommended","prettier"], // prettier 必须是最后一个，才能确保覆盖
}
```

## 代码规范自动设置

### VScode workspace设置

值得注意的是我们一般都会进行 VSCode 的 Worksapce 选项设置，设置完后会在根目录下生成一个 .vscode 目录并且这个目录是提交到仓库中的，这样所有使用 VSCode 编辑器的人打开这个项目都会拥有相同的配置体验。

### VScode 的 ESlint 插件配置

在 VSCode 中我们要自动执行我们设置的 ESLint 配置，就要安装 VSCode 的 ESLint 插件。

VSCode 的 ESLint 插件首先会查找当前的目录中有没有 ESLint 配置，没有的话就有去全局中查找 ESLint 的配置，如果都没有的话就不进行校验了，

ESLint 将自动在待校验的文件目录里寻找 ESLint 配置文件，接着是父级目录，一直到系统的根目录，除非在 ESLint 配置文件中指定 root: true 停止向上寻找。这也是 ESLint 配置文件中 root: true 配置项的作用。

VSCode 的 ESLint 插件配置配置项：

- `eslint.enable` 启用或者禁用 VSCode 的 ESLint 插件，默认开启。
- `eslint.validate` 指定要校验的文件类型，默认为 ["javascript", "javascriptreact"]。如果待校验的文件类型属于 eslint.validate，VSCode 的 ESLint 插件就会进行 ESLint 校验。这是一个旧的设置。
- `eslint.probe` 指定要校验的文件类型，默认值为 ["javascript"、"javascriptreact"、"typecript"、"typecriptreact"、"html"、"vue"、"markdown"]。如果待校验的文件类型属于 eslint.probe，且 ESLint 配置文件中没有引入相应的插件，那么就不进行 ESLint 校验；如果待校验的文件类型属于 eslint.probe，且 ESLint 配置文件中引入了相应的插件，那么就进行 ESLint 校验。
- `editor.codeActionsOnSave` 如果设置为 true，则所有 ESLint 插件的可自动修复的错误都将在保存时被修复。

`.vscode` 目录的配置文件 settings.json 中的 ESLint 配置选项：

```json
{
  "eslint.probe": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html",
    "vue",
    "markdown",
    "json",
    "jsonc"
  ],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html",
    "vue",
    "markdown",
    "json",
    "jsonc"
  ]
}
```

## 总结

1. ESLint 的主要作用就是检查语法，发现问题、强制代码风格。它的工作原理就是通过编译器编译源码获得 AST，然后遍历 AST 节点，通过规则对 AST 节点进行检查，获得警报信息和修复信息，最后输出警报信息和进行源码修复。
   我们一般只使用 ESLint 做代码校验，强制代码风格我们则使用 Prettier。并且通过分析 `eslint-plugin-prettier` 是如何工作的，我们可以更加深刻理解 ESLint 配置中的 extends 和 plugins 选项的区别和作用，这也是 ESLint 配置中最需要理解的通透的选项。

2. ESLint 自身虽然已经提供了很多检查的规则，但还是覆盖不了所有的场景，所以 ESLint 提供了插件机制让我们可以自定义规则去处理我们特有的场景。plugins 是以 `eslint-plugin-` 开头的，例如 `eslint-plugin-prettier`。又因为 `eslint-plugin-prettier` 中有很多规则是跟 ESLint 原先的规则是有冲突的，所以我们需要把它们都关闭掉，但如果每次都进行手动配置关掉的话，太麻烦了，所以我们可以配置好一份设置之后进行共享，以后只需要使用这一份配置就可以了，这就是 ESLint 中的共享配置，并且可以发布成 npm 包，包名约定为以 `eslint-config-xxx` 开头或者 `@xxx/eslint-config` 此种类型。

3. 我们希望在我们书写代码的时候，就立刻能提示错误，同时在我们保存的时候进行相应的格式化，那么我们就要进行各种编辑器插件的配置，这就是代码规范自动化最重要的一部分。
