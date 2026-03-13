# 防诈骗线索举报小程序

微信小程序项目，用于上传疑似电信诈骗的线索。

## 项目信息

- **小程序ID**: wx6b4f24f7e154d8b5
- **云开发环境ID**: zhuguang-1gctmq3g17561f0c

## 项目结构

```
wechat-anti-fraud-miniapp/
├── app.js                          # 小程序入口文件
├── app.json                        # 小程序配置文件
├── app.wxss                        # 全局样式文件
├── project.config.json             # 项目配置文件
├── sitemap.json                    # 站点地图配置
├── pages/                          # 页面目录
│   ├── index/                      # 首页
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   ├── submit/                     # 提交举报页面
│   │   ├── submit.js
│   │   ├── submit.wxml
│   │   ├── submit.wxss
│   │   └── submit.json
│   └── history/                    # 举报记录页面
│       ├── history.js
│       ├── history.wxml
│       ├── history.wxss
│       └── history.json
├── cloudfunctions/                 # 云函数目录
│   ├── login/                      # 登录云函数
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   ├── submitFraud/                # 提交举报云函数
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   └── getFraudRecords/            # 获取记录云函数
│       ├── index.js
│       ├── package.json
│       └── config.json
└── images/                         # 图片资源
    └── logo.png
```

## 功能特性

1. **用户登录**
   - 微信授权登录
   - 用户信息存储到数据库

2. **线索提交**
   - 选择诈骗类型
   - 输入涉事电话
   - 填写涉及金额(可选)
   - 选择发生时间(可选)
   - 详细描述诈骗经过
   - 上传相关证据图片(最多3张)

3. **举报记录**
   - 查看历史举报记录
   - 查看举报详情
   - 预览上传的图片

## 数据库设计

### users 集合
```json
{
  "_openid": "用户openid",
  "nickName": "昵称",
  "avatarUrl": "头像URL",
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### fraud_reports 集合
```json
{
  "_openid": "用户openid",
  "fraudType": "诈骗类型",
  "phone": "涉事电话",
  "amount": "涉及金额",
  "time": "发生时间",
  "content": "详细描述",
  "attachments": ["附件ID数组"],
  "status": "状态",
  "submitTime": "提交时间",
  "createTime": "创建时间"
}
```

## 部署步骤

### 1. 云开发初始化

1. 登录微信开发者工具
2. 导入项目目录 `wechat-anti-fraud-miniapp`
3. 填入小程序ID: `wx6b4f24f7e154d8b5`
4. 开通云开发服务
5. 创建环境，环境ID: `zhuguang-1gctmq3g17561f0c`

### 2. 数据库配置

在云开发控制台创建以下数据库集合:

1. **users** - 用户信息表
   - 无需配置权限规则
   
2. **fraud_reports** - 举报记录表
   - 无需配置权限规则

### 3. 云存储配置

在云开发控制台创建以下存储目录:

```
fraud/
```

### 4. 云函数部署

依次上传并部署云函数:

1. **login**
   - 右键点击 `cloudfunctions/login` 目录
   - 选择"上传并部署:云端安装依赖"

2. **submitFraud**
   - 右键点击 `cloudfunctions/submitFraud` 目录
   - 选择"上传并部署:云端安装依赖"

3. **getFraudRecords**
   - 右键点击 `cloudfunctions/getFraudRecords` 目录
   - 选择"上传并部署:云端安装依赖"

### 5. 添加图片资源

在 `images/` 目录下添加 logo.png 作为小程序图标。

### 6. 测试运行

1. 在微信开发者工具中点击"编译"
2. 点击"授权登录"按钮进行登录
3. 测试提交举报功能
4. 查看举报记录页面

## 开发注意事项

1. 确保云开发环境ID正确配置在 `app.js` 中
2. 云函数需要上传并部署后才能使用
3. 图片上传功能需要配置云存储权限
4. 测试时建议使用真机调试
5. 确保小程序已配置合法域名

## 安全建议

1. 定期检查云函数权限配置
2. 对敏感数据进行加密处理
3. 实施访问频率限制防止滥用
4. 定期备份数据库数据
