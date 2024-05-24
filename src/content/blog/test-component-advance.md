---
title: "vitest 测试组件-深入"
date: 2024-05-24T12:25:58.155Z
description: "学习vitest测试组件-深入"
category: 前端测试
---

## 前置知识

### 异步

在 JavaScript 中执行异步代码是很常见的，我们前面学的 it 上下文，是一个同步的上下文，在我们测试组件的时候，尤其是 vue 更新 setData 的时候，是异步的。这就需要在一个异步的 it 上下文中执行断言代码

之前我们学过的同步上下文

```js
it("mount first render", () => {});
```

异步上下文只需要加一个 async，然后就可以使用 await，类似 js 的 async await 用法一样

```js
it("update multiple render", async () => {
  // async await
  await nextTick();
});
```

## 如何设置 Data

我们之前说了 mount 和 shallowMounnt, 其实 mount 还有第二个参数，可以设置

```vue
<script setup lang="ts">
import { ref } from "vue";
const str = ref("");
</script>

<template>
  <div>{{ str }}</div>
</template>
```

```js
it("mount", async () => {
  const wrapper = mount(Data, {
    setup() {
      return {
        str: "first render",
      };
    },
  });
  expect(wrapper.text()).toContain("first render");
});
```

我们日常业务还是极少会手动设置 data,往往是 mount 勾子里面去修改 data

### 如何解决 mount 之后的数据变化？

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
const str = ref("first render");
onMounted(() => {
  str.value = "second render";
});
</script>

<template>
  <div>{{ str }}</div>
</template>
```

因为勾子函数异步更新了 str，所以需要使用 await nextTick()等待更新完成之后再断言

```js
it("mount", async () => {
  const wrapper = mount(Data, {});
  expect(wrapper.text()).toContain("first render");
  await nextTick();
  console.log("wrapper.text()", wrapper.html());
  expect(wrapper.text()).toContain("second render");
});
```

### 如何临时修改组件的值？

```js
it("mount", async () => {
  const wrapper = mount(Data, {});
  expect(wrapper.text()).toContain("first render");
  await nextTick();
  expect(wrapper.text()).toContain("second render");

  wrapper.vm.str = "third render";
  await nextTick();
  console.log("wrapper.text()", wrapper.html());
  expect(wrapper.vm.str).toBe("third render"); // data 有没有值
  expect(wrapper.text()).toContain("third render"); // data 是否正确渲染在页面上
});
```
