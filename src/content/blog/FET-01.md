---
title: 动手学前端测试 - 基础概念篇
author: Chen YuBo
pubDatetime: 2024-02-18T14:08:58.680Z
featured: false
draft: false
description: "前端测试是什么？什么是单元测试，继承测试又是啥"
tags:
  - 前端测试
  - 单元测试
  - 集成测试
  - E2E测试
---

## 目录

## 什么是前端测试

前端测试是啥呢？好难理解，其实就和普通的测试一样理解就好了，测试的目的就是为了代码的稳健型，以确保其功能代码和性能是符合预期的

## 为什么需要前端测试

所有的测试都是为了前置，提前发现问题，减少线上事故的发生，提高代码质量

- 保证代码质量
- 增强可维护性
- 添加新功能时，确保新功能不会破坏原有功能
- 添加测试用例，方便新人快速上手学习开发

## 前端测试分类

让我们看下[Kent C. Dodds](https://kentcdodds.com/)的定义，也就是下图

![测试模型](@assets/images/FET/01-01.png)

在他这个测试的模型里面认为测试主要分为三类

- 端对端测试：利用一个很像用户行为的机器人来和 App 交互，并验证功能是否正常。有时也会说 “功能测试” 或 E2E。
- 集成测试：验证多个单元是否能协调共同工作。
- 单元测试：验证单独隔离的部分是否正常工作。
- 静态测试：捕获写代码时的错别字和类型错误

> 关于静态测试：静态测试这里其实更多是指用TypeScript以及ESLint等静态检查工具来找出代码问题

下面会对其他三类测试做简单的介绍

## 端到端测试 E2E

端到端测试，**它模拟用户的真实行为，包括用户输入和系统响应，测试整个系统的交互、一致性和可靠性。**

特点：

- 一般运行在完整的系统上
- 用户使用的完整前后端场景
- 可视化用户界面的测试

前端端到端测试使用的库有很多，以下是几个比较流行的：

- Cypress：一个基于 Electron 构建的自动化端到端测试框架，它使用了最新的 Web 技术，提供了简单易用的 API，支持跨浏览器自动化测试。
- Puppeteer：Google 出品的基于 Node.js 的端到端测试库，提供了一个高级的 API，可以让你控制 Chrome 或 Chromium 浏览器的行为，支持各种自定义操作。
- TestCafe：另一个基于 Node.js 的自动化测试框架，使用了无头浏览器和真实浏览器结合的方式来执行测试，支持并行测试和分布式测试。
- Nightwatch.js：一个使用 Node.js 编写的端到端测试框架，基于 Selenium WebDriver，并且提供了易于使用的 API 和内置的断言库。
- Playwright：一个由 Microsoft 开发的自动化测试库，支持 Chromium、Firefox 和 WebKit 三种浏览器，提供了简单易用的 API 和一些方便的工具。

## 集成测试

集成测试是指将多个组件或模块组合在一起进行测试，以验证它们在整个系统中的正确性和互操作性。在前端开发中，通常使用自动化测试工具来执行集成测试。

特点：

- 测试整个代码涉及的多模块
- 系统级别测试
- 更多的测试数据与环境，更长的测试时间

测试工具：一些自动化测试工具，如Jest、Mocha、vitest、Cypress等

## 单元测试

单元测试就是对没有依赖或依赖都被mock掉了的测试单元的测试，一个模块进行测试

特点：

- 单模块
- 存函数，或工具函数集合的测试选择
- 辅助组件等公共组件的测试选择

测试工具：一些自动化测试工具，如Jest、Mocha、vitest、Cypress等

## 测试工具

这里不会列全，只会列未来篇章会使用到的

单元测试相关工具

- jest
- vitest
- cypress

e2e测试工具

- cypress

## 前端框架的测试库

有时候，我们测试更多的是组件，组件的测试，需要使用到框架的测试库，这里会列出一些比较流行的测试库

- React: React官方的Test Utils / Testing Library - React（推荐） / Enzyme （基于上面的测试策略，更推荐React Testing Library，Enzyme暴露了太多内部元素用来测试，虽然一时方便，但远离了用户行为，之后带来的修改频率也比较高，性价比低）

- Vue: Vue官方的Test Utils / Testing Library - Vue

- Angular: Angular内置的测试框架(Jasmine) / Testing Library - Angular

## 总结

本文介绍了一些前端测试的基本概念，基于大佬的测试模型，介绍了下E2E测试，集成测试，单元测试的概念，以及一些常用的测试工具。

## 参考

- [前端测试体系和最佳实践](https://insights.thoughtworks.cn/frontend-testing/)
- [端到端测试(E2E)](https://guide.duanhl.com/project/test/e2e.html)
- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
