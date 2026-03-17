# 新功能部署指南

## 更新内容

已完成以下功能更新:

### 1. 用户协议与隐私政策
- ✅ 添加了完整的用户协议和隐私政策
- ✅ 登录前需要勾选同意协议
- ✅ 包含反诈骗相关法律法规说明

### 2. 举报功能增强
- ✅ 支持上传图片(最多3张)
- ✅ 支持上传视频(最多1个,60秒)
- ✅ 支持上传文件(最多2个,PDF、Word、Excel、TXT)
- ✅ 支持删除已上传的文件

### 3. 管理员后台
- ✅ 管理员登录页面
- ✅ 查看所有举报记录
- ✅ 按状态筛选(全部/待处理/已通过/已驳回)
- ✅ 处理举报(通过/驳回)
- ✅ 查看举报详情

## 部署步骤

### 步骤1: 下载更新

1. 刷新 GitHub 页面
2. 重新下载 ZIP 文件
3. 解压并覆盖原项目

### 步骤2: 在微信开发者工具中重新导入

如果之前未启用云开发,必须重新导入:

1. 关闭当前项目
2. 点击 "+" 导入项目
3. 勾选"启用云开发" ☑️
4. 导入 `wechat-anti-fraud-miniapp` 文件夹

### 步骤3: 部署新的云函数

需要部署以下3个新云函数:

**adminLogin:**
1. 找到 `cloudfunctions/adminLogin`
2. 右键 → "上传并部署:云端安装依赖"
3. 等待到出现云图标☁️

**getAdminReports:**
1. 找到 `cloudfunctions/getAdminReports`
2. 右键 → "上传并部署:云端安装依赖"
3. 等待到出现云图标☁️

**handleReport:**
1. 找到 `cloudfunctions/handleReport`
2. 右键 → "上传并部署:云端安装依赖"
3. 等待到出现云图标☁️

### 步骤4: 更新云存储目录结构

在云开发控制台的"存储"中,确保有以下目录:

```
fraud/
├── images/   (图片)
├── videos/   (视频)
└── files/    (文件)
```

### 步骤5: 测试功能

#### 测试用户协议
1. 打开小程序
2. 未登录时应该看到协议勾选框
3. 必须勾选协议才能点击登录按钮

#### 测试举报功能
1. 登录后点击"举报"
2. 测试上传图片
3. 测试上传视频
4. 测试上传文件
5. 测试删除已上传的文件
6. 填写完整信息并提交

#### 测试管理员后台
1. 在浏览器中输入管理员后台地址:
   ```
   pages/admin/admin
   ```
2. 在开发者工具中打开"详情" →"本地设置",勾选"不校验合法域名"
3. 在小程序中点击右上角"..." → "打开调试"
4. 在 Console 中输入:
   ```javascript
   wx.navigateTo({ url: '/pages/admin/admin' })
   ```
5. 输入管理员账号:
   - 用户名: `admin`
   - 密码: `admin123`
6. 查看所有举报记录
7. 测试通过/驳回功能

### 步骤6: 验证举报状态

1. 用户提交举报后,状态为"待处理"
2. 管理员处理举报后,状态变为"已通过"或"已驳回"
3. 用户在"记录"页面可以看到最新的状态

## 重要说明

### 管理员账号

**默认账号:**
- 用户名: `admin`
- 密码: `admin123`

**修改管理员账号:**

打开 `cloudfunctions/adminLogin/index.js`,修改第11-12行:

```javascript
const ADMIN_USERNAME = 'your_username';
const ADMIN_PASSWORD = 'your_password';
```

修改后重新部署 `adminLogin` 云函数。

### 云函数列表

现在总共有6个云函数:

1. **login** - 用户登录
2. **submitFraud** - 提交举报
3. **getFraudRecords** - 获取用户举报记录
4. **adminLogin** - 管理员登录 (新增)
5. **getAdminReports** - 获取所有举报记录 (新增)
6. **handleReport** - 处理举报 (新增)

