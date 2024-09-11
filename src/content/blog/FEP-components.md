---
title: shadcn/ui 为啥那么火？前端组件库
author: Chen YuBo
date: 2024-09-02T07:20:55.819Z
draft: false
category: 前端工程化
featured: true
description: "工程化一些"
tags:
  - shadcn
  - ui
  - 组件库
---

## 前言

组件库，可以说是现代化前端开发中必不可少的一个工具，**它可以帮助我们快速构建出高质量的前端页面，提高开发效率**。然而，组件库也并不是一件容易的事情，需要经过大量的实践和积累才能形成一套完善的组件库。今天，我们就来聊聊 shadcn/ui 这个组件库，看看它为什么那么火，以及它的前世今生。

## Step1 - 从 手写 CSS 到组件库

让我们把目光回到过去，话说十几年前（大概 2000 年～ 2010）的前端开发原始人，那时候的前端也叫切图仔，他们的主要工作就是手写 CSS，把设计师给的 PSD 文件进行切图。而其中关键的就是**如何快速、高效地写出美观、易维护的 CSS**。

### 1. 最简单的方式

```html title="index.html"
<link href="a.css" />
```

```css title="a.css"
body {
  background-color: #f5f5f5;
}
...
```

这种方式几乎就是，所有新人学习 CSS 的第一堂课的内容，简单粗暴，但是有效。

### 2. css 预处理器

最古老的一个 css 预处理器就是 sass 了，它大概是 07 年左右出生的，它解决了 css 的一些痛点，比如变量、嵌套、模块化等，让 css 变得更加灵活和强大。

```scss title="a.scss"
$bg-color: #f5f5f5;

body {
  background-color: $bg-color;
}
...
```

然后再通过 sass 编译成 css，再引入该 css 文件到页面中。当然，在现代化前端开发中，构建工具往往帮你把这一步干完了

```cmd
sass test.scss test.css
```

### 3. css 框架

比起完全自己书写 css，很多通用的，标准的，差异化要求不高的场景，一些 css 框架涌现出来，比如 bootstrap、tailwindcss 等，它们提供了一套完整的 css 样式库，可以让我们快速地构建出美观、易维护的页面，他们往往更加的高效，因为很多通用的样式已经帮我们写好了，我们只需要引入这些框架，然后根据需求进行一些定制即可。

```html title="index.html"
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
/>
```

## Step2 - 组件库时代

### 1. 组件库的优势

随着前端框架（比如 React、Vue、Angular）的兴起，组件化开发成为了前端开发的主流，而组件库则是组件化开发的优秀工具，它提供了一套完整的组件，可以让我们快速地构建出美观、易维护的页面。

一个优秀封装的组件，将功能和样式集成在一起，暴露出一些简单的 API，让开发者可以快速地使用，而不需要关心底层的实现，比如 antd、element-ui 等。

而现代化的前端开发，早就离不开包管理工具， 比如 npm、yarn 等，而这些组件库的开发者也往往会发布相关的 npm 包，方便开发者使用。

### 2. 组件库的劣势

但是，组件库也有其劣势，比如：

- 组件库的版本更新，可能会带来一些不兼容的改动，需要开发者手动处理。
- 组件库的样式，可能不符合我们的需求，需要我们进行一些定制。

### 3. 优秀的组件库们

- 我们可以打开https://ui-libs.vercel.app/，这是一个vue组件库的网站

可以看到很多优秀适配 vue 的组件库，其中不乏 Element plus，Ant Design Vue，这些国内开源的组件库

不同的组件库样式风格也不同，他们基于不同的设计语言，但是使用他们却异常的简单

我们以 PrimeVue 为例

1. 打开官网：https://primevue.org/setup/
2. 选择你的指导, 跟着一操作即可（相信我，这些开源的组件库文档写的比某些好很多的）
3. 再基于你的需求，选择使用你所需要的组件即可

### 4 组件库的层级和 shadcn/ui 的定位

自动组件库有了之后，其实一致大概有三类组件库

```

3. 业务组件库（业务使用的组件，添加业务接口和逻辑）
2. 模板组件（基于antd的 antd pro components, 提供 proForm， protaable， aui的table）
1. 基础组件库（基本的组件，比如 button、input、table、dialog 等）

```

特点：

