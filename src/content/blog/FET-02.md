---
title: 动手学前端测试 - 工具介绍篇
author: Chen YuBo
pubDatetime: 2024-02-21T13:05:19.475Z
featured: false
draft: false
description: "前端常用的测试工具有哪些，有啥特点，我们咋学习，什么场景用啥呢"
tags:
  - jest
  - cypress
  - vitest
---

## 目录

上一篇文章介绍了一些测试的基本概念，本文我们来看我们前端的几大类测试工具，和我们经常碰到的场景，最后做一个个人的使用分享

## 测试工具总览

相信每个和我一样的前端小白，刚接触前端测试都会懵逼，但是有了上文的基本概念后，我们再来看这些工具，再从这些工具中选择适合我们的，我们就可以开始我们的测试之旅了

我们先总览一下

我们以[stateofjs](https://2022.stateofjs.com/zh-Hans/libraries/testing/), 2022年的js关于测试的工具数据统计来看一下。（ps:23年还没有出来，没办法啦）

首先我们看使用度这个角度，也就是我们说的谁用的人多呢？（人嘛，总是从众的心里）

![测试工具使用度](@assets/images/FET/02-01.png)

有几个重点关注的

- jest依旧是老大，但是2022年使用率下降了，但是依然稳居第一
- Mocha、Puppeteer 都处于平稳或者下降趋势
- vitest，Playwright 都呈现上升趋势
- Cypress 保持稳定

好，我们再从另一个角度看，那就是满意度呢？那些工具更加的先进，更加的让开发者，测试编写体检更好，更满意呢？

![测试工具满意度](@assets/images/FET/02-02.png)

- vitest 居于榜首，并且高达97%的满意度
- Playwright 上升趋势，Cypress 下降趋势
- Testing Library 稳定
- Jest 下降趋势

看了这两张图，大家心里大概就有个大致的范围了

工具里面：

- jest 和 cypress 还是老大哥，市场份额刚刚的
- vitest Playwright 是新来搅局的小弟，但是他们很明显，已经获取了一部分人的信任，上升势头明显
- 测试库 Testing Library 还是稳定

## 日常的测试场景

上面看了这些图，这些测试工具能力都很强大，jest可以进行单侧，也可以配合测试库进行组件测试，cypress可以e2e测试，也可以进行单侧和组件测试。可以说现代的测试工具，配合一些相关周边类库，你总能去做你想的测试

但是，写测试是一件不简单的事情，不同的场景，也许选择不同的测试工具会大大降低你写测试的难度

### 场景1 纯函数的单元测试

代码中，总会有很多的utils的函数，或者helper的函数，一些重要的函数选择进行测试时有必要的，这种场景下选啥呢？

个人感觉用jest进行测试时最快的，尤其是对于存函数的场景

### 场景2 组件的测试

前端开发很大一部分工作，都是在进行组件的设计与开发，那么组件的测试呢？

- jest也可以，jest结合jsdom 结合 框架提供的测试库，或者Testing Library可以进行组件的测试
- cypress 也可以

有啥区别吗，其实没啥区别，但是cypress的测试体验更好，更符合我们的测试场景
cypress它内置了浏览器，有着真实的各类浏览器api，你几乎能写的很爽。并且cypres现在支持单独的组件测试模式，简单配置一下就好。

而选择jest，你就有着大量的mock工作，这也是网络上超级多mock技巧的文章来源，jsdom只是模拟，举个小例子，jsdom 缺少相当数量的特性，诸如 window.navigation 或者布局引擎（ offsetTop 等）, 那么我就要mock这个浏览器的api，或者使用第三方的类库，在测试的前置钩子中进行添加。这总是有些麻烦的

### 场景3 e2e测试

到了e2e测试呢，你要模拟整个用户的端到端的操作流程，这些毫无疑问，cypress和playwright 是你的不二之选

### 场景4 性能测试和其他测试

这里我对其他测试的场景了解的也不多，以后补充吧，有经验的也可以留言评论

## 测试工具的选择

写测试并不是那么简单，所以我会尽可能用让我能方便快捷写测试的工具

这里给出几个场景我的选择

- 纯函数的单元测试，我选择jest
  - 一些场景，写的一些类库，封装的一些纯函数工具的小项目，我在这些项目中会选择jest，方便快捷，简单配置即可使用
  - 如果是使用vite脚手架，我会选择vitest，它天然和vite集成，是vite
    官方推荐的测试工具
- 组件的测试，我选择cypress
  - 有时候我们要开发组件，往往我们自己有独立的组件仓库，这种情况下，我会在组件项目选择cypress，因为cypress的测试体验更好，无需让我去mock一些浏览器api，快速让我去写对应的组件测试代码
- e2e测试，我选择cypress
  - e2e测试，比如我们部署上线的工程项目，有时候要模拟一些用户登陆流程，用户报销流程，这一类的我会在工程中集成cypress进行端到端的测试

最后，也是我也才接触过jest，cypress这些，其他的不熟呀，不过我接触的原则就是，参考文档多，官方资料齐全，这也是我没有选择playwright的原因，playwright的文档和资料确实不如cypress和jest丰富

后续，我们就会进入jest、cypress、vitest，真正进入动手学习前端测试的篇章啦

## 总结

1. 现代化的测试框架能力都很强大，但是场景不同，不一定一套测试框架就能解决所有问题
2. 对应场景对应测试框架，会降低了写测试代码的难度
3. 对于非组件场景，工具函数级别相关的测试 我会选择jest或者 vitest
4. 组件测试和e2e测试，我会选择cypress

## 参考

- [vite与其他测试框架的对比](https://cn.vitest.dev/guide/comparisons.html)
- [盘点13个优秀前端测试开源框架大全](https://www.51cto.com/article/745942.html?u_atoken=74968b19398497a5aa5fde8c37a37e01&u_asession=01_coxLt3kl2EhgPAtnAJZvTxzj0C9MScTH4O7-jozxZT-fG7qTYgA1RxCHPKXWRFLdlmHJsN3PcAI060GRB4YZGyPlBJUEqctiaTooWaXr7I&u_asig=05RzPbwqDjxqPkbrAWrKIZE94sKwQtAMESubguXbIOoZK3oKj8ntfdnFW9lCu2ocREnGqFpGGbuTpeOETHIyqjElYJAw-vNzKaOcLsGGb9MWwWaT473jgiOiUjuSGiqpIGmR-aodkl5YZQ3DtK9PRrQfqEqFxjoAIV3PalpnjJms1g2QMxYs6lyXb1lFWKql56UVy58hL806SoagTlWs7iwXF5B4uybw-KcY-4ToD4vyB6TECMmhIw6yNjAlJJvpTBrtdopmv5PNSBZPPNFt2N3IP1T1wCq2oGJJ4bxdKHINusTpJ-4hEVCCqo-GZeD3WUZHi7af-9T9DT_5BT1SiXZw&u_aref=ssZeU4G9xk9%2BCZM8Qm8cva9h1ac%3D)
- [cypress与其他测试框架的区别](https://docs.cypress.io/faq/questions/general-questions-faq#How-is-this-different-from-X-testing-tool)
