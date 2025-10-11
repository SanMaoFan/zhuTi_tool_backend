## 介绍

本项目为猪蹄工具后台系统，平常客户端发送的格式默认为 application/json 格式，

## 建表

### 用户

```mysql
  CREATE TABLE `user_table` (
    `user_id` varchar(40) NOT NULL,
    `user_name` varchar(30) NOT NULL,
    `user_phone` char(11) NOT NULL,
    `create_date` datetime DEFAULT CURRENT_TIMESTAMP,
    `is_del` tinyint(1) DEFAULT '0',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `user_phone` (`user_phone`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

### 分类

```mysql
  CREATE TABLE `type_table` (
    `type_id` varchar(40) NOT NULL,
    `type_name` varchar(30) NOT NULL DEFAULT '新分类',
    `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `type_descript` varchar(100) DEFAULT NULL,
    `is_del` tinyint(1) DEFAULT '0',
    PRIMARY KEY (`type_id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

### 物品

```mysql
  CREATE TABLE `product_table` (
    `product_id` varchar(40) NOT NULL,
    `product_name` varchar(30) NOT NULL DEFAULT '新物品',
    `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `product_descript` varchar(100) DEFAULT NULL,
    `parent_id` varchar(40) NOT NULL,
    `is_del` tinyint(1) DEFAULT '0',
    PRIMARY KEY (`product_id`),
    KEY `product_table_parent_id_uk` (`parent_id`),
    CONSTRAINT `product_table_parent_id_uk` FOREIGN KEY (`parent_id`) REFERENCES `type_table` (`type_id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8
```
