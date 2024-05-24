---
title: "vitest 测试组件-基础"
date: 2024-05-14T12:25:58.155Z
description: "学习vitest测试组件"
category: 前端测试
---

## 1 @vue/test-utils

我们测试组件，依赖这个 vtu 这个库

```bash
pnpm install --save-dev @vue/test-utils

# or
yarn add --dev @vue/test-utils
```

## 2 组件测试的核心逻辑

核心逻辑

1. 渲染组件
2. 查找元素
3. 断言结果

## 3 以一个组件来看简单的测试

### 3.1 渲染组件

```vue
<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<style scoped></style>
```

### 3.2 测试用例

```ts
import { mount } from "@vue/test-utils";
import HelloWorld from "../HelloWorld.vue";

describe("HelloWorld", () => {
  it("renders properly", () => {
    const wrapper = mount(HelloWorld, { props: { msg: "Hello Vitest" } });
    expect(wrapper.text()).toContain("Hello Vitest");
  });
});
```

可以价格 console.log 看下输出的 wrapper.html()

<img data-src="/assets/images/front-test/test-component-basic-01.png">

## 4 mount 和 shallowMount

在 Vue Test Utils 中，mount 和 shallowMount 是两个常用的方法，用于创建 Vue 组件的包裹器（Wrapper）对象，并提供对组件的访问和操作。这两个方法之间的区别在于其处理子组件的方式。

- mount  方法：

  - mount  方法会创建一个完整的组件包裹器，包括渲染组件及其子组件。
  - 它适用于需要进行组件完整渲染并测试组件及其子组件之间交互的情况。
  - mount  方法会触发组件的生命周期钩子函数，如  created、mounted  等，也会执行子组件的逻辑。
  - 由于会渲染所有子组件，mount  方法的性能相对较低，特别是在测试大型组件树时。

- shallowMount  方法：
  - shallowMount  方法会创建一个浅层的组件包裹器，它只会渲染当前组件，而不会渲染其子组件。
  - 它适用于只关注当前组件的行为，并希望忽略子组件逻辑的情况。
  - shallowMount  方法不会触发子组件的生命周期钩子函数，仅执行当前组件的逻辑。
  - 由于只渲染当前组件，shallowMount  方法的性能相对较高，特别是在测试大型组件树时。

### 4.1 mount 和 shallowMount 的 Demo

1. 我们首先准备两个组件

```vue title="MountAndShallow.vue"
<template>
  <div>
    <h1>{{ msg }}</h1>
    <SubComponent />
  </div>
</template>

<script setup lang="ts">
import SubComponent from "./SubComponent.vue";
import { onMounted } from "vue";

onMounted(() => {
  console.log("Father Component now mounted");
});

defineProps<{
  msg: string;
}>();
</script>
```

```vue title="SubComponent.vue"
<template>
  <div>childComponent</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
onMounted(() => {
  console.log("childComponent onMounted");
});
</script>

<style scoped></style>
```

2. 写测试代码

```ts title="MountAndShallow.spec.ts"
import { mount, shallowMount } from "@vue/test-utils";
import MountAndShallow from "../MountAndShallow.vue";

describe("mount 和 shallowMount 区别", () => {
  it("mount", () => {
    const wrapper = mount(MountAndShallow, { props: { msg: "Hello Vitest" } });
    console.log("wrapper.html() use mount", wrapper.html());
  });

  it("shallow mount", () => {
    const wrapper = shallowMount(MountAndShallow, {
      props: { msg: "Hello Vitest" },
    });
    console.log("wrapper.html() use shallowMount", wrapper.html());
  });
});
```

3. 测试结果

<img data-src="/assets/images/front-test/test-component-basic-02.png">

## 5 wrapper 查找元素 element 和 component

当我们调用 mount 和 shallow mount 之后，会返回一个 wrapper，wrapper 暴露了一些方法，可以让我们去查找渲染的元素或者元素的属性

查询分为 element 查询和 component 查询, 当我们渲染组件之后，如果想定位到某个元素或者子组件的范围的时候，就可以使用 get、find、findAll 方法拿到，类似我们 html 里面的 querySelector、querySelectorAll 支持用元素、类、id 等查找元素

### 5.1 element 查找

