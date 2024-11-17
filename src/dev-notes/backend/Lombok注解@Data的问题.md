---
title: Lombok注解@Data的问题
icon: code
---

# Lombok 注解@Data 的问题

## 一、问题描述

最近在和前端对接接口时，发现后端接口返回给前端的字段大小写出现问题。具体情况如下：

### 问题代码示例

```java
@Data
public class MobileInfo {
    private String iPhone;
}
```

- 预期返回结果：`iPhone`
- 实际返回结果：`iphone`

使用 Lombok 的 `@Data` 注解后，返回给前端的是 `iphone`，而不是预期中的 `iPhone`。

## 二、原因分析

针对首字母小写、第二个字母大写的这种驼峰命名方式，使用 `@Data` 注解生成的 getter 和 setter 方法如下：

### Lombok 生成的方法

```java
public String getIPhone() {
    return iPhone;
}

public void setIPhone(String iPhone) {
    this.iPhone = iPhone;
}
```

### Spring 期望的正确方法

```java
public String getiPhone() {
    return iPhone;
}

public void setiPhone(String iPhone) {
    this.iPhone = iPhone;
}
```

Lombok 与 Spring 针对这种特殊的驼峰命名（首字母小写，第二个字母大写）的解析方式是不同的。这种差异会影响到 Jackson 的默认解析行为，最终导致返回给前端的属性名称与预期不符。
