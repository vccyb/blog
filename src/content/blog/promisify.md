---
title: "promisify 分析"
date: 2024-06-02T12:25:58.155Z
category: 源码分析
---

## 简单需求

```js
const imageSrc = "https://www.themealdb.com/images/ingredients/Lime.png";
function loadImage(src, callback) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = "xxx-alt";
  image.style = "width:200px;height:200px";
  image.onload = () => callback(null, image);
  image.onerror = () => callback(new Error("加载失败"));
  document.body.append(image);
}
```

使用

```js
loadImage(imageSrc, function (err, content) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(content);
});
```

## promisify 化

```js
const loadImgPromise = function (src) {
  return new Promise((resolve, reject) => {
    loadImage(src, function (err, image) {
      if (err) {
        reject(err);
        return;
      }
      resolve(image);
    });
  });
};
loadImgPromise(imageSrc)
  .then((res) => {
    console.log("success", res);
  })
  .catch((err) => {
    console.log("err", err);
  });
```

## 通用的 promisify

```js
function promisify(original) {
  // promisify的函数不在传递callbak
  function fn(...args) {
    return new Promise((resolve, reject) => {
      // node.js 回掉的写法，参数的最后一个，手动添加
      args.push((err, ...values) => {
        if (err) {
          return reject(err);
        }
        resolve(values);
      });
      Reflect.apply(original, this, args);
    });
  }
  return fn;
}
```

使用

```js
const loadImagePromise = promisify(loadImage);
async function load() {
  try {
    const res = await loadImagePromise(imageSrc);
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}
load();
```
