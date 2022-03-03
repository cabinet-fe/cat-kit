---
title: redis
---

# redis
NoSql阵营的数据库.

以键值的方式存储, 且数据大多时候存在内存中, 因此它快, 非常快. 快到就像你访问一个对象的属性(O(1)).

redis被广泛应用在缓存当中, 通过缓存来释放服务器的压力. 其次就是在分布式应用中也大量应用(其本质也是因为redis快, 支持的并发高).

因此使用redis就是因为它快(redis作者开发redis的原因就是嫌弃别的数据库太慢).

## 配置文件
[查看](/fe-dk/learn/redis.conf)Redis6.2版本的配置文件


## 概念
Redis的一些基础和概念

### 数据结构
redis的值支持以下的数据结构
- String 字符串
- Hash 哈希 可以理解为一个对象
- List 列表
- Set 集合
- SortedSet 有序集合
- GEO 地理坐标
- BitMap 位图
- HyperLog

### 命令