### 文件上传限制

- **图片**: 最多3张,格式为JPG/PNG
- **视频**: 最多1个,最长60秒
- **文件**: 最多2个,支持PDF、Word、Excel、TXT

### 举报状态

- **pending**: 待处理
- **approved**: 已通过
- **rejected**: 已驳回

## 访问管理员后台的方法

### 方法1: 通过调试器(推荐)

1. 打开微信开发者工具
2. 点击"调试器"标签
3. 在 Console 中输入:
   ```javascript
   wx.navigateTo({ url: '/pages/admin/admin' })
   ```

### 方法2: 添加入口按钮(可选)

在 `pages/history/history.wxml` 的 `container` 开头添加:

```xml
<view class="admin-entry" bindtap="navigateToAdmin">
  <text>管理员入口</text>
</view>
```

在 `pages/history/history.wxss` 中添加样式:

```css
.admin-entry {
  background: #1890ff;
  color: #ffffff;
  text-align: center;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}
```

在 `pages/history/history.js` 的 `methods` 中添加方法:

```javascript
navigateToAdmin() {
  wx.navigateTo({
    url: '/pages/admin/admin'
  });
}
```

## 用户协议说明

用户协议文件位于: `pages/agreement/agreement.md`

包含以下内容:

1. **用户协议**
   - 服务说明
   - 用户义务
   - 禁止行为
   - 法律责任
   - 举报处理流程

2. **隐私政策**
   - 信息收集范围
   - 信息使用方式
   - 信息共享规则
   - 存储和安全
   - 用户权利

3. **反诈骗条例**
   - 常见诈骗类型
   - 举报注意事项
   - 相关法律法规

## 常见问题

### Q1: 如何修改管理员密码?

A: 编辑 `cloudfunctions/adminLogin/index.js`,修改第12行的密码,然后重新部署云函数。

### Q2: 视频上传失败怎么办?

A: 检查云存储的 `fraud/videos` 目录是否创建,确保有足够的存储空间。

### Q3: 文件上传支持哪些格式?

A: 目前支持 PDF、Word、Excel、TXT 格式。

### Q4: 管理员后台如何添加到导航栏?

A: 参考"访问管理员后台的方法"中的"方法2",在"记录"页面添加入口按钮。

### Q5: 如何查看管理员处理的历史?

A: 在云开发控制台的"数据库"→"fraud_reports"中,查看 `handleTime` 字段。

## 安全建议

1. **修改默认密码**: 生产环境务必修改管理员密码
2. **限制访问权限**: 建议使用白名单限制管理员后台访问
3. **定期备份数据**: 定期导出数据库和云存储数据
4. **监控异常行为**: 关注异常提交频率,防止恶意举报

## 下一步优化建议

1. 添加举报统计图表
2. 支持批量处理举报
3. 添加举报优先级
4. 支持导出举报数据
5. 添加消息通知功能
6. 增加举报分类统计

## 技术支持

如有问题,请查看:
1. `DEPLOYMENT_GUIDE.md` - 基础部署指南
2. `CLOUD_FUNCTION_DEPLOY.md` - 云函数部署指南
3. `FINAL_FIX.md` - 登录问题修复指南
4. `TROUBLESHOOTING.md` - 故障排查指南

## 部署检查清单

- [ ] 已下载最新代码
- [ ] 项目已重新导入并启用云开发
- [ ] 6个云函数都已部署(有云图标☁️)
- [ ] 数据库 `users` 和 `fraud_reports` 集合已创建
- [ ] 云存储 `fraud` 目录及其子目录已创建
- [ ] 测试了用户协议功能
- [ ] 测试了上传图片、视频、文件功能
- [ ] 测试了管理员登录
- [ ] 测试了管理员查看和处理举报功能

完成以上所有检查项后,即可正常使用所有新功能!
