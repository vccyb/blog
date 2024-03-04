---
title: Mysql语法集
author: Chen YuBo
pubDatetime: 2024-03-03T09:32:43.593Z
featured: false
draft: false
description: "sql学习"
tags:
  - sql
---

## 目录

## 数据库

创建数据库

```sql
create database 数据库名;
create database if not exists `xiaoman`
create database `xiaoman`
    default character set = 'utf8mb4';
-- 添加字符集utf-8
```

## 数据表

### 创建表

```sql
-- 创建表
CREATE TABLE `user` (
   id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
   name varchar(100) COMMENT '名字',
   age int COMMENT '年龄',
   address varchar(255) COMMENT '地址',
   create_time timestamp DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间'
) COMMENT '用户表'

```

### 修改表名字

```sql
ALTER TABLE `user` RENAME `user2`;
```

### 增加列

```sql
ALTER TABLE `user` Add COLUMN `hobby` varchar(200) COMMENT '爱好';
```

### 删除列

```sql
ALTER TABLE `user` DROP COLUMN `hobby`;
```

### 编辑列

```sql
ALTER TABLE `user` MODIFY COLUMN `age` varchar(255) NULL COMMENT '年龄2';
```

## 查询

### 查询单个列

```sql
SELECT `name` FROM `user`;
```

### 查询多个列, 逗号隔开即可

```sql
SELECT `name`,`id` FROM `user`;
```

### 查询所有列

```sql
SELECT *  FROM `user`;
```

### 列的别名 `as`

```sql
SELECT `name` as `user_name`,`id` as `user_id` FROM `user`;
```

### 排序

ORDER BY [字段名称] desc降序(从大到小) asc 升序(从小到大)

```sql
SELECT *  FROM `user` ORDER BY id DESC;
```

### 限制查询结果

limit [开始行] [限制条数]

从0开始的

```sql
SELECT *  FROM `user` LIMIT 1,3
```

### 条件查询

我们需要把搜索条件放在WHERE子句中

```sql
SELECT *  FROM `user` WHERE name = "cyb";
```

### 多个条件联合查询

- and操作符

```sql
SELECT *  FROM `user` WHERE name = "cyb" AND age = 18;
```

- or操作符

```sql
SELECT *  FROM `user` WHERE name = "cyb" OR age <= 18;
```

### 模糊查询

在MySQL中，"LIKE"操作符用于模糊匹配字符串。而百分号（%）是用作通配符，表示任意字符（包括零个字符或多个字符）的占位符。

- "满%"：匹配以"满"开头的字符串，后面可以是任意字符。
- "%满"：匹配以"满"结尾的字符串，前面可以是任意字符。
- "%满%"：匹配包含"满"的任意位置的字符串，前后可以是任意字符。

```sql
SELECT * FROM `user` WHERE name LIKE '%满%';
```

## 新增、删除、修改

### 新增

```sql
INSERT INTO user(`name`,`hobby`,`age`) VALUES('chenyubo','basketball',18)
```

插入 null 值

```sql
INSERT INTO user(`name`,`hobby`,`age`) VALUES('chenyubo',null,18)
```

插入多条值, 逗号隔开即可

```sql
INSERT INTO user(`name`,`hobby`,`age`) VALUES(NULL,NULL,NULL),('chenyubo','basketball',18)
```

### 删除

删除id为11的记录

```sql
DELETE FROM `user` WHERE id = 11;
```

批量删除

```sql
DELETE FROM `user` WHERE id IN (8,9,10);
```

### 更新数据

更新的字段使用=赋值, where确定更新的条例

```sql
UPDATE `user` SET name='asher',age=30,hobby='篮球' WHERE id = 12;
```
