---
title: "service worker"
date: 2024-05-18T18:39:07.885Z
---

## service worker 的 基本概念

<img data-src="/assets/images/sw/service-work-01.png">

1. Service Worker 运行在浏览器的独立线程中，与主线程（UI 线程）分离，因此无法直接访问 DOM。

## 一些使用场景

1. 离线缓存

通过 service worker 实现离线的缓存机制，减少对网络可用性的依赖，改善用户体验，并且为候选的请求提供更快的加载时间

2. 后台操作

比如使用 service worker 定期检查应用是否需要更新，并通知用户

## 初始化 service worker 项目

目录结构

```
├── contact.html
├── images
│   ├── contactus.png
│   ├── home.jpg
│   └── profile.jpg
├── index.html
└── profile.html
```

```html title="index.html"
<body>
  <div style="margin-bottom: 1rem;">
    <a href="index.html">Home</a>
    <a href="profile.html">Profile</a>
    <a href="contact.html">Contact us</a>
  </div>
  <img src="images/home.jpg" alt="" width="300" height="200" />
  <h1>Home page</h1>
</body>
```

```html title="profile.html"
<body>
  <div style="margin-bottom: 1rem;">
    <a href="index.html">Home</a>
    <a href="profile.html">Profile</a>
    <a href="contact.html">Contact us</a>
  </div>
  <img src="images/profile.jpg" alt="" width="200" height="300" />
  <h1>Profile</h1>
</body>
```

```html title="contact.html"
<body>
  <div style="margin-bottom: 1rem;">
    <a href="index.html">Home</a>
    <a href="profile.html">Profile</a>
    <a href="contact.html">Contact us</a>
  </div>
  <img src="images/contactus.png" alt="" width="300" height="150" />
  <h1>Contact us</h1>
  <input type="text" placeholder="Name" />
  <input type="text" placeholder="email" />
  <input type="submit" />
</body>
```

## service worker 生命周期

1. 注册（Registering）:

Service Worker 必须首先被注册，这通常在页面脚本中通过 navigator.serviceWorker.register() 方法完成。

注册后，Service Worker 文件（.js）将被浏览器下载。

2. 安装（Installing）:

下载完成后，Service Worker 进入安装阶段。

在这个阶段，可以执行一些设置工作，例如缓存资源。

如果安装过程中发生错误，Service Worker 将被丢弃，并且需要重新注册。

3. 激活（Activating）:

安装成功后，Service Worker 进入激活阶段。

在激活时，所有旧版本的 Service Worker 将被替换。

这个阶段适合执行清理工作，例如删除旧缓存。

4. 运行（Running）:

Service Worker 激活后，它将开始监听和响应各种事件，如 fetch、push、sync 等。

它可以控制页面的网络请求、发送推送通知、进行后台同步等。
更新（Updating）:

Service Worker 更新的机制是自动的，浏览器会在后台定期检查新的版本。
如果发现新版本，Service Worker 将重新进入安装阶段。

这意味着新的 Service Worker 将被下载并安装，但不会被立即激活。

5. 等待（Waiting）:

当新版本的 Service Worker 安装后，它不会立即激活。

它将处于等待状态，直到所有标签页关闭，即所有使用旧版本 Service Worker 的页面都已关闭。

这是为了避免页面突然断开 Service Worker 而造成的问题。

6. 替换（Replacing）:

一旦所有使用旧版本 Service Worker 的页面关闭，新版本将自动激活，并开始控制页面。

旧版本的 Service Worker 将被新版本替换。

7. 卸载（Unregistering）:

当不再需要 Service Worker 时，例如在应用被卸载或 Service Worker 被注销时，它将进入卸载阶段。

在卸载之前，Service Worker 将完成其当前正在处理的任何事件，然后停止。

mdn 上的生命周期
<img data-src="/assets/images/sw/sw-lifecycle.svg">

## 注册 sw

我们创建一个 app.js

```js
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register("./sw.js");
    if (registration.installing) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active!");
    }
    try {
    } catch (err) {
      console.log("Registration failed");
    }
  }
};

registerServiceWorker();
```

记得把 app.js 在 index.html 中引入

我们创建一个 sw.js，此时可以不写具体的逻辑, 检查一下是否注册了

<img data-src="/assets/images/sw/service-worker-04.png">
<img data-src="/assets/images/sw/service-worker-05.png">

此时控制台，会出现两次信息，注册和激活生命周期的日志

同时，另外一个 profile、contact 也是公用一个 sw

### 注册的细节 1 作用范围 - scope

https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorkerContainer/register

参考 mdn 的文章，注册的时候，可以传入一个对象，可以设置 scope，当你没的时候，就是注册的目录以及对应的子目录

比如你注册的时候可以声明 scope 为`{scope: "/page1/"}`,这样，他就只作用于`myapp.com/page1/*`所有页面了

### 注册的细节 2 type

mdn 中文上找不到，英文有描述

type
A string specifying the type of worker to create. Valid values are:

- 'classic'
  The loaded service worker is in a standard script. This is the default.

- 'module'
  The loaded service worker is in an ES module and the import statement is available on worker contexts. For ES module compatibility info, see the browser compatibility data table for the ServiceWorker interface.

### 注册的细节 3 updateViaCache

updateViaCache

A string indicating how the HTTP cache is used for service worker scripts resources during updates. Note: This only refers to the service worker script and its imports, not other resources fetched by these scripts.

- 'all'
  The HTTP cache will be queried for the main script, and all imported scripts. If no fresh entry is found in the HTTP cache, then the scripts are fetched from the network.

  如果设置为 'all'，则在为顶级 /service-worker.js 脚本以及在 Service Worker 中导入的任何脚本（如 path/to/import.js）发出请求时，系统将查询 HTTP 缓存。此选项对应于 Chrome 68 之前的 Chrome 中之前的行为。

- 'imports'
  The HTTP cache will be queried for imports, but the main script will always be updated from the network. If no fresh entry is found in the HTTP cache for the imports, they're fetched from the network.

  如果设置为 'imports'，则在检查 /service-worker.js 脚本是否有更新时，永远不会查询 HTTP 缓存，但在提取任何导入的脚本时，系统会查询（在我们的示例中为 path/to/import.js）。这是默认设置，与从 Chrome 68 开始的行为一致。

- 'none'
  The HTTP cache will not be used for the main script or its imports. All service worker script resources will be updated from the network.

  如果设置为 'none'，则在为顶级 /service-worker.js 或任何导入的脚本（例如假设的 path/to/import.js）发出请求时，系统不会查询 HTTP 缓存。
