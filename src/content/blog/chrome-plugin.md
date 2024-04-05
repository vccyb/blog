---
title: 谷歌插件
author: Chen YuBo
pubDatetime: 2024-04-04T03:46:41.064Z
featured: false
draft: false
description: "谷歌浏览器扩展开发学习"
tags:
  - JS
---

教程地址：https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=zh-cn

## Hello World 扩展程序

### 编写基本的文件

manifest.json文件

> 目录中创建一个名为 manifest.json 的新文件。此 JSON 文件描述了扩展程序的功能和配置
> 例如，大多数清单文件包含一个 "action" 键，用于声明 Chrome 应用作扩展程序的操作图标的图片，以及当用户点击扩展程序的操作图标时在弹出式窗口中显示的 HTML 页面。

```json
{
  "manifest_version": 3,
  "name": "Hello Extensions",
  "description": "Base Level Extension",
  "version": "1.0",
  "action": {
    "default_popup": "hello.html",
    "default_icon": "hello_extensions.png"
  }
}
```

hello.html

```html
<html>
  <body>
    <h1>Hello Extensions</h1>
  </body>
</html>
```

### 浏览器加载插件

- 在新标签页中输入 chrome://extensions，前往“扩展程序”页面。（按照设计，chrome:// 网址是不可链接的。）
  - 或者，您也可以点击“扩展程序”菜单谜题按钮，然后选择菜单底部的管理扩展程序。
  - 或者，点击 Chrome 菜单，将光标悬停在更多工具上，然后选择扩展程序。
- 点击开发者模式旁边的切换开关以启用开发者模式。
- 点击 Load unpacked（加载解压缩）按钮，然后选择扩展程序目录

### 固定扩展程序

就是点一下，很简单

### 效果

![](@assets/images/chromeEx/chrome-01.png)

### 控制台日志和错误

> 在开发期间，您可以通过访问浏览器控制台日志来调试代码。在本例中，我们将找到该弹出式窗口的日志。首先，向 hello.html 添加脚本标记。

```html
<html>
  <body>
    <h1>Hello Extensions</h1>
    <script src="popup.js"></script>
  </body>
</html>
```

```js
//popup.js
console.log("This is a popup!");
```

示意图
![](@assets/images/chromeEx/chrome-02.png)