- `find` 查找元素，支持用元素、类、id 等查找元素，找不到返回 undefined
- `get` 查找元素，找不到会报错
- `findAll` 查找多个元素，找不到会返回空数组

```ts
it("查询元素，可以同过标签、属性、id、类名查找", () => {
  const wrapper = mount(Find, { props: { msg: "Hello Vitest" } });

  const title = wrapper.find('[data-testid="title"]'); // 属性查找
  expect(title.text()).toBe("title");
  // 获取第一个h1元素
  expect(wrapper.get("h1").text()).toBe("Hello Vitest");
  // 获取第一个 h1 元素
  expect(wrapper.findAll("h1").at(0)?.text()).toBe("Hello Vitest");
  // 获取第二个 h1 元素
  expect(wrapper.findAll("h1").at(1)?.text()).toBe("Hello Vitest");

  expect(wrapper.find("h2")); // 找不到返回 undefined
  // expect(wrapper.get('h2')) // 找不到会直接报错
  // console.log(wrapper.findAll('h2'))
});
```

### 5.2 component 查找

- `findComponent` 查找元素，找不到返回 undefined
- `getComponent` 查找元素，找不到会报错
- `findAll` 查找多个元素，找不到会返回空数组

```ts
it("查询组件", () => {
  const wrapper = mount(Find, { props: { msg: "Hello Vitest" } });
  console.log(
    "wrapper.getComponent(Button)",
    wrapper.getComponent(Button).html()
  );

  expect(wrapper.getComponent(Button).text()).toBe(
    "default buttonif buttonshow button"
  );
  expect(wrapper.findComponent(Button).text()).toBe(
    "default buttonif buttonshow button"
  );
  expect(wrapper.findAllComponents(Button).at(0)?.text()).toBe(
    "default buttonif buttonshow button"
  );
});
```

## 6 断言元素

### 6.1 断言文本和 DOM

- `wrapper.html()`输出 dom 结构
- `wrapper.text()`输出文本

```ts
it("mount", () => {
  const wrapper = mount(HelloWorld, { props: { msg: "Hello Vitest" } });
  expect(wrapper.text()).toContain("Hello Vitest");
  expect(wrapper.html()).toContain("Hello Vitest");
  console.log("text ===", wrapper.text()); // Hello Vitest
  console.log("html ===", wrapper.html()); // <div> <h1>Hello Vitest</h1></div>
});
```

### 6.2 断言元素展示和隐藏

`v-if`和`v-show`，

- `v-if` 是没有 dom 节点，就不会渲染
- `v-show` 是渲染了，只是 display: none

两种断言的方式不一样

- exists 元素是否在 dom (用于 v-if)
- isVisble 元素在 dom 上，可能不展示(用于 v-show)

```ts
it("元素是否展示，是否可见 ", () => {
  const wrapper = mount(Button);
  const showDom = wrapper.find('[data-testid="show"]');

  const ifDom = wrapper.find('[data-testid="if"]');
  expect(showDom.isVisible()).toBeFalsy();
  expect(showDom.exists()).not.toBeFalsy();
  expect(ifDom.exists()).toBeFalsy();
});
```

### 6.3 断言元素的属性 attributes

通过 find 获取了具体的 dom 节点之后，可以通过 attributes()获取到当前 dom 的属性，可以根据具体的属性做具体的断言

```ts
it("元素的属性 ", () => {
  const wrapper = mount(Button);
  const showDom = wrapper.find('[data-testid="show"]');
  console.log("attributes", showDom.attributes());
});
```

```vue
<div v-show="false" data-testid="show">show button</div>
attributes { 'data-testid': 'show', style: 'display: none;' }
```

### 6.4 断言组件的属性

通过 wrapper.vm 可以拿到当前组件实例的方法和属性,例如 $data,$props

```ts
// 组件定义了 props 和 ref
const name = ref("customer-ref");

defineProps<{
  msg: string;
}>();

it("组件的属性 ", () => {
  const wrapper = mount(Find, { props: { msg: "Hello Vitest" } });
  console.log(wrapper.vm);
  console.log(wrapper.vm.$props);
  console.log(wrapper.vm.$props);
  console.log(wrapper.vm.name);
});
```