1. 每一层，从下往上，都是一层一层抽象，越往上越能解决实际问题，但是复用性越低
2. 同时，业务组件会带来效率的提升

shadcn/ui 本身就处于基础组件层，但是由于灵活的可定制，让你可以方便快捷的抽象出业务组件

## Step3 - shadcn/ui

### 1. 新星 shadcn/ui

讲了半天，都还没进入正题了，各式各样的组件库很好，但是为什么 23 年有一个组件库异军突起，成为大家追捧的对象呢？

https://bestofjs.org/projects?tags=component&sort=yearly
<img data-src="/assets/images/project/component-05.png">
<img data-src="/assets/images/project/components-01.png">

我们前面说组件库有相关缺陷，如果有样式相关需求，就需要手动处理，版本的兼容性往往也是难题，让我们体验下 shadcn/ui，看看他是怎么针对处理的

### 2. shadcn/ui 的使用

这里我们用 shadcn-vue

1. 打开官网，按照步骤一步一步走，https://www.shadcn-vue.com/docs/installation/vite.html
   - 配置好所有的配置
2. 选择你需要的组件，比如 Button

```cmd
npx shadcn-vue@latest add button
```

当你执行完毕后，一个组件就真正的生成了你的项目中，不是 node_modules，而是直接在你的项目中，并且可以随意你修改，非常的直接, 这也是它的最大的优点，定制能力很强
<img data-src="/assets/images/project/components-02.png">

3. 使用我们的 button

```vue
<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div>
    <Button>Click me</Button>
  </div>
</template>
```

<img data-src="/assets/images/project/components-03.png">

### 3. shadcn/ui 怎么去解决了那些组件库的痛点呢

1. 组件库不灵活的问题

如果你真正的使用过组件库，你会发现，组件库的组件往往不能满足你的需求，你需要自己手动去修改，甚至需要自己写样式，而 shadcn/ui 的组件，你可以直接修改，并且可以随意修改，定制能力很强

做到这点的关键就是，shadcn/ui 依赖于 radix，而 radix 就是实现 headless 的组件库， 样式和功能本身就是解耦的

<img data-src="/assets/images/project/components-06.png">

比如有一个场景，我的 button 在我的项目下，样式需要自定义, 事实上你的功能也可以进行一些自定义，基于你的场景

```vue
<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    class="inline-flex rounded-sm bg-purple-400 p-4 text-white shadow-sm transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <slot /><span>～版权所有</span>
  </Primitive>
</template>
```

<img data-src="/assets/images/project/components-04.png">

2. 组件库的版本兼容性问题

组件库的版本兼容性，往往是一个大问题，而 shadcn/ui 的组件，是直接在你的项目中，而不是在 node_modules 中，所以你不需要担心版本兼容性问题，它核心依赖极少，就是 radix-ui, 所以你几乎不需要担心版本兼容性

一般而言，它就是套壳 headless 组件，版本升级了，你用命令在安装即可

3. tailwindcss 的原子化样式方案

shadcn/ui 使用了 tailwindcss 作为样式方案，这样可以复制 tailwindcss 生态中的其他代码，比如 tailspark.co/ 和 flowbite.com/ ，一下子生态就大了很多，而且修改起来也方便。

由于 tailwindcss 的样式是原子化的，你修改和自定义组件，变得更加的简单

4. 引入体积的问题

通过上述，你也可以发现，它的依赖很少，所以体积很小，你可以直接在项目中使用，而不需要引入传统组件库那么大的本体。

shadcn，基于 Headless UI 只在需要时才动态加载组件代码，最大程度地减小了文件大小。

5. 跨平台兼容

shadcn/ui 是一个跨平台的组件库，可以在任何支持 Vue 的平台上使用，包括 web、移动端和桌面端。这使得它非常适合用于构建跨平台的应用程序。它本基于 radix，radix 作为无头组件，有着良好的移动端适配能力

6. 组件的管理在我们项目本身了

以两个团队为例，一个开发组件的团队，一个开发产品的团队，以前，组件团队开发好组件，产品团队使用组件，但是组件团队开发出来的组件，产品团队使用起来，总是会有一些问题，比如组件的样式，组件的交互，组件的文档等等
而 shadcn/ui 就把主动权放到了自己手上

