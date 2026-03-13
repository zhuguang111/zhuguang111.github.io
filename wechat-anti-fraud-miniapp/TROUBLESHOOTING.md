# 登录失败排查指南

## 问题1: Logo 图片加载错误

**已解决**: 已将 logo 图片替换为 emoji 图标,不再需要图片文件。

## 问题2: 登录失败排查步骤

### 步骤1: 检查云开发环境ID

1. 打开微信开发者工具
2. 点击工具栏的"云开发"按钮
3. 进入云开发控制台
4. 在页面顶部找到"环境ID"
5. **复制这个环境ID**

### 步骤2: 修改 app.js 中的环境ID

1. 在微信开发者工具中打开 `app.js` 文件
2. 找到第7行的 `env: 'zhuguang-1gctmq3g17561f0c'`
3. 将其替换为步骤1中复制的**实际环境ID**

例如,如果您的环境ID是 `fraud-report-xxx`,修改为:
```javascript
wx.cloud.init({
  env: 'fraud-report-xxx',  // 使用您的实际环境ID
  traceUser: true,
});
```

### 步骤3: 确认云函数已部署

1. 在微信开发者工具左侧文件树中
2. 展开 `cloudfunctions` 文件夹
3. 检查三个云函数文件夹:
   - `login`
   - `submitFraud`
   - `getFraudRecords`
4. 每个文件夹旁边应该有云图标☁️,表示已部署

如果云函数文件夹旁边没有云图标:
1. 右键点击该文件夹
2. 选择"上传并部署:云端安装依赖"
3. 等待部署完成(约1-2分钟)

### 步骤4: 确认数据库集合已创建

1. 点击"云开发"按钮
2. 点击左侧"数据库"
3. 确认存在以下两个集合:
   - `users`
   - `fraud_reports`

如果不存在,点击"+"号创建。

### 步骤5: 查看错误日志

在微信开发者工具中:

1. 点击底部"Console"标签
2. 点击"授权登录"按钮
3. 查看 Console 中显示的错误信息

**常见错误及解决方法:**

#### 错误A: "云函数未找到"
```
Error: cloud function execution error: Function not found
```
**解决**: 云函数未部署成功,重新部署云函数

#### 错误B: "环境ID不存在"
```
Error: invalid env id
```
**解决**: 修改 `app.js` 中的环境ID为正确的环境ID

#### 错误C: "数据库集合不存在"
```
Error: collection not exists
```
**解决**: 在数据库控制台创建 `users` 和 `fraud_reports` 集合

#### 错误D: "权限错误"
```
Error: permission denied
```
**解决**: 检查数据库集合权限设置为"仅创建者可读写"

### 步骤6: 检查云函数日志

1. 点击"云开发"按钮
2. 点击左侧"云函数"
3. 点击"login"云函数
4. 点击"日志"标签
5. 查看是否有错误信息

### 步骤7: 重新编译

完成上述检查后:

1. 点击工具栏的"清缓存" → "清除全部缓存"
2. 点击"编译"按钮
3. 再次尝试登录

## 快速检查清单

- [ ] 云开发已开通
- [ ] 环境ID已正确配置在 `app.js` 中
- [ ] 数据库 `users` 集合已创建
- [ ] 数据库 `fraud_reports` 集合已创建
- [ ] `login` 云函数已部署(有云图标☁️)
- [ ] `submitFraud` 云函数已部署
- [ ] `getFraudRecords` 云函数已部署
- [ ] 云存储 `fraud` 文件夹已创建
- [ ] 已清除缓存并重新编译

## 如果仍然无法解决

请提供以下信息:

1. Console 中的完整错误信息
2. 云函数 `login` 的日志输出
3. `app.js` 中的环境ID(部分即可)
4. 云开发控制台中显示的环境ID

## 调试技巧

### 使用真机调试

1. 点击工具栏"真机调试"
2. 用手机扫描二维码
3. 在手机上操作,查看开发者工具中的日志

### 查看 Network 请求

1. 点击底部"Network"标签
2. 点击登录按钮
3. 查看 `wx.cloud.callFunction` 请求的响应

### 使用 console.log 调试

在 `pages/index/index.js` 的 `login` 方法中添加:

```javascript
console.log('开始登录', userInfo);
const res = await wx.cloud.callFunction({...});
console.log('云函数响应', res);
```

这样可以追踪整个登录流程。
