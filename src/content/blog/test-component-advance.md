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

## 如何设置 props

```js
<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>{{ msg }}</div>
</template>
```

```js
it("mount props", async () => {
  const wrapper = mount(Props, {
    props: {
      msg: "props msg",
    },
  });
  expect(wrapper.text()).toContain("props msg");
});
```

### 动态 setProps

```js
it("update props", async () => {
  const wrapper = mount(Props, {
    props: {
      msg: "props msg",
    },
  });
  expect(wrapper.text()).toContain("props msg");
  await wrapper.setProps({
    msg: "second render",
  });
  expect(wrapper.props("msg")).toBe("second render"); // props 有没有值
  expect(wrapper.text()).toContain("second render"); // props 是否正确渲染在页面上
});
```

日志输出

```js
console.log("wrapper", wrapper.props("msg"));
```

## 如何测试 emits

要修改和添加案例

```js
<script setup lang="ts">
interface Emits {
  (e: 'change', value: string)
  (e: 'update:pageIndex', value: number)
  (e: 'update:pageSize', value: string, size: number)
}

const emits = defineEmits<Emits>()

const resetPage = (value: string) => {
  emits('update:pageSize', value, 10)
  emits('update:pageIndex', 1)
  emits('change', value)
}
</script>

<template>
  <div @click="resetPage('customer')" data-testid="button">button</div>
</template>

```

```js
it("mount", async () => {
  const wrapper = mount(Emitted);
  const button = wrapper.find('[data-testid="button"]');
  await button.trigger("click");
  const emits = wrapper.emitted();
  console.log("emits", emits);
  // emits {
  //   'update:pageSize': [ [ 'customer', 10 ] ],
  //   'update:pageIndex': [ [ 1 ] ],
  //   change: [ [ 'customer' ] ],
  //   click: [ [ [MouseEvent] ] ]
  // }
  expect(emits).toHaveProperty("update:pageIndex");
  expect(emits).toHaveProperty("update:pageSize");
  expect(emits).toHaveProperty("change");
});
```

wrapper.emitted() 是一个数组，可以获取到 emit 事件的记录，根据数组里面的内容去断言

## provide/inject

```vue title="Parent.vue"
provide('parentValue', 'this is parent data')
```

按钮组件拿到 parent 传递过来的 parentValue 值

```vue title="Button.vue"
const text = inject('parentValue')
<div> {{ text }}</div>
```

```js
describe("测试 provide", () => {
  it("测试顶层组件渲染正确传递值给子组件", async () => {
    const wrapper = mount(Parent);
    expect(wrapper.text()).toContain("this is parent data");
  });

  it("测试子组件能拿到顶层组件传递的值", async () => {
    const wrapper = mount(Button, {
      global: {
        provide: {
          parentValue: "test provide",
        },
      },
    });
    expect(wrapper.text()).toContain("test provide");
  });
});
```