1. 组件库的灵活性

### 4. shadcn/ui 一些缺点

1. 轻量级，对于功能复杂的组件（比如表格，日历，）支持并不好，而且由于灵活可定制的特性，需要花费更多的时间来定制组件以满足特定的需求。
2. 团队间协作，由于组件库的灵活性，考验编码和设计能力，会有效率的降低，需要团队成员之间有良好的沟通和协作，以确保组件的风格、代码一致性和可维护性。
3. 学习成本更高，要理解 headless 无头组件的理念
4. 代码量的膨胀，对于组件，代码也在产品的代码中了，导致代码量激增
5. 组件文档的维护成本，由于组件都是可定制的，那么需要文档必须随着组件持续更新

## 加餐 radix headless 组件，他们咋做的？

我们知道，shadcn/ui 依赖于 radix，而 radix 就是实现 headless 的组件库， 样式和功能本身就是解耦的，我们可以看看它的源码，了解它的实现原理

我们以一个组件来看看它的源码是如何设计这种 headless 的

https://github.com/radix-vue/radix-vue/blob/main/packages/radix-vue/src/Toggle/Toggle.vue

这里我用我找到的最简单的组件，Toogle 来分析

### 1. 目录结构

```
Toogle.story.vue
Toogle.test.vue
Toogle.vue
index.ts
```

- Toogle.story.vue 组件的使用示例
- Toogle.test.vue 组件的测试用例
- Toogle.vue 组件的实现代码
- index.ts 组件的导出文件(包含类型)

组件的使用也简单

```vue
  <Toggle
    v-model:pressed="toggleState"
  >
```

### 2. 组件的实现

```vue
<script lang="ts">
import { useForwardExpose } from "@/shared";

export type ToggleEmits = {
  /** Event handler called when the pressed state of the toggle changes. */
  "update:pressed": [value: boolean];
};

export type DataState = "on" | "off";

export interface ToggleProps extends PrimitiveProps {
  /**
   * The pressed state of the toggle when it is initially rendered. Use when you do not need to control its open state.
   */
  defaultValue?: boolean;
  /**
   * The controlled pressed state of the toggle. Can be bind as `v-model`.
   */
  pressed?: boolean;
  /**
   * When `true`, prevents the user from interacting with the toggle.
   */
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { type Ref, computed } from "vue";
import { useVModel } from "@vueuse/core";
import { Primitive } from "@/Primitive";

const props = withDefaults(defineProps<ToggleProps>(), {
  pressed: undefined,
  disabled: false,
  as: "button",
});

const emits = defineEmits<ToggleEmits>();

defineSlots<{
  default: (props: {
    /** Current pressed state */
    pressed: typeof pressed.value;
  }) => any;
}>();

useForwardExpose();
const pressed = useVModel(props, "pressed", emits, {
  defaultValue: props.defaultValue,
  passive: (props.pressed === undefined) as false,
}) as Ref<boolean>;

function togglePressed() {
  pressed.value = !pressed.value;
}

const dataState = computed<DataState>(() => {
  return pressed.value ? "on" : "off";
});
</script>

<template>
  <Primitive
    :type="as === 'button' ? 'button' : undefined"
    :as-child="props.asChild"
    :as="as"
    :aria-pressed="pressed"
    :data-state="dataState"
    :data-disabled="disabled ? '' : undefined"
    :disabled="disabled"
    @click="togglePressed"
  >
    <slot :pressed="pressed" />
  </Primitive>
</template>
```

如果去除掉一些无障碍，样式控制，其他啥的。最核心的逻辑就是

```vue
<script setup lang="ts">
import { ref } from "vue";

const pressed = ref(false);

function toggle() {
  pressed.value = !pressed.value;
}
</script>

<template>
  <button @click="toggle">
    {{ pressed ? "On" : "Off" }}
  </button>
</template>
```

1. 定义状态，pressed 和状态的改变方法
2. 与外部组件数据 通过 v-models

### 3.Primitive 组件呢

这里其实源码不是 button，而是 Primitive，它是个抽象组件，它可以渲染任何标签，比如 button，input，div 等等，它可以控制标签的一些属性，比如 type，disabled，aria-pressed 等等，它可以控制标签的样式，比如 class，style 等等，它可以控制标签的子元素，比如 slot 等等。

