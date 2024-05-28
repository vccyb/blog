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

## directive

从业务角度，从组件的角度

### 局部指令

```vue
<script setup lang="ts">
const vTooltip = {
  beforeMount(el: Element) {
    el.classList.add("with-tooltip");
  },
};
</script>

<template>
  <div>
    <div v-tooltip data-testid="tooltip">show tooltip</div>
  </div>
</template>
```

```ts
it("tooltip", async () => {
  const wrapper = mount(Directive);
  const tooltip = wrapper.find('[data-testid="tooltip"]');
  expect(tooltip.html()).toContain("with-tooltip");
});
```

### 全局指令

如果是全局的自定义指令,就得如下写法，需要在 main.ts 里面全局定义指令

```ts
// main.ts
app.directive("tooltip", vTooltip);
```

```vue
<script setup lang="ts"></script>

<template>
  <div>
    <div v-tooltip data-testid="tooltip">show tooltip</div>
  </div>
</template>
```

测试用例需要 directives 注入进来

```js
it("tooltip", async () => {
  const wrapper = mount(Directive, {
    global: {
      directives: {
        tooltip: vTooltip,
      },
    },
  });
  const tooltip = wrapper.find('[data-testid="tooltip"]');
  expect(tooltip.html()).toContain("with-tooltip");
});
```

## components

当我们在使用一些第三方组件的时候，可能第三方组件就是全局注册的，我们就不需要在每一个组件里面每次引入使用的组件，例如我有个 GlobalComponent 组件，被全局注册了

```js
import GlobalComponent from "./components/6/GlobalComponent.vue";
app.component("GlobalComponent", GlobalComponent);
```

那么在使用的时候就不需要在当前组件引入了，直接使用就行

```vue
<template>
  <div>
    <GlobalComponent></GlobalComponent>
  </div>
</template>

<script setup lang="ts"></script>
```

我们直接 mount 一下这个

```ts title="错误写法"
it("mount error component", async () => {
  const wrapper = mount(Global);
  console.log(wrapper.html());
  expect(wrapper.text()).toContain("My Global Component");
});
```

需要在测试的时候，把组件注册进去

```ts title="正确写法"
it("mount success component", async () => {
  const wrapper = mount(Global, {
    global: {
      components: {
        GlobalComponent,
      },
    },
  });
  expect(wrapper.text()).toContain("My Global Component");
});
```

## plugins

我们再来看看 plugins， 插件很常见，vuex、vue-router 都是插件，我们如何测试插件呢，我列了一个平常可能会使用到的 i18n 插件

```js
// i18n.ts
const i18nPlugin = {
  install(app: any, options: PluginOptions = {}) {
    const messages = options.messages ?? {};

    app.config.globalProperties.$t = function (key: string) {
      const language = options.defaultLanguage ?? "en";
      return messages[language]?.[key] || key;
    };
  },
};
```

```vue
<!-- Plugin.vue -->
<template>
  <div>{{ $t("hello") }}</div>
</template>

<script setup lang="ts"></script>
```

main.ts 里面需要注册插件，这里我们直接定义 hello 的值是 'Hello Plugin'

```ts
app.use(i18nPlugin, {
  defaultLanguage: "en",
  messages: {
    en: {
      hello: "Hello Plugin",
    },
  },
});
```

使用

```js
describe("测试 plugin", () => {
  it("uses i18n plugin", () => {
    const wrapper = mount(Plugin, {
      global: {
        plugins: [
          [
            i18nPlugin,
            {
              defaultLanguage: "en",
              messages: {
                en: {
                  hello: "Hello test i18nPlugin",
                },
              },
            },
          ],
        ],
      },
    });
    expect(wrapper.text()).toBe("Hello test i18nPlugin");
  });
});
```

## attachTo

我们有时候会在组件里面直接操作 dom,例如下面一个组件一开始渲染了 first render onMounted 之后，获取 dom 之后，直接把 h4 里的内容改成 111

```vue
<script setup lang="ts">
import { onMounted } from "vue";
onMounted(() => {
  const ele = document.querySelector("h4") as Element;
  ele.innerHTML = "111";
});
</script>

<template>
  <h4 style="color: red">first render</h4>
</template>
```

如果不使用 attachTo, 会渲染报错

```js
it("attach render error", async () => {
  const wrapper = mount(Attach);
  await nextTick();
  expect(wrapper.text()).toContain("111");
});
```

正确的用法是 attachTo 到 body 上面或者其他的 DOM 上

```js
it("attach success render", async () => {
  // const div = document.createElement('div')
  // document.body.appendChild(div)
  const wrapper = mount(Attach, {
    attachTo: document.body,
    // attachTo: div // 任意一个 dom
  });
  await nextTick();
  console.log("wrapper", wrapper.html());
  expect(wrapper.text()).toContain("111");
});
```

## teleport

如何测试呢？ MyTeleport.Vue 组件使用了 Teleport 功能，Teleport 包括了一个子组件 Signup.vue
