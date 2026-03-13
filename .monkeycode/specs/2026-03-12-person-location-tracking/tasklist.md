# 需求实施计划

- [ ] 1. 创建数据库集合和索引
  - [ ] 1.1 在云开发控制台创建 person_location 集合
  - [ ] 1.2 在云开发控制台创建 locations 集合
  - [ ] 1.3 在云开发控制台创建 persons 集合
  - [ ] 1.4 为 person_location 集合创建索引

- [ ] 2. 创建 reportLocation 云函数（接收树莓派数据上报）
  - [ ] 2.1 创建 cloudfunctions/reportLocation 目录
  - [ ] 2.2 编写 index.js，实现数据接收、验证、存储逻辑
  - [ ] 2.3 编写 config.json 配置
  - [ ] 2.4 编写 package.json 依赖

- [ ] 3. 创建 getLocationRecords 云函数（查询位置记录）
  - [ ] 3.1 创建 cloudfunctions/getLocationRecords 目录
  - [ ] 3.2 编写 index.js，实现按监测点、日期筛选查询
  - [ ] 3.3 编写 config.json 配置
  - [ ] 3.4 编写 package.json 依赖

- [ ] 4. 创建 getHourlyStatistics 云函数（按小时统计频率）
  - [ ] 4.1 创建 cloudfunctions/getHourlyStatistics 目录
  -  [ ] 4.2 编写 index.js，实现按小时聚合统计逻辑
  - [ ] 4.3 编写 config.json 配置
  - [ ] 4.4 编写 package.json 依赖

- [ ] 5. 创建 getLocations 云函数（获取监测点列表）
  - [ ] 5.1 创建 cloudfunctions/getLocations 目录
  - [ ] 5.2 编写 index.js，返回所有监测点
  - [ ] 5.3 编写 config.json 配置

- [ ] 6. 创建管理后台 location-records 页面
  - [ ] 6.1 创建 pages/location-records 目录
  - [ ] 6.2 编写 location-records.json 配置
  - [ ] 6.3 编写 location-records.wxml 页面结构
  - [ ] 6.4 编写 location-records.wxss 样式
  - [ ] 6.5 编写 location-records.js 逻辑（查询记录、统计）

- [ ] 7. 在管理后台添加位置追踪入口
  - [ ] 7.1 修改 pages/admin/admin.wxml，添加入口按钮
  - [ ] 7.2 修改 pages/admin/admin.js，添加导航逻辑

- [ ] 8. 更新 app.json 配置
  - [ ] 8.1 在 pages 中添加 location-records 页面

- [ ] 9. 部署云函数
  - [ ] 9.1 在微信开发者工具中上传并部署 reportLocation
  - [ ] 9.2 在微信开发者工具中上传并部署 getLocationRecords
  - [ ] 9.3 在微信开发者工具中上传并部署 getHourlyStatistics
  - [ ] 9.4 在微信开发者工具中上传并部署 getLocations

- [ ] 10. 编写树莓派对接文档
  - [ ] 10.1 创建 RASPBERRY_PI_GUIDE.md，说明如何调用云函数