```vue
import { type Component, type PropType, defineComponent, h } from 'vue'
import { Slot } from './Slot'

export type AsTag =
  | 'a'
  | 'button'
  | 'div'
  | 'form'
  | 'h2'
  | 'h3'
  | 'img'
  | 'input'
  | 'label'
  | 'li'
  | 'nav'
  | 'ol'
  | 'p'
  | 'span'
  | 'svg'
  | 'ul'
  | 'template'
  | ({} & string) // any other string

export interface PrimitiveProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * Read our [Composition](https://www.radix-vue.com/guides/composition.html) guide for more details.
   */
  asChild?: boolean
  /**
   * The element or component this component should render as. Can be overwrite by `asChild`
   * @defaultValue "div"
   */
  as?: AsTag | Component
}

export const Primitive = defineComponent({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    asChild: {
      type: Boolean,
      default: false,
    },
    as: {
      type: [String, Object] as PropType<AsTag | Component>,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const asTag = props.asChild ? 'template' : props.as

    // For self closing tags, don't provide default slots because of hydration issue
    const SELF_CLOSING_TAGS = ['area', 'img', 'input']
    if (typeof asTag === 'string' && SELF_CLOSING_TAGS.includes(asTag))
      return () => h(asTag, attrs)

    if (asTag !== 'template')
      return () => h(props.as, attrs, { default: slots.default })

    return () => h(Slot, attrs, { default: slots.default })
  },
})
```

而我们的 toogle 就是通过 props 的形式，让他渲染为一个 button

### 4. 样式呢？

我们可以看到，Toogle 是完全没有定义任何的样式的， 他的样式就可以你使用的时候通过 tailwindcss 或者其他样式方案来定义，他的样式完全是由你来定义的，所以他的样式是可以自由的，你可以自定义的。

我们来看看 radix-vue 中它是怎么加样式的

```vue
<template>
  <Toggle
    v-model:pressed="toggleState"
    aria-label="Toggle italic"
    class="hover:bg-green3 text-mauve11 data-[state=on]:bg-green6 data-[state=on]:text-violet12 shadow-blackA7 flex h-[35px] w-[35px] items-center justify-center rounded bg-white text-base leading-4 shadow-[0_2px_10px] focus-within:shadow-[0_0_0_2px] focus-within:shadow-black"
  >
    <Icon icon="radix-icons:font-italic" class="w-[15px] h-[15px]" />
  </Toggle>
</template>
```

当然，你可以可以自己写样式类名，自己写样式即可

https://github.com/radix-vue/radix-vue/blob/main/docs/components/demo/Toggle/css/index.vue

### 5. 总结

radix 这类 headless 组件，

1. 底层的实现，往往是基于基本的组件，实现组件的状态管理，与对外出发点的实践
2. 组件本身不进行样式的实现，将主动样式权利交给使用者，往往是基于 tailwindcss，或者其他样式方案，实现样式的自由定制
3. 由于要达到上述 1/2，组件拆分的颗粒度很细，比如 checkbox，就要拆分为 CheckboxRoot，CheckboxIndicator，CheckboxRoot 控制外层的逻辑，CheckboxIndicator 则是专门的给用户里层插槽内的逻辑
4. 由于细颗粒都的拆分，headless 类的组件，使用一个功能，你需要导入非常多的组件

举例：比如一个下拉菜单

```
import {
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'radix-vue'
```

## 🤔 后续思考

- headless 组件位于组件三个层级中的最底层，它提供了全新的超高自由度的组件设计方案
- radix 基于 headless 的思想，进行了真正的实现，提供了一系列最基本的组件
- shadcn/ui 在 radix 之上，1. tailwindcss 的样式方案和预设样式， 2.集成了很多原子组件，比如将 Radix 的 Dialog、DialogTrigger、DialogContent 等组合成一个更易用的 Dialog 组件。 3. 主题功能，4. cli 工具等等
- shadcn/ui 现在非常火，但是它已经是属于基础组件，只是它非常的灵活，有这极大的自定义能力，这既是优势也是劣势
- shadcn/ui 距离我们实际业务中使用，可能还隔了很远很远，专业的样式设计，组件的开发与维护规范，更抽象的模板组件和业务组件，这些都是未来很大的挑战。
