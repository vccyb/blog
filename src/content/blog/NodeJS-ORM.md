---
title: nodejs-orm
author: Chen YuBo
pubDatetime: 2024-03-14T15:09:35.738Z
featured: false
draft: false
description: "sql学习"
tags:
  - node.js
  - orm
---

## 目录

## 1 knex

> Knex是一个基于JavaScript的查询生成器，它允许你使用JavaScript代码来生成和执行SQL查询语句。它提供了一种简单和直观的方式来与关系型数据库进行交互，而无需直接编写SQL语句。你可以使用Knex定义表结构、执行查询、插入、更新和删除数据等操作。

https://knexjs.org/

### Knex的安装和设置

用什么数据库安装对应的数据库就行了

```shell
#安装knex
$ npm install knex --save

#安装你用的数据库
$ npm install pg
$ npm install pg-native
$ npm install sqlite3
$ npm install better-sqlite3
$ npm install mysql
$ npm install mysql2
$ npm install oracledb
$ npm install tedious
```

### 连接数据库

```shell
import knex from 'knex'
const db = knex({
    client: "mysql2",
    connection: config.db
})

const yaml = fs.readFileSync('./db.config.yaml', 'utf8')
const config = jsyaml.load(yaml)
```

yaml

```yaml
db:
  user: root
  password: "123456"
  host: localhost
  port: 3306
  database: xiaoman
```

### 定义表结构

```js
// knex 所有代码直接编写没有效果 需要.then
db.schema
  .createTable("list", table => {
    table.increments("id"); //id自增
    table.integer("age"); //age 整数
    table.string("name"); //name 字符串
    table.string("hobby"); //hobby 字符串
    table.timestamps(true, true); //创建时间和更新时间
  })
  .then(() => {
    console.log("创建成功");
  });
```

### 实现增删改差

```js
import mysql2 from "mysql2/promise";
import fs from "node:fs";
import jsyaml from "js-yaml";
import express from "express";
import knex from "knex";
const yaml = fs.readFileSync("./db.config.yaml", "utf8");
const config = jsyaml.load(yaml);
// const sql = await mysql2.createConnection({
//    ...config.db
// })
const db = knex({
  client: "mysql2",
  connection: config.db,
});

const app = express();
app.use(express.json());
//查询接口 全部
app.get("/", async (req, res) => {
  const data = await db("list").select().orderBy("id", "desc");
  const total = await db("list").count("* as total");
  res.json({
    code: 200,
    data,
    total: total[0].total,
  });
});
//单个查询 params
app.get("/user/:id", async (req, res) => {
  const row = await db("list").select().where({ id: req.params.id });
  res.json({
    code: 200,
    data: row,
  });
});

//新增接口
app.post("/create", async (req, res) => {
  const { name, age, hobby } = req.body;
  const detail = await db("list").insert({ name, age, hobby });
  res.send({
    code: 200,
    data: detail,
  });
});

//编辑
app.post("/update", async (req, res) => {
  const { name, age, hobby, id } = req.body;
  const info = await db("list").update({ name, age, hobby }).where({ id });
  res.json({
    code: 200,
    data: info,
  });
});
//删除
app.post("/delete", async (req, res) => {
  const info = await db("list").delete().where({ id: req.body.id });
  res.json({
    code: 200,
    data: info,
  });
});
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

### 事务

```js
//伪代码
db.transaction(async trx => {
  try {
    await trx("list").update({ money: -100 }).where({ id: 1 }); //A
    await trx("list").update({ money: +100 }).where({ id: 2 }); //B
    await trx.commit(); //提交事务
  } catch (err) {
    await trx.rollback(); //回滚事务
  }
});
```

### 反编译sql语句

```js
db("list").select().toSQL().sql; // 调试knex

db.raw("SELECT * FROM user").then(data => {
  console.log(data);
});
```

## 2 prisma

Prisma 的主要特点包括：

- 类型安全的查询构建器：Prisma 使用强类型语言（如 TypeScript）生成查询构建器，从而提供了在编译时捕获错误和类型检查的能力。这有助于减少错误，并提供更好的开发人员体验。
- 强大的 ORM 层：Prisma 提供了一个功能强大的 ORM 层，使开发人员能够以面向对象的方式操作数据库。它自动生成了数据库模型的CRUD（创建、读取、更新、删除）方法，简化了与数据库的交互。
- 数据库迁移：Prisma 提供了数据库迁移工具，可帮助开发人员管理数据库模式的变更。它可以自动创建和应用迁移脚本，使数据库的演进过程更加简单和可控。
- 性能优化：Prisma 使用先进的查询引擎和数据加载技术，以提高数据库访问的性能。它支持高级查询功能，如关联查询和聚合查询，并自动优化查询以提供最佳的性能

### 安装使用

安装 Prisma CLI：

```shell
npm install -g prisma
// yarn global add prisma
```

初始化项目

```shell
prisma init --datasource-provider mysql
```

会基于模板生成基本目录

连接数据库

- 修改.env文件 `[DATABASE_URL="mysql://账号:密码@主机:端口/库名"]`
- eg: `DATABASE_URL="mysql://root:123456@localhost:3306/xiaoman"`

### 创建表

prisma/schema.prisma

```
model Post {
  id       Int     @id @default(autoincrement()) //id 整数 自增
  title    String  //title字符串类型
  publish  Boolean @default(false) //发布 布尔值默认false
  author   User   @relation(fields: [authorId], references: [id]) //作者 关联用户表 关联关系 authorId 关联user表的id
  authorId Int  // 关联id，把authorId 关联 user表的 id
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]  // 一对多的关系
}

```

执行命令 创建表

```
prisma migrate dev
```

### 实现增删改查

```ts
import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
const port: number = 3000;

app.use(express.json());

//关联查找
app.get("/", async (req, res) => {
  const data = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  res.send(data);
});
//单个查找
app.get("/user/:id", async (req, res) => {
  const row = await prisma.user.findMany({
    where: {
      id: Number(req.params.id),
    },
  });
  res.send(row);
});
//新增
app.post("/create", async (req, res) => {
  const { name, email } = req.body;
  const data = await prisma.user.create({
    data: {
      name,
      email,
      posts: {
        create: {
          title: "标题",
          publish: true,
        },
      },
    },
  });
  res.send(data);
});

//更新
app.post("/update", async (req, res) => {
  const { id, name, email } = req.body;
  const data = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      name,
      email,
    },
  });
  res.send(data);
});

//删除
app.post("/delete", async (req, res) => {
  const { id } = req.body;
  await prisma.post.deleteMany({
    where: {
      authorId: Number(id),
    },
  });
  const data = await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });
  res.send(data);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
```
