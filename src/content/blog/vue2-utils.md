---
title: "vue2-utils"
date: 2024-05-05T12:25:58.155Z
---

## 1 判断是否为数组

```ts
// 判断是否为数组
export const isArray = Array.isArray;
```

## 2 emptyObject 绝对的空对象

```ts
export const emptyObject: Record<string, any> = Object.freeze({});
```

这个工具函数相当简单，就是冻结对象的第一层属性使得其不能修改，那么冻结一个空对象就必然能保证 emptyObject 这个引用一直是空对象啦。

## 3 isUndef 是否未定义

```ts
export function isUndef(v: any): v is undefined | null {
  return v === undefined || v === null;
}
```

ts 中的 is 还是很有用的，举例

```ts
if (isUndef(a)) {
  a; // undefined | null
} else {
  a; //any
}
```

这个方法就是用于判断一个值是否为 `undefined` 或 `nul`

TS 的类型收窄，文档也说得相当清楚了，就是通过这个类型谓词来收窄传参的类型，在本例中就是一开始 TS 还认为 a 是 any，一旦执行 isUndef(a)为 true，那么 a 的类型就必然是 undefined 或者 null 了

## 4 toRawType 转换为原始类型

```ts
// Object原型上的toString方法，用于获取值的原始类型字符串，e.g., [object Object].
const _toString = Object.prototype.toString;

export function toRawType(value: any): string {
  return _toString.call(value).slice(8, -1);
}
```

这个技巧还是有点意思的，首先`\_toString.call(value)`这个语句会返回值的原始类型字符串，形如`[object 原始类型]`。
接下来就是对这个字符串进行切割，毕竟`[object `这部分总是一致的，这里有趣的是用到了平常较少会用到的 `slice` 函数的负数索引。众所周知，slice 函数截取的是`[start, end)`这个范围的字符串，那么当传参是负数时，则意味着从数组末位开始计算，那么-1 就是数组的最后一位了。
如此，在此例中就实现了从形如`[object 原始类型]`的字符串中抽取出原始类型的这一操作了。

举个例子

```ts
let a = "123";
let b = 123;
Object.prototype.toString.call(a); //'[object String]'
Object.prototype.toString.call(b); //'[object Number]'
```

## 5 isValidArrayIndex 是否合法的数组索引

```ts
export function isValidArrayIndex(val: any): boolean {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}
```

利用 n>=0 && isFinite(val)判断是值否在区间`[0, 2^53-1]`

## 5 makeMap 生成一个判断值是否在给定 list 的 map

```ts
export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | undefined {
  const map = Object.create(null);
  const list: Array<string> = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val];
}
```

这个函数利用到了闭包来实现传入一个以,分隔的字符串，返回一个校验传参是否属于这个字符串中的其中一项的函数的功能，支持传入第二个参数规定是否期望字符串里的每一项都为小写格式（且传参大小写不敏感）

```js
// 检查是否为Vue的内置标签
const isBuiltInTag = makeMap("slot,component", true);

isBuiltInTag("slot"); // true
isBuiltInTag("c"); // false
isBuiltInTag("Component"); // true
```

## 6 cached 缓存函数

```ts
export function cached<R>(fn: (str: string) => R): (sr: string) => R {
  const cache: Record<string, R> = Object.create(null);
  return function cachedFn(str: string) {
    const hit = cache[str];
    // 调用一次函数，并缓存结果
    return hit || (cache[str] = fn(str));
  };
}
```

这个函数同样是利用到了闭包，实现的功能是传入一个普通函数，使之转化成带有缓存的函数，就避免了重复计算，可见 Vue 底层对于性能的极致优化。

## 7 camelize

```ts
// Camelize a hyphen-delimited string.
// 用于匹配连字符（-）后面跟着任意一个字母字符（\w）
const camelizeRE = /-(\w)/g;
export const camelize = (str: string): string => {
  return str.replace(camelize, (_, c) => (c ? c.toUpperCase() : ""));
};
```

replace 的用法

- 第一个参数就是正则表达式，找到匹配的字符串进行替换。 `a-bc-d`
- 第二个参数传入了一个函数，其中函数的第一个参数是匹配的子串，这里也就是-b 和-d 了；
- 这个函数的第二个参数就是刚才提到的捕获组，这里就是 b 和 d 了，函数的返回值就是要替换成的字符串，于是就实现了这么一个把 kebab-case 的字符串转成 camelCase 的需求了。

## 8 hyphenate

```ts
const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = (str: string): string => {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
};
```

## 9 toArray 把类数组转成真正的数组

```ts
export function toArray(list: any, start?: number): Array<any> {
  start = start || 0;
  return Array.from(list).slice(start);
}
```

## 10 extend 合并源对象的属性到目标对象

```ts
export function extend(
  to: Record<PropertyKey, any>,
  _from: Record<PropertyKey, any>
): Record<PropertyKey, any> {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}
```

## 11 toObject 将对象数组合并成一个对象

```ts
export function toObject(arr: Array<any>): object {
  const res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}
```
