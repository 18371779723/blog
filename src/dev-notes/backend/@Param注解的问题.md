---
title: Mybatis中@Param注解的问题
icon: code
date: 2023-11-27
category:
  - 后端开发
  - Mybatis
tag:
  - Java
  - Mybatis
  - 注解
  - 问题排查
---

# Mybatis中@Param注解的问题

## 一、问题描述

在开发过程中遇到一个看似简单但困扰了很久的问题。一个基础的SQL插入语句执行时报错，提示找不到`equipmentId`字段。具体代码如下：

### Mapper接口方法
```java
void save(@Param("alarm") Alarms alarm);
```

### 调用代码
```java
coreAlarmsMapper.save(alarm);
```

### XML配置
```xml
<insert id="save" parameterType="cn.org.hxsoft.entity.Alarms">
    INSERT INTO dbo.alarms (
        equipmentId,
        alarmPlanTypeId,
        dataTypeId,
        value,
        alarmReason,
        alarmLevel,
        alarmLevelName,
        alarmTime,
        lastHappenTime,
        happenTimes,
        confirmReason,
        confirmTime,
        confirmPersonId,
        handleReason,
        handleTime,
        handlePersonId
    )
    VALUES (
        #{equipmentId},
        #{alarmPlanTypeId},
        #{dataTypeId},
        #{value},
        #{alarmReason},
        #{alarmLevel},
        #{alarmLevelName},
        CONVERT(datetime, #{alarmTime}, 120),
        CONVERT(datetime, #{lastHappenTime}, 120),
        #{happenTimes},
        #{confirmReason},
        CONVERT(datetime, #{confirmTime}, 120),
        #{confirmPersonId},
        #{handleReason},
        CONVERT(datetime, #{handleTime}, 120),
        #{handlePersonId}
    )
</insert>
```

## 二、问题排查过程

1. 首先怀疑是SQL Server语法问题，但检查后发现语法正确
2. 检查了实体类和数据库表结构，确认`equipmentId`字段存在
3. 通过断点调试，确认`equipmentId`字段有正确的值
4. 最终发现问题出在`@Param`注解的使用上

## 三、问题原因及解决方案

### 问题根源
- 使用IDEA自动生成Mapper方法时，自动添加了`@Param`注解
- 当使用`@Param("alarm")`注解时，XML中需要使用`#{alarm.equipmentId}`而不是`#{equipmentId}`
- 对于单个参数的情况，不需要使用`@Param`注解

### 正确使用方式
1. 不使用@Param注解（推荐）：
```java
void save(Alarms alarm);
```

2. 使用@Param注解时：
```java
void save(@Param("alarm") Alarms alarm);
// XML中需要修改为：#{alarm.equipmentId}
```

## 四、经验总结

1. 对于单个参数的方法，可以省略`@Param`注解
2. 使用IDE自动生成代码时要注意检查生成的代码是否符合实际需求
3. 如果使用了`@Param`注解，要注意XML中的参数引用方式需要相应调整

::: tip
在日常开发中，如果方法只有一个参数对象，建议省略`@Param`注解，这样可以简化代码并避免不必要的问题。
:::
