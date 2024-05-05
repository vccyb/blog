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
