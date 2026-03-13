# Requirements Document

## Introduction

该功能实现无人机信号检测和预警系统。树莓派连接SDR（软件无线电）接收机监测指定频段的无线电信号，当检测到无人机信号时，通过云函数上报至微信小程序云开发数据库，管理员可在小程序管理后台收到警报通知并查看检测记录。

## Glossary

- **SDR**: 软件无线电（Software Defined Radio），本项目中指连接到树莓派的无线电接收设备
- **监测点**: SDR设备部署的地理位置
- **检测记录**: 包含监测点、检测时间、信号频率、信号强度等信息的记录
- **警报**: 检测到无人机信号后在小程序端发出的通知提醒

## Requirements

### Requirement 1: SDR设备数据上报

**User Story:** AS SDR设备(树莓派), I WANT 上报检测到的无线电信号, SO THAT 将检测数据存储到云端

#### Acceptance Criteria

1. WHEN 树莓派检测到信号, SHALL 调用云函数上传数据
2. WHEN 云函数接收到数据, SHALL 验证数据格式完整性
3. WHEN 数据验证通过, SHALL 将数据存储到数据库 `drone_detection` 集合
4. IF 检测到无人机信号(满足阈值), SHALL 同时触发警报标记
5. IF 数据格式不完整, SHALL 返回错误信息

### Requirement 2: 实时警报通知

**User Story:** AS 管理员, I WANT 收到实时警报通知, SO THAT 及时知道检测到无人机

#### Acceptance Criteria

1. WHEN 检测到无人机信号, SHALL 在小程序端显示警报提示
2. WHEN 管理员打开小程序, SHALL 显示未读的警报数量
3. EACH 警报 SHALL 包含: 监测点名称、检测时间、信号频率

### Requirement 3: 检测记录管理

**User Story:** AS 管理员, I WANT 查看检测记录, SO THAT 了解历史检测情况

#### Acceptance Criteria

1. WHEN 管理员访问检测记录页面, SHALL 显示所有监测点的检测记录
2. WHEN 管理员选择特定监测点, SHALL 只显示该监测点的记录
3. EACH 记录 SHALL 包含: 监测点名称、检测时间、信号频率、信号强度、是否已处理

### Requirement 4: 监测点管理

**User Story:** AS 管理员, I WANT 管理监测点, SO THAT 添加、编辑、删除监测设备

#### Acceptance Criteria

1. WHEN 管理员添加监测点, SHALL 记录监测点ID、名称、位置、SDR设备参数
2. WHEN 管理员编辑监测点, SHALL 更新监测点信息
3. WHEN 管理员删除监测点, SHALL 软删除监测点(保留历史记录)
4. EACH 监测点 SHALL 包含: 设备ID、监测点名称、地理位置、频段配置、状态

### Requirement 5: 警报处理

**User Story:** AS 管理员, I WANT 处理警报, SO THAT 标记已处理或忽略

#### Acceptance Criteria

1. WHEN 管理员查看警报, SHALL 能够标记为已处理
2. WHEN 管理员标记警报, SHALL 记录处理时间和处理人
3. IF 警报超过24小时未处理, SHALL 持续显示提醒

## Data Models

### drone_detection 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectID | 自动生成 |
| location_id | String | 监测点ID |
| location_name | String | 监测点名称 |
| frequency | Number | 信号频率(MHz) |
| signal_strength | Number | 信号强度(dBm) |
| is_drone | Boolean | 是否判定为无人机信号 |
| alert_status | String | 警报状态: pending/handled/ignored |
| detected_at | Date | 检测时间 |
| handled_at | Date | 处理时间（可选） |
| created_at | Date | 记录创建时间 |

### detection_locations 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectID | 自动生成 |
| location_id | String | 监测点ID |
| location_name | String | 监测点名称 |
| location_desc | String | 位置描述 |
| frequency_min | Number | 监测频段最小值(MHz) |
| frequency_max | Number | 监测频段最大值(MHz) |
| threshold | Number | 信号判定阈值 |
| status | String | 状态: active/inactive |
| is_deleted | Boolean | 是否删除 |
| created_at | Date | 创建时间 |
| updated_at | Date | 更新时间 |

### alerts 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectID | 自动生成 |
| detection_id | String | 检测记录ID |
| location_id | String | 监测点ID |
| location_name | String | 监测点名称 |
| is_read | Boolean | 是否已读 |
| is_handled | Boolean | 是否已处理 |
| handled_at | Date | 处理时间 |
| created_at | Date | 创建时间 |

## Acceptance Criteria Summary

1. 树莓派可通过云函数上报检测数据
2. 数据正确存储到云开发数据库
3. 检测到无人机信号时在小程序端发出警报
4. 管理员后台可查看和管理检测记录
5. 支持多监测点管理和查看
6. 支持警报处理和标记
