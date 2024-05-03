---
title: Mysql express node.js 组合使用
author: Chen YuBo
date: 2024-03-09T13:40:07.711Z
featured: false
draft: false
description: "mysql 组合 node.js 使用"
tags:
  - mysql
  - node.js
---

mysql2 用来连接 mysql 和编写 sq 语句
express 用来提供接口 增删改差
js-yaml 用来编写配置文件

## 配置文件

db.ocnfig.yaml

```yaml
db:
  host: localhost #主机
  port: 3306 #端口
  user: root #账号
  password: "123456" #密码 一定要字符串
  database: xiaoman # 库
```

index.js

```sql
import mysql2 from 'mysql2/promise'
import fs from 'node:fs'
import jsyaml from 'js-yaml'
const yaml = fs.readFileSync('./db.config.yaml', 'utf8')
const config = jsyaml.load(yaml)
const sql = await mysql2.createConnection({
   ...config.db
})

```

## express 启动服务

```js
import mysql2 from "mysql2/promise";
import fs from "node:fs";
import jsyaml from "js-yaml";
import express from "express";
const yaml = fs.readFileSync("./db.config.yaml", "utf8");
const config = jsyaml.load(yaml);
const sql = await mysql2.createConnection({
  ...config.db,
});
const app = express();
app.use(express.json());
//查询接口 全部
app.get("/", async (req, res) => {
  const [data] = await sql.query("select * from user");
  res.send(data);
});
//单个查询 params
app.get("/user/:id", async (req, res) => {
  const [row] = await sql.query(`select * from user where id = ?`, [
    req.params.id,
  ]);
  res.send(row);
});

//新增接口
app.post("/create", async (req, res) => {
  const { name, age, hobby } = req.body;
  await sql.query(`insert into user(name,age,hobby) values(?,?,?)`, [
    name,
    age,
    hobby,
  ]);
  res.send({ ok: 1 });
});

//编辑
app.post("/update", async (req, res) => {
  const { name, age, hobby, id } = req.body;
  await sql.query(`update user set name = ?,age = ?,hobby = ? where id = ?`, [
    name,
    age,
    hobby,
    id,
  ]);
  res.send({ ok: 1 });
});
//删除
app.post("/delete", async (req, res) => {
  await sql.query(`delete from user where id = ?`, [req.body.id]);
  res.send({ ok: 1 });
});
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```
