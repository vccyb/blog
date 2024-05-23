---
title: "为什么 Vue2 this 能够直接获取到 data 和 methods"
date: 2024-05-22T15:27:00.471Z
category: 源码分析
---

## 问题探究

问题就是 vue2 中，我们可以从 this 中直接获取到 data 和 methods。

我们调用往往是这样来调用的

```js
handleClick() {
  this.xxx
  this.method1()
}
```

## 搭建环境

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js"></script>
    <div id="app">{{ message }}</div>
    <script>
      debugger;
      const vm = new Vue({
        el: "#app",
        data: {
          message: "Hello Vue!",
        },
        methods: {
          sayName() {
            console.log(this.name);
          },
        },
      });
      console.log(vm.message);
    </script>
  </body>
</html>
```

## 调试

我们调试到 init 方法，里面有一个 initState 方法，重点看这个函数

```js
function initState(vm) {
  var opts = vm.$options;
  if (opts.props) initProps$1(vm, opts.props);
  // Composition API
  initSetup(vm);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    var ob = observe((vm._data = {}));
    ob && ob.vmCount++;
  }
  if (opts.computed) initComputed$1(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

### initMethods

继续进入 initMethods 里面

```js
function initMethods(vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    {
      if (typeof methods[key] !== "function") {
        warn$2(
          'Method "'
            .concat(key, '" has type "')
            .concat(typeof methods[key], '" in the component definition. ') +
            "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn$2(
          'Method "'.concat(key, '" has already been defined as a prop.'),
          vm
        );
      }
      if (key in vm && isReserved(key)) {
        warn$2(
          'Method "'.concat(
            key,
            '" conflicts with an existing Vue instance method. '
          ) + "Avoid defining component methods that start with _ or $."
        );
      }
    }
    vm[key] =
      typeof methods[key] !== "function" ? noop : bind$1(methods[key], vm);
  }
}
```

看最后一行

```js
vm[key] = typeof methods[key] !== "function" ? noop : bind$1(methods[key], vm);
```

所有 method 函数最后就是绑定到 vue 的实例对象上

### initData

```js
function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = isFunction(data) ? getData(data, vm) : data || {};
  if (!isPlainObject(data)) {
    data = {};
    warn$2(
      "data functions should return an object:\n" +
        "https://v2.vuejs.org/v2/guide/components.html#data-Must-Be-a-Function",
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    {
      if (methods && hasOwn(methods, key)) {
        warn$2(
          'Method "'.concat(
            key,
            '" has already been defined as a data property.'
          ),
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
      warn$2(
        'The data property "'.concat(key, '" is already declared as a prop. ') +
          "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  var ob = observe(data);
  ob && ob.vmCount++;
}
```

我们在进入到 proxy 中

```js
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

通过 `Object.keys` 获取 data 中所有的 keys,循环并通过 proxy 中的 Object.defineProperty 来实现对 `vm._data` 中所有数据属性的监听，其实就相当于在 `this._data` 做了一层代理。

通过 proxy 代理后，可以`vm[key]` 直接来访问，同时外部便可以达到`this[key]`，举例：这里的 key 也便是我们上面在 data 中定义的 name, this.name 便最终取值成功。

```js
this.name = vm.name = vm._data.name;
```

## 手写 50 行代码实现 this 访问 data 和 methods

```js
let descriptor = {
  enumerable: true,
  configuable: true,
};

function proxy(target, sourceKey, key) {
  descriptor.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  descriptor.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, descriptor);
}
function Vue(options) {
  let vm = this;
  vm.$options = options;
  vm._init(vm);
}

Vue.prototype._init = function (vm) {
  let opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }

  if (opts.methods) {
    initMethods(vm, opts.methods);
  }
};

function initData(vm) {
  let data = (vm._data = vm.$options.data);

  const keys = object.keys(data);
  let i = keys.length;
  while (i--) {
    let key = keys[i];
    proxy(vm, "_data", key);
  }
}

function initMethods(vm, methods) {
  for (let key in methods) {
    vm[key] = typeof methods[key] !== "function" ? {} : methods[key].bind(vm);
  }
}
```
