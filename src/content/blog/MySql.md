---
title: Mysql语法集
author: Chen YuBo
date: 2024-03-03T09:32:43.593Z
featured: false
draft: false
description: "sql学习"
tags:
  - sql
---

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

ORDER BY [字段名称] desc 降序(从大到小) asc 升序(从小到大)

```sql
SELECT *  FROM `user` ORDER BY id DESC;
```

### 限制查询结果

limit [开始行] [限制条数]

从 0 开始的

```sql
SELECT *  FROM `user` LIMIT 1,3
```

### 条件查询

我们需要把搜索条件放在 WHERE 子句中

```sql
SELECT *  FROM `user` WHERE name = "cyb";
```

### 多个条件联合查询

- and 操作符

```sql
SELECT *  FROM `user` WHERE name = "cyb" AND age = 18;
```

- or 操作符

```sql
SELECT *  FROM `user` WHERE name = "cyb" OR age <= 18;
```

### 模糊查询

在 MySQL 中，"LIKE"操作符用于模糊匹配字符串。而百分号（%）是用作通配符，表示任意字符（包括零个字符或多个字符）的占位符。

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

删除 id 为 11 的记录

```sql
DELETE FROM `user` WHERE id = 11;
```

批量删除

```sql
DELETE FROM `user` WHERE id IN (8,9,10);
```

### 更新数据

更新的字段使用=赋值, where 确定更新的条例

```sql
UPDATE `user` SET name='asher',age=30,hobby='篮球' WHERE id = 12;
```

## 表达式和函数

### 表达式

MySQL 表达式是一种在 MySQL 数据库中使用的计算式或逻辑式。它们可用于查询、更新和过滤数据，以及进行条件判断和计算。

1. 算术表达式：可以执行基本的数学运算，例如加法、减法、乘法和除法。例如：`SELECT col1 + col2 AS sum FROM table_name;`
2. 字符串表达式：可以对字符串进行操作，例如连接、截取和替换。例如：`SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM table_name;`
3. 逻辑表达式：用于执行条件判断，返回布尔值（TRUE 或 FALSE）。例如：`SELECT * FROM table_name WHERE age > 18 AND gender = 'Male';`
4. 条件表达式：用于根据条件返回不同的结果。例如：`SELECT CASE WHEN age < 18 THEN 'Minor' ELSE 'Adult' END AS age_group FROM table_name;`
5. 聚合函数表达式：用于计算数据集的聚合值，例如求和、平均值、最大值和最小值。例如：`SELECT AVG(salary) AS average_salary FROM table_name;`
6. 时间和日期表达式：用于处理时间和日期数据，例如提取年份、月份或计算日期差值。例如：`SELECT YEAR(date_column) AS year FROM table_name;`

### 函数

MySQL 提供了大量的内置函数，用于在查询和操作数据时进行计算、转换和处理。以下是一些常用的 MySQL 函数分类及其示例：

1. 字符串函数：

- `CONCAT(str1, str2, ...)`：将多个字符串连接起来。
- `SUBSTRING(str, start, length)`：从字符串中提取子字符串。
- `UPPER(str)`：将字符串转换为大写。
- `LOWER(str)`：将字符串转换为小写。
- `LENGTH(str)`：返回字符串的长度。

2. 数值函数：

- `ABS(x)`：返回 x 的绝对值。
- `ROUND(x, d)`：将 x 四舍五入为 d 位小数。
- `CEILING(x)`：返回不小于 x 的最小整数。
- `FLOOR(x)`：返回不大于 x 的最大整数。
- `RAND()`：返回一个随机数。

3. 日期和时间函数：

- `NOW()`：返回当前日期和时间。
- `CURDATE()`：返回当前日期。
- `CURTIME()`：返回当前时间。
- `DATE_FORMAT(date, format)`：将日期格式化为指定的格式。
- `DATEDIFF(date1, date2)`：计算两个日期之间的天数差。

3. 条件函数：

- `IF(condition, value_if_true, value_if_false)`：根据条件返回不同的值。
- `CASE WHEN condition1 THEN result1 WHEN condition2 THEN result2 ELSE result END`：根据条件返回不同的结果。

4. 聚合函数：

- `COUNT(expr)`：计算满足条件的行数。
- `SUM(expr)`：计算表达式的总和。
- `AVG(expr)`：计算表达式的平均值。
- `MAX(expr)`：返回表达式的最大值。
- `MIN(expr)`：返回表达式的最小值。

## 子查询、连表

### 子查询

子查询（Subquery），也被称为嵌套查询（Nested Query），是指在一个查询语句中嵌套使用另一个完整的查询语句。子查询可以被视为一个查询的结果集，它可以作为外层查询的一部分，用于进一步筛选、计算或操作数据。

子查询通常出现在主查询的 WHERE 子句、FROM 子句、HAVING 子句或 SELECT 子句中，以提供更复杂的查询逻辑。子查询可以根据主查询的结果动态生成结果集，用于过滤和匹配数据，或者作为函数的参数使用。

子查询可以返回单个值、一列值、一行值或者一个结果集，具体取决于子查询的语法和用法。根据子查询返回的结果类型，可以将其与主查询的其他表达式进行比较、连接或使用作为条件进行过滤。

我们之前的案例都是在一张表去查询，现实中不会把所有东西都放在一张表，会进行分表，甚至还会分库分表，读写分离等等。

```sql
SELECT * FROM `photo` WHERE `user_id` = (SELECT id FROM `user` WHERE name = '小满')
```

子查询必须要用小括号包起来

### 连表查询

把两张表的数据合并到一起

#### 内连接

对于内连接的两个表，驱动表中的记录在被驱动表中找不到匹配的记录，该记录不会加入到最后的结果集，我们上边提到的连接都是所谓的内连接。

```sql
SELECT * FROM `user`, `photo` WHERE `user`.`id` = `photo`.`user_id`
```

#### 外连接-左连接

左连接

语法规则 LEFT JOIN [连接的表] ON [连接的条件]

并且以第一个表作为驱动表 被驱动表如果没有值则补充 null

结果会以驱动表为主

```sql
SELECT * FROM `user` LEFT JOIN `table` ON `user`.`id` = `table`.`user_id`
```

#### 外连接-右连接

语法规则 LEFT JOIN [连接的表] ON [连接的条件]

并且以第二个表作为驱动表 被驱动表如果没有值则忽略

```sql
SELECT * FROM `user` RIGHT JOIN `table` ON `user`.`id` = `table`.`user_id`
```
