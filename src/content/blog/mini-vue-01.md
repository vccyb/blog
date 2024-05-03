---
title: mini-vue-01-工程搭建
author: Chen YuBo
date: 2024-03-08T16:27:16.027Z
featured: false
category: 源码分析
draft: false
description: "mini-vue这个工程搭建"
tags:
  - mini-vue
---

## 工程初始化

我们使用 pnpm+monorepo 方式组织我们的 mini-vue

```shell
mkdir cyb-mini-vue
pnpm init
```

## 安装依赖

```json
{
  "name": "cyb-mini-vue",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "vitest"
  },
  "engines": {
    "node": ">=18",
    "pnpm": ">=8"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "happy-dom": "^12.10.3",
    "typescript": "^5.3.2",
    "vite": "^5.0.2",
    "vitest": "^0.34.6"
  }
}
```

暂时安装这几个依赖即可

```shell
pnpm install
```

## 创建子包

```
- packages
  - reactivity
    - src
  - shared
    - src
```

在每个子包下, 初始化一下

```shell
pnpm init
```

pnpm workspace 配置 pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

## ts 设置

tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "strict": true,
    "rootDir": ".",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "target": "es2016",
    "module": "esnext",
    "noImplicitAny": false,
    "removeComments": true,
    "preserveConstEnums": true,
    "sourceMap": true,
    "downlevelIteration": true,
    "lib": ["esnext", "DOM"],
    "types": ["vitest/globals"],
    "paths": {
      "@mini-vue/*": ["packages/*/src"]
    }
  },
  "include": ["packages/*/src", "packages/*/__test__"]
}
```

## vitest 设置

```ts
import { defineConfig } from "vitest/config";
import path from "path";
export default defineConfig({
  test: {
    globals: true,
    include: ["./**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
  resolve: {
    alias: [
      {
        find: /@mini-vue\/(.+)/i,
        replacement: path.resolve(__dirname, "packages", "$1/src"),
      },
    ],
  },
});
```

## 字包引用

```json
{
  "name": "reactivity",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@mini-vue/shared": "workspace:^"
  }
}
```

## 一个测试例子

packages/shared/src/index.ts

```ts
const isObject = (value: unknown) =>
  value !== null && typeof value === "object";

export { isObject };
```

packages/reactivity/**test**/index.test.ts

```ts
import { isObject } from "@mini-vue/shared";
console.log("isObject 调用成功", isObject(1));

describe("test ", () => {
  it("isObject 调用成功", () => {
    expect(isObject(1)).toBe(false);
  });
});
```

根目录

```shell
pnpm test
```

```
> vitest


 DEV  v0.34.6 /Users/chenyubo/Project/mini-vue

stdout | unknown test
isObject 调用成功 false

 ✓ packages/reactivity/__test__/index.test.ts (1)
   ✓ test  (1)
     ✓ isObject 调用成功

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  00:39:56
   Duration  161ms (transform 23ms, setup 0ms, collect 11ms, tests 1ms, environment 0ms, prepare 59ms)
```
