---
title: Redis发布订阅实现消息队列，消息重复消费问题
icon: code
date: 2024-11-27
category:
  - 后端开发
  - Redis
tag:
  - 消息队列
  - Redis
  - 分布式
  - 问题排查
---

# Redis 发布订阅实现消息队列，消息重复消费问题

## 一、问题描述

在水务项目开发过程中，对于设备获取到的数据系统需要根据用户设置的规则进行处理，判断该条数据是否异常，并且根据规则判断是否应该生成告警信息，并将处理结果保存到数据库中。
我们系统采用的微服务架构，阈值规则和告警不属于同一个模块，对于需要生成告警的数据要么考虑 openfeign 或者使用 RPC 远程调用。

::: info 为什么选择消息队列
这里我选择使用消息队列实现这一功能，这样阈值规则模块处理完数据，如果需要生成告警只需要发送消息让告警模块去异步处理，无需同步。等待即使告警模块挂了，也不会影响数据处理。因为消息队列可以实现异步处理、解耦、削峰，符合业务需要。
:::

::: note 技术选型
由于我们项目不考虑引入 MQ 依赖，所以我采用 Redis 的发布订阅功能实现一个轻量的消息队列（本项目 Redis 版本为 3.2.100，如果更高版本的话可以考虑用 stream 实现）。
:::

### 问题现象

但在测试阶段发现一条数据生成了多条重复的告警信息，这并不是我所期望的，经过排查消费的次数和我开启的消费者线程数一致，说明一条消息被多个消费者重复消费了。

### 实现代码

#### 1. Redis配置类

```java
@Configuration
public class RedisConfig {
    protected Logger logger = LoggerFactory.getLogger(this.getClass());

    @Bean(name = "redisTemplate")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(factory);

        // 使用Jackson2JsonRedisSerialize 替换默认序列化(默认采用的是JDK序列化)
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);

        redisTemplate.setKeySerializer(jackson2JsonRedisSerializer);
        redisTemplate.setHashKeySerializer(jackson2JsonRedisSerializer);
        return redisTemplate;
    }

    @Bean(name = "jsonRedisTemplate")
    public RedisTemplate<String, JSONObject> jsonRedisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, JSONObject> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(factory);

        // 使用Jackson2JsonRedisSerialize 替换默认序列化(默认采用的是JDK序列化)
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);

        redisTemplate.setKeySerializer(jackson2JsonRedisSerializer);
        redisTemplate.setHashKeySerializer(jackson2JsonRedisSerializer);

        redisTemplate.setValueSerializer(jackson2JsonRedisSerializer);
        redisTemplate.setHashValueSerializer(jackson2JsonRedisSerializer);
        return redisTemplate;
    }
}
```

#### 2. 消息生产者

```java
@Component
public class MessagePublisher {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ChannelTopic topic;

    public void publish(AlarmMsg message) {
        redisTemplate.convertAndSend(topic.getTopic(), message);
    }
}
```

#### 3. 消息消费者

```java
@Component
@RequiredArgsConstructor
public class MessageSubscriber implements MessageListener {
    private final IStrategyService strategyService;
    private final CommonMapper commonMapper;

    @Override
    public void onMessage(Message message, byte[] bytes) {
        AlarmMsg alarmMsg = (AlarmMsg) SerializationUtils.deserialize(message.getBody());
        String tableName = alarmMsg.getTableName();
        List<DataDTO> dataList = alarmMsg.getDataList();
        Long dataId = alarmMsg.getDataId();

        // 执行策略逻辑，判断是否异常
        boolean abnormal = strategyService.runStrategy(dataList);

        // 如果异常，更新指定表中的 dataStatus
        if (abnormal) {
            Integer dataStatus = alarmMsg.getMarkValue();
            String markField = alarmMsg.getMarkField();
            commonMapper.updateDataStatus(tableName, dataId, markField ,dataStatus);
        }
    }
}
```

## 二、解决方案

找到问题原因后，解决消息重复消费的问题其实并不难，这里提供几种常见解决方案：

### 1. 消息去重标识

在消息中添加唯一标识（如消息 ID、序列号等），消费者在处理消息时，通过记录已处理的标识，避免重复处理相同标识的消息。这种策略简单易行，但需要在消费者端维护一个状态存储（如数据库、Redis 等），以记录已处理的消息标识。

### 2. 幂等性控制

幂等性是指无论操作多少次，对系统状态的影响都与执行一次相同。通过设计幂等性的消息处理逻辑，可以确保即使消息被重复消费，也不会对系统状态产生副作用。例如，对于数据库操作，可以使用唯一键约束或幂等性的 SQL 语句来避免重复插入或更新数据。

### 3. 分布式锁

在分布式系统中，可以使用分布式锁来确保同一条消息只会被一个消费者处理。分布式锁可以通过 ZooKeeper、Redis 等实现，但在使用时需要注意性能开销和死锁问题。

::: tip 实现选择
这里我选用 Redis 实现一个简易分布式锁来解决重复消费问题。（如果引入了 Redisson，可以更方便的实现分布式锁）
:::

### 改造后的消费者代码

```java
@Component
@RequiredArgsConstructor
public class MessageSubscriber implements MessageListener {
    private final IStrategyService strategyService;
    private final CommonMapper commonMapper;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void onMessage(Message message, byte[] bytes) {
        AlarmMsg alarmMsg = (AlarmMsg) SerializationUtils.deserialize(message.getBody());
        Long dataId = alarmMsg.getDataId();
        String tableName = alarmMsg.getTableName();
        List<DataDTO> dataList = alarmMsg.getDataList();

        // 尝试获取分布式锁
        String lockKey = "lock:" + dataId;
        boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", 60, TimeUnit.SECONDS);

        if (!lockAcquired) {
            // 锁已被其他消费者获取，跳过处理
            return;
        }

        try {
            // 防止消息重复消费
            if (isMessageProcessed(dataId)) {
                return;
            }

            // 执行策略逻辑，判断是否异常
            boolean abnormal = strategyService.runStrategy(dataList);

            // 如果异常，更新指定表中的 dataStatus
            if (abnormal) {
                Integer dataStatus = alarmMsg.getMarkValue();
                String markField = alarmMsg.getMarkField();
                commonMapper.updateDataStatus(tableName, dataId, markField, dataStatus);
            }

            // 标记消息为已处理
            markMessageProcessed(dataId);
        } finally {
            // 释放分布式锁
            redisTemplate.delete(lockKey);
        }
    }

    private boolean isMessageProcessed(Long dataId) {
        return redisTemplate.opsForValue().get(String.valueOf(dataId)) != null;
    }

    private void markMessageProcessed(Long dataId) {
        redisTemplate.opsForValue().set(String.valueOf(dataId), "processed", 60, TimeUnit.SECONDS); // 设置过期时间，避免内存泄漏
    }
}
```

::: warning 注意事项
1. 分布式锁的超时时间要根据业务处理时间合理设置
2. 消息处理状态的过期时间也需要根据实际情况调整
3. 在生产环境中建议使用更成熟的分布式锁实现，如Redisson
:::
