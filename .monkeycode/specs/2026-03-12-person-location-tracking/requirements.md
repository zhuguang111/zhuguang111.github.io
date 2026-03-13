# Requirements Document

## Introduction

该功能用于实现人员位置追踪数据的管理和展示。通过树莓派设备检测人员经过信息，经云函数上传至微信小程序云开发数据库，管理员可在管理后台查看各监测点的经过人员记录、时间以及按小时统计的出现频率。

## Glossary

- **SBC**: 单板计算机（Single Board Computer），本项目中指树莓派
- **云函数**: 微信小程序云开发的云端运行函数
- **监测点**: 树莓派设备所在的地理位置
- **人员记录**: 包含人员标识、地点、时间的数据条目
- **出现频率**: 单位时间内（每小时）人员出现在监测点的次数

## Requirements

### Requirement 1: 树莓派数据上报

**User Story:** AS 树莓派设备, I WANT 上报检测到的人员信息, SO THAT 将人员经过数据存储到云端

#### Acceptance Criteria

1. WHEN 树莓派检测到人员, SHALL 调用云函数上传数据
2. WHEN 云函数接收到数据, SHALL 验证数据格式完整性
3. WHEN 数据验证通过, SHALL 将数据存储到数据库 `person_location` 集合
4. IF 数据格式不完整, SHALL 返回错误信息给树莓派

### Requirement 2: 数据存储

**User Story:** AS 系统, I WANT 存储人员位置数据, SO THAT 后续可查询和分析

#### Acceptance Criteria

1. WHEN 上报数据包含地点、人员ID、时间戳, SHALL 创建数据记录
2. IF 监测点不存在, SHALL 自动创建新的监测点记录
3. IF 人员首次出现, SHALL 创建新的人员记录

### Requirement 3: 管理员后台展示

**User Story:** AS 管理员, I WANT 查看人员经过记录, SO THAT 了解各监测点的人员活动情况

#### Acceptance Criteria

1. WHEN 管理员访问记录页面, SHALL 显示所有监测点的最新记录
2. WHEN 管理员选择特定监测点, SHALL 只显示该监测点的记录
3. WHEN 管理员选择特定日期, SHALL 只显示该日期的记录
4. EACH 记录 SHALL 包含: 地点名称、人员标识、经过时间

### Requirement 4: 按小时统计频率

**User Story:** AS 管理员, I WANT 查看人员出现频率统计, SO THAT 分析人员活动规律

#### Acceptance Criteria

1. WHEN 管理员查看频率统计, SHALL 按小时分组统计每人的出现次数
2. EACH 统计结果 SHALL 包含: 监测点名称、人员标识、小时、出现次数
3. IF 某小时无记录, SHALL 显示次数为 0
4. WHEN 管理员选择日期范围, SHALL 统计该范围内每天每小时的频率

### Requirement 5: 人员面部识别

**User Story:** AS 系统, I WANT 处理人员面部识别数据, SO THAT 识别人员身份

#### Acceptance Criteria

1. WHEN 树莓派上传图片或特征数据, SHALL 调用云端面部识别服务
2. WHEN 识别成功, SHALL 关联人员ID并存储记录
3. IF 识别失败, SHALL 存储为"未知人员"并记录原始数据

## Data Models

### person_location 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectID | 自动生成 |
| location_id | String | 监测点ID |
| location_name | String | 监测点名称 |
| person_id | String | 人员ID |
| person_name | String | 人员名称（识别成功时） |
| timestamp | Date | 经过时间 |
| image_url | String | 图片云存储地址（可选） |
| created_at | Date | 记录创建时间 |

### locations 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectID | 自动生成 |
| location_id | String | 监测点ID |
| location_name | String | 监测点名称 |
| description | String | 描述信息 |
| created_at | Date | 创建时间 |

### persons 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectID | 自动生成 |
| person_id | String | 人员ID |
| person_name | String | 人员名称 |
| face_data | String | 面部特征数据（可选） |
| created_at | Date | 创建时间 |

## Acceptance Criteria Summary

1. 树莓派可通过云函数上报人员位置数据
2. 数据正确存储到云开发数据库
3. 管理员后台可查看所有记录
4. 支持按监测点、日期筛选
5. 支持按小时统计出现频率
6. 面部识别数据可云端处理
