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

## 1 给 jest 添加 babel 支持 ESModule 的 import 导入

1. 添加 babel

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

好，之后测试就可以使用 import 导入你要测试的函数了

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

可以有几个操作添加 globals，避免每次重复操作

1. vitest.config.ts 配置

可以在 vitest.config.ts 添加 global 配置，这样就相当于全局引入了 Vitest，不需要每一个文件都引入

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

在 eslint.js 里面添加

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

3. ts 添加相关配置

在 tsconfig.vitest.json 添加

```js
 "types": [
      "node",
      "jsdom",
      "vitest/globals"
    ]

```

## 4 vitest 中的 toStrictEqual 和 toEqual 区别

- 检查具有 `undefined`  属性的键。 例如 使用  `.toStrictEqual`  时， `{a: undefined, b: 2}`  与  `{b: 2}`  不匹配。
- 检查数组稀疏性。 例如 使用  .toStrictEqual  时， [, 1]  与  [undefined, 1]  不匹配。
- 检查对象类型是否相等。 例如 具有字段  a  和  b  的类实例不等于具有字段  a  和  b  的文字对象。

```js
it("test toStrictEqual", () => {
  const stockBill = {
    type: "apples",
    count: 13,
    name: undefined,
  };
  const stockMary = {
    type: "apples",
    count: 13,
  };
  class Stock {
    type: any;
    constructor(type: any) {
      this.type = type;
    }
  }
  expect(stockBill).not.toStrictEqual(stockMary);
  expect([1]).not.toStrictEqual([undefined, 1]);
  expect(new Stock("apples")).not.toStrictEqual({ type: "apples" });
});
```

## 5 vitest 中 Error

捕获错误的一个断言方法，例如在一些抛出错误，表单检验、数据格式错误、try...catch 等场景下会用到

```js
it("test Error ", () => {
  expect(() => {
    JSON.parse("{");
  }).toThrow();
});
```

## 6 vitest 中的快照断言

快照可以理解成，把对象的结构或者基础数据类型转换成字符串，然后做一个拍照存档的概念，一般用于记录，其实就是一个偷懒的行为。例如我有一个盒子，里面有一个苹果，我拍照记录了，下次如果盒子里面放了梨，那就代表盒子被别人动过了，用例就会失败了

### toMatchInlineSnapshot

toMatchInlineSnapshot 用于行内快照断言，它适合小范围,少量的数据结构存储

```js
it("test toMatchInlineSnapshot", () => {
  const data = { foo: new Set(["bar", "snapshot"]) };
  expect(data).toMatchInlineSnapshot(`
      {
        "foo": Set {
          "bar",
          "snapshot",
        },
      }
    `);
  expect(22).toMatchInlineSnapshot("22");
  expect(true).toMatchInlineSnapshot("true");
  expect([1, 2, 3]).toMatchInlineSnapshot(`[
  1,
  2,
  3,
]`);
  expect({ name: "xxx" }).toMatchInlineSnapshot(`{
  "name": "xxx",
}`);
});
```

有个坑，就是匹配对象，使用行内快照的时候，就需要匹配的快照字符串和引号隔开

### toMatchSnapshot

toMatchSnapshot 快照断言会生成一个文件，它适合一些大型的，长久不变更的地方，例如对配置文件进行快照或者如果使用一些远程图标库 icon，我们可以对 icon 地址进行快照，这个文件如果变更了，就会出现报错，报错就代表有风险，需要谨慎操作。

```js
it("test toMatchSnapshot", () => {
  const config = { url: "url", domain: "domain", analysis: "analysis alias" };
  expect(config).toMatchSnapshot();
});
```

例如上面的用例执行了之后，会生成一个文件 **`__snapshots__/expect.test.ts.snap`**，文件上一次快照生成时候的样子

如果这个配置文件某天被某个小可爱不小心修改了，那就会报错，用例就通过不了，需要二次确认

然后在命令行输入 u 二次确认之后就可以通过了

## 7 vitest 中的函数断言

- `toHaveBeenCalled` 判断函数是否被调用
- `toHaveBeenCalledTimes` 判断函数被调用的次数
- `toHaveBeenCalledWith` 判断函数被调用的时候传递了什么参数

上面的断言在执行之前，要先使用 `vi.spyOn` 对原函数进行调用, 例如下面例子的 `vi.spyOn(market, 'buy')`

```js
it("test function ", () => {
  const market = {
    buy(subject: string, amount: number) {
      // ...
    },
  };
  const buySpy = vi.spyOn(market, "buy");
  expect(buySpy).not.toHaveBeenCalled();
  market.buy("apples", 10);
  market.buy("apples", 10);
  expect(buySpy).toHaveBeenCalled();
  expect(buySpy).toHaveBeenCalledTimes(2);
  expect(buySpy).toHaveBeenCalledWith("apples", 10);
});
```
