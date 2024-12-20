---
title: 小型支付商城系统
index: true
icon: home
date: 2024-11-1
category:
  - 项目介绍
---

# 项目名称：小型支付商城系统

## 项目演示

<video src="/assets/video/small演示.mp4" controls="controls" width="640" height="360"></video>

## 项目描述

在该项目中，我负责设计并搭建了一个高效稳定的在线支付系统，覆盖用户下单到完成支付的全过程。项目集成了微信公众号和支付宝的沙箱支付系统，确保用户支付体验的流畅与安全性，提升了系统的可靠性和用户满意度。

## 核心技术

Spring Boot、MyBatis、MySQL、Redis、Docker

## 项目亮点

- **DDD 领域驱动设计**: 采用DDD架构设计项目，划分核心领域模块，如用户登录、用户下单和对接支付等，每个领域模块独立开发和维护，让代码实现逻辑更加清晰，提高了系统的可维护性和迭代效率。
- **内网穿透与实时测试**：通过 NATAPP 实现内网穿透，将本地支付接口暴露至外网进行实时测试，保证系统功能的安全性和稳定性，模拟真实场景来验证系统在生产环境中的表现。
- **微信支付集成与安全防护**：完成微信扫码支付的接入，结合用户 IP 定位推送安全模板消息，为用户账户提供更强的安全防护，提升了交易的安全等级。
- **订单服务模块设计**：构建严谨的订单管理系统，包括订单创建、数据校验和持久化，确保交易流程的完整性和一致性，为系统的高可用性提供有力支撑。
- **支付宝支付的无缝对接**：集成支付宝沙箱支付系统，配置支付 SDK，实现订单生成、支付状态回调和结果通知的全链路打通，确保交易反馈的及时性和准确性，为用户带来流畅的支付体验。

## 流程设计

![流程图](/assets/images/小型支付商城流程图.png)
