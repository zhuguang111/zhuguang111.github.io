# 快速修复指南

## 您遇到的问题

从日志看到两个问题:
1. Logo 图片错误(已修复)
2. 云开发未正确初始化(环境ID不存在)

## 立即修复步骤

### 步骤1: 获取正确的环境ID(重要!)

1. 在微信开发者工具中,点击"云开发"按钮
2. 进入云开发控制台
3. 在页面顶部,您会看到"环境ID",类似:`fraud-report-xxx` 或 `cloud1-xxx`
4. **复制这个环境ID**

### 步骤2: 修改 app.js

打开 `app.js` 文件,找到第6-9行:

```javascript
wx.cloud.init({
  traceUser: true,
});
```

改为(将 `YOUR_ENV_ID` 替换为步骤1复制的环境ID):

```javascript
wx.cloud.init({
  env: 'YOUR_ENV_ID',  // 替换为您的实际环境ID
  traceUser: true,
});
```

**示例**: 如果您的环境ID是 `fraud-report-123456`,则改为:

```javascript
wx.cloud.init({
  env: 'fraud-report-123456',
  traceUser: true,
});
```

### 步骤3: 清除缓存并重新编译

1. 在微信开发者工具中,点击"清缓存"
2. 选择"清除全部缓存"
3. 点击"编译"按钮

### 步骤4: 验证云开发已启用

重新编译后,查看 Console 日志:

**正确的情况下,应该看到:**
```
cloud sdk (build ts xxxxx) injection succeeded
```

**如果还是看到:**
```
cloud sdk (build ts xxxxx) injection skipped
```

说明云开发未启用,请检查:

1. 确认导入项目时选择了"启用云开发"
2. 如果没选择,需要重新导入项目:
   - 关闭当前项目
   - 点击"+"导入项目
   - 勾选"启用云开发"
   - 导入 `wechat-anti-fraud-miniapp` 文件夹

### 步骤5: 确认云函数已部署

1. 在左侧文件树中,展开 `cloudfunctions` 文件夹
2. 检查三个子文件夹旁边是否有云图标☁️:
   - `login` - 应该有云图标
   - `submitFraud` - 应该有云图标
   - `getFraudRecords` - 应该有云图标

3. 如果没有云图标:
   - 右键点击该文件夹
   - 选择"上传并部署:云端安装依赖"
   - 等待1-2分钟,直到出现云图标

### 步骤6: 确认数据库集合已创建

1. 点击"云开发"按钮
2. 点击左侧"数据库"
3. 确认有这两个集合:
   - `users`
   - `fraud_reports`

如果缺少,点击"+"号创建。

### 步骤7: 测试登录

1. 点击"编译"按钮
2. 点击"授权登录"按钮
3. 查看是否登录成功

## 最可能的原因

根据日志 `cloudVersion: undefined`,最可能的原因是:

**导入项目时没有勾选"启用云开发"**

### 解决方法:

必须重新导入项目:

1. 关闭当前项目
2. 点击微信开发者工具左上角的"+"按钮
3. 填写信息:
   - 项目名称: 防诈骗线索举报
   - 目录: 选择 `wechat-anti-fraud-miniapp` 文件夹
   - AppID: wx6b4f24f7e154d8b5
4. **重要**: 勾选"启用云开发"
5. 点击"导入"

然后重复上面的步骤1-7。

## 验证云开发是否启用

重新导入项目后,查看项目配置:

1. 打开 `project.config.json` 文件
2. 确认有以下配置:
   ```json
   {
     "cloudbaseRoot": "./",
     "cloudfunctionRoot": "./cloudfunctions/"
   }
   ```

如果没有 `cloudbaseRoot`,说明未启用云开发。

## 常见错误提示及解决

### 错误1: "请使用 2.2.3 或以上的基础库"
```
请使用 2.2.3 或以上的基础库以使用云能力
```
**解决**: 在"详情"→"本地设置"中,将"调试基础库"版本改为 2.2.3 或更高

### 错误2: "云开发环境ID不存在"
```
invalid env id
```
**解决**: 修改 `app.js` 中的环境ID为您的实际环境ID

### 错误3: "未开通云开发"
```
cloud sdk injection skipped
```
**解决**: 重新导入项目,确保勾选"启用云开发"

### 错误4: "云函数未找到"
```
Function not found
```
**解决**: 部署云函数(右键云函数文件夹→"上传并部署:云端安装依赖")

## 快速检查清单

完成以下所有项后才能正常使用:

- [ ] 重新导入项目时勾选了"启用云开发"
- [ ] 获取了云开发控制台的实际环境ID
- [ ] 修改了 `app.js` 中的环境ID
- [ ] 清除了缓存并重新编译
- [ ] Console 显示 `cloud sdk injection succeeded`
- [ ] 三个云函数都已部署(有云图标☁️)
- [ ] 创建了 `users` 和 `fraud_reports` 数据库集合
- [ ] 创建了 `fraud` 云存储文件夹

## 如果还是不行

请提供:
1. Console 中完整的错误日志
2. `app.js` 中第6-9行的内容(环境ID)
3. 云开发控制台显示的环境ID
4. `project.config.json` 的完整内容

这样我能更准确地帮您定位问题。
