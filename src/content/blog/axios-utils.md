---
title: "axios-utils"
date: 2024-05-24T12:25:58.155Z
category: 源码分析
---

## kindof 获取当前数据类型

```js
const { toString } = Object.prototype;

function kindCache(cache) {
  return function (thing) {
    // 首先传入变量 thing, 通过 toString.call 获取当前变量的类型 [object XXXX]
    const str = toString.call(thing);
    // 然后从缓存 cache 里读取其类型， 有直接返回，没有则将类型放入 cache 中
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  };
}

const kindof = kindCache(Object.create(null));

// 初始化 cache = {}
kindof("Axios"); // string

kindof(123); // number

kindof(true); // boolean
// 此时的 cache --> {'[object String]': 'string', '[object Number]': 'number', '[object Boolean]':'boolean'}
```

1. 先声明函数 kindCache, 接收一个 cache 参数,
2. 这个函数返回的是一个函数，接收一个任意变量 thing。
3. 最后，得到 kindof 函数， 并传入初始实参 Object.create(null),就是内部返回的函数，缓存中存在，直接返回，不存在则存进缓存。

## kindOfTest 判断传入的类型和真实的类型是否一致

```js
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindof(thing) === type;
};

kindOfTest("array")([123]); // true
```

1. 当传入 array 第一次执行函数, array 是我们以为的类型
2. 第二次传入 [123] , 作为 kindof 函数的参数, 获得到 [123]真实的数据类型, 与我们传入的数据类型 array 进行比较。
3. 源码中用到 kindOfTest 声明的函数:

## 一些 is 判读类型函数

```js
const isData = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isURLSearchParams = kindOfTest("URLSearchParams");
```

## typeOfTest 这也是判断数据类型是否和真实数据类型是否一致

```js
const typeOfTest = (type) => (thing) => typeof thing === type;
typeOfTest("string")("test"); // true
```

```js
/ undefined
const isUndefined = typeOfTest('undefind')
// string
const isString = typeOfTest('string')
// function
const isFunction = typeOfTest('function')
// number
const isNumber = typeOfTest('number')
```

## isArray

```js
function isArray(val) {
  return Array.isArray(val);
}
```

## isBuffer 判断 buffer 类型

```js
function isBuffer(val) {
  return (
    val !== null &&
    !isUndefined(val) &&
    val.constructor !== null &&
    !isUndefined(val.constructor) &&
    typeof val.constructor.isBuffer === "function" &&
    val.constructor.isBuffer(val)
  );
}
```

## isArrayBuffer

```js
function isArrayBuffer(val) {
  return toString.call(val) === "[object ArrayBuffer]";
}
const isArrayBUffer = kindOfTest("isArrayBuffer");
```

## isArrayBufferView

```js
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    retult = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
```

## isObject 判断是否是 object 类型

```js
function isObject(val) {
  return val !== null && typeof val === "object";
}
```

## isBoolean 判断是否是 Boolean 类型

```js
function isBoolean(val) {
  return val === true || val === false;
}
```
