---
title: "yocto-queue源码分析"
date: 2024-05-17T13:04:05.831Z
category: 源码分析
---

## yocto-queue 介绍

介绍倒是没啥好介绍的，就是一个构建链表队列的库。

## 源码分析

```js
class Node {
  value;
  next;
  constructor(value) {
    this.value = value;
  }
}

export default class Queue {
  #head;
  #tail;
  #size;
  constructor() {
    this.clear();
  }

  enqueue(value) {
    const node = new Node(value);
    if (this.#head) {
      this.#tail.next = node;
      this.#tail = node;
    } else {
      // 空-初始化时候
      this.#head = node;
      this.#tail = node;
    }
    this.#size++;
  }

  dequeue() {
    const current = this.#head;
    if (!current) {
      return;
    }

    this.#head = current.next;
    this.#size--;
    return current.value;
  }

  clear() {
    this.#head = null;
    this.#tail = null;
    this.#size = 0;
  }

  get size() {
    return this.#size;
  }

  *[Symbol.iterator]() {
    let current = this.#head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}
```

## 测试

```ts
describe("yocto-queue test", () => {
  it("test", () => {
    const queue = new Queue();
    queue.enqueue("张三");
    queue.enqueue("李四");
    expect(queue.size).toBe(2);
    expect(queue.dequeue()).toBe("张三");
    expect([...queue]).toEqual(["李四"]);
    queue.clear();
    expect(queue.size).toBe(0);
  });
});
```
