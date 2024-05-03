---
title: 前端测试合集
author: Chen YuBo
date: 2024-04-27T16:04:05.712Z
draft: false
category: 前端测试
featured: true
description: "前端测试合集"
tags:
  - vue
---



## 1 给jest 添加 babel 支持 ESModule的import导入

1. 添加babel

```shell
pnpm add @babel/core @babel/preset-env
```

2. 配置.babelrc

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```

好，之后测试就可以使用import导入你要测试的函数了

## 2 jest 中的 toEqual 和 toBe

1. toEqual

- `toEqual`用于检查两个对象的值是否相等。它会递归比较对象的所有属性值，而不仅仅是检查它们是否是同一个对象。
- 适用于检查对象、数组等复杂数据结构的内容是否相等。

```js
expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 }); // 通过
```

2. toBe

- `toBe`用于检查两个对象是否是同一个对象（在内存中的引用是否相同）。
- 适用于检查两个变量是否引用了同一个实际对象，而不关心它们的内容是否相同。

```js
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
const obj3 = obj1;

expect(obj1).toBe(obj3); // 通过，因为它们引用了同一个对象
expect(obj1).not.toBe(obj2); // 通过，因为它们引用了不同的对象
```

## 3 vitest 添加 globals

我们在写单元测试的时候，每一个单元测试文件都需要引入测试框架 vitest，会很繁琐,例如

```js
import { describe, it, expect } from "vitest";
```

可以有几个操作添加globals，避免每次重复操作

1. vitest.config.ts 配置

可以在 vitest.config.ts 添加 global配置，这样就相当于全局引入了 Vitest，不需要每一个文件都引入

```js
import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      //...
      globals: true,
    },
  })
);
```

2. eslint 配置

但发现去掉之后，编辑器会提示 describe 和 it 未定义的错误，是因为错误是 eslint 提示的，我们需要再安装一个插件

```js
pnpm i  eslint-plugin-vitest-globals -D
```

在eslint.js里面添加

```js
module.exports = {
  extends: ["plugin:vitest-globals/recommended"],
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
        "**/*.test.{j,t}s?(x)",
      ],
      env: {
        "vitest-globals/env": true,
      },
    },
  ],
};
```

3. ts添加相关配置

在 tsconfig.vitest.json 添加

```js
 "types": [
      "node",
      "jsdom",
      "vitest/globals"
    ]

```
