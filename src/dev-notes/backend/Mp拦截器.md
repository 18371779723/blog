---
title: Mybatis-Plus 拦截器/插件
icon: code
---

# Mybatis-Plus 拦截器/插件

## 拦截器概述

MyBatis-Plus 提供的拦截器是一种强大的扩展机制，主要用于在 SQL 执行前后进行自定义操作。通过拦截器，我们可以实现：

- 数据权限控制
- 审计功能
- 数据加密
- SQL 语句的动态修改

## 实现原理

Mybatis-Plus 的插件实现基于 MyBatis 的拦截器机制：

1. 通过 `MybatisPlusInterceptor` 实现对 MyBatis 执行过程的拦截和增强
2. 在 MyBatis 的执行生命周期中插入拦截器
3. 可实现分页、性能分析、乐观锁等功能的自动化处理

## 类型转换实现

### 背景问题

今天在开发时遇到一个类型转换的问题:

数据库中以字符串形式存储了一串用逗号分隔的 id 集合(这是调用外部接口返回的设备同步 id)。在 Java 中我们需要将其转换为 List 集合来处理,但如果不做特殊处理直接查询,由于 varchar 类型无法直接映射到集合类型,该字段会为空。

MyBatis 在完成数据库数据到 Java 实体的类型转换时,会根据 javaType 和 jdbcType 去匹配对应的处理器。MyBatis 内置了很多 TypeHandler 并在启动时注册,所以即使不指定类型,MyBatis 也具备自动推断类型的能力。

但当我们需要将不同类型相互转换时(比如将数据库中的 varchar 类型转为 Java 的 List 集合)他就无法自动推断转换了，就需要我们手动转换。
### 解决方案

#### 1. 编码方案
- 在每次查询前后通过代码手动转换

#### 2.  MyBatis 方案
- 在 XML 文件中定义 ResultMap
- 自定义类型转换器（TypeHandler）:
```java
@MappedTypes(List.class)
public class ListTypeHandler extends BaseTypeHandler<List<String>> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType) throws SQLException {
        if (parameter == null || parameter.isEmpty()) {
            ps.setNull(i, java.sql.Types.VARCHAR);
        } else {
            String joined = String.join(",", parameter);
            ps.setString(i, joined);
        }
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value != null ? Arrays.asList(value.split(",")) : null;
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value != null ? Arrays.asList(value.split(",")) : null;
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value != null ? Arrays.asList(value.split(",")) : null;
    }
}
```
开启方式有多种这里我选择在
在springboot的yml配置文件中设置类型处理器所在的包名，不是处理器路径（应用到全局）
```yaml
mybatis-plus:  
  type-handlers-package: cn.org.hxsoft.config
```

#### 3. MyBatis-Plus 方案
- 使用ResultMap
- 通过自定义类型转换器（TypeHandler）实现自动转换：

```java
/**
 * @author :王彦群
 * @DESCRIPTION : 用于Mybatis中varchar字段向list类型转换
 * @date : 07-31-18:47
 */
//因为不确定转换后类型，所以转成List<String>
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes({List.class})
public class String2ListTypeHandler implements TypeHandler<List<String>> {
    @Override
    public void setParameter(PreparedStatement preparedStatement, int i, List<String> integerList, JdbcType jdbcType) throws SQLException {
        String items = StrUtil.join(",", integerList);
        try {
            preparedStatement.setString(i, items);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Override
    public List<String> getResult(ResultSet resultSet, String i) throws SQLException {
        return Arrays.asList(resultSet.getString(i).split(","));
    }

    @Override
    public List<String> getResult(ResultSet resultSet, int i) throws SQLException {
        return Arrays.asList(resultSet.getString(i).split(","));
    }

    @Override
    public List<String> getResult(CallableStatement callableStatement, int i) throws SQLException {
        String items = callableStatement.getString(i);
        return Arrays.asList(items.split(","));
    }
}
```
在使用时只需要在类上开启自动映射，再在需要指定类型转换的字段上指定转换器
（这种做法只对mybatis-plus自带的查询方法有效，自定义的查询还是要通过ResutMap）