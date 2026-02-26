# 云函数部署失败解决方案

## 错误信息

```
Error: TencentCloud API error: ResourceNotFound.Function
未找到指定的Function,请创建后再试。
```

## 原因

云函数没有成功上传到云开发环境。

## 解决方案

### 方法一: 在微信开发者工具中手动部署(推荐)

#### 步骤1: 清理旧云函数

1. 点击"云开发"按钮
2. 进入云开发控制台
3. 点击"云函数"
4. 删除所有现有的云函数(如果有)

#### 步骤2: 重新部署云函数

在微信开发者工具中:

**部署 login 云函数:**
1. 在左侧文件树中找到 `cloudfunctions/login` 文件夹
2. 右键点击 `login` 文件夹
3. 选择"上传并部署:云端安装依赖"
4. 等待1-2分钟,直到文件夹旁边出现云图标☁️

**部署 submitFraud 云函数:**
1. 找到 `cloudfunctions/submitFraud` 文件夹
2. 右键点击 `submitFraud` 文件夹
3. 选择"上传并部署:云端安装依赖"
4. 等待1-2分钟

**部署 getFraudRecords 云函数:**
1. 找到 `cloudfunctions/getFraudRecords` 文件夹
2. 右键点击 `getFraudRecords` 文件夹
3. 选择"上传并部署:云端安装依赖"
4. 等待1-2分钟

#### 步骤3: 验证部署成功

1. 在左侧文件树中,确认三个云函数文件夹旁边都有云图标☁️
2. 点击"云开发"按钮
3. 点击"云函数"
4. 应该能看到三个云函数:
   - login
   - submitFraud
   - getFraudRecords

### 方法二: 检查云函数配置

如果上传失败,检查以下内容:

#### 1. 检查 package.json

确认每个云函数文件夹下都有 `package.json`:

**login/package.json:**
```json
{
  "name": "login",
  "version": "1.0.0",
  "description": "用户登录云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

**submitFraud/package.json:**
```json
{
  "name": "submitFraud",
  "version": "1.0.0",
  "description": "提交诈骗线索云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

**getFraudRecords/package.json:**
```json
{
  "name": "getFraudRecords",
  "version": "1.0.0",
  "description": "获取举报记录云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

#### 2. 检查 index.js

确认每个云函数文件夹下都有 `index.js`,并且代码正确。

#### 3. 检查 config.json

确认每个云函数文件夹下都有 `config.json`:

```json
{
  "permissions": {
    "openapi": []
  }
}
```

### 方法三: 重新创建云函数

如果上传一直失败,尝试在云开发控制台手动创建:

1. 点击"云开发"按钮
2. 点击"云函数"
3. 点击"新建云函数"
4. 函数名称: `login`
5. 运行环境: Node.js 16.13
6. 点击"下一步"
7. 将 `cloudfunctions/login/index.js` 的代码复制到编辑器
8. 点击"部署"

重复步骤创建 `submitFraud` 和 `getFraudRecords`。

### 方法四: 检查云开发环境

1. 点击"云开发"按钮
2. 确认环境ID是 `zhuguang-1gctmq3g17561f0c`
3. 确认环境状态是"正常"
4. 确认云函数配额未用尽

## 常见问题

### 问题1: 上传时提示"网络错误"

**解决:**
1. 检查网络连接
2. 尝试使用手机热点
3. 重新登录微信开发者工具

### 问题2: 上传时提示"权限不足"

**解决:**
1. 确认小程序 AppID 正确
2. 确认是小程序的管理员或开发者
3. 检查云开发权限设置

### 问题3: 云函数部署成功但调用失败

**解决:**
1. 查看云函数日志
2. 检查代码是否有语法错误
3. 确认依赖安装成功

### 问题4: 云函数列表看不到已部署的函数

**解决:**
1. 刷新云开发控制台
2. 重新编译小程序
3. 检查环境ID是否正确

## 完整部署流程

### 1. 准备工作
- [ ] 云开发已开通
- [ ] 环境ID确认: `zhuguang-1gctmq3g17561f0c`
- [ ] 项目已导入并启用云开发

### 2. 数据库准备
- [ ] 创建 `users` 集合
- [ ] 创建 `fraud_reports` 集合
- [ ] 设置权限为"仅创建者可读写"

### 3. 云存储准备
- [ ] 创建 `fraud` 文件夹

### 4. 云函数部署
- [ ] 部署 `login` 云函数
- [ ] 部署 `submitFraud` 云函数
- [ ] 部署 `getFraudRecords` 云函数
- [ ] 验证三个云函数都显示在列表中

### 5. 测试
- [ ] 清除缓存并重新编译
- [ ] 测试登录功能
- [ ] 测试提交功能
- [ ] 测试记录查看功能

## 验证部署成功的标志

部署成功后,您应该看到:

1. **文件树中**: 三个云函数文件夹旁边都有云图标☁️
2. **云开发控制台**: 云函数列表中有三个函数
3. **Console 日志**: 点击登录后没有"Function not found"错误

## 如果还是不行

请提供:
1. 云函数上传时的完整错误信息
2. 云开发控制台的云函数列表截图
3. 文件树中云函数文件夹的状态(是否有云图标)
4. `project.config.json` 的完整内容

## 调试建议

### 启用云函数详细日志

在每个云函数的 `index.js` 开头添加:

```javascript
console.log('云函数开始执行');
console.log('环境ID:', process.env.TCB_ENV_ID);
console.log('请求参数:', event);
```

这样可以在云函数日志中看到详细的执行信息。

### 检查云函数版本

在云开发控制台中:
1. 点击云函数名称
2. 查看"版本"标签
3. 确认有至少一个版本
4. 确认当前版本状态是"正常"

## 注意事项

1. 云函数名称必须完全一致(大小写敏感)
2. 每次修改代码后需要重新部署
3. 部署过程中不要关闭开发者工具
4. 云函数有冷启动时间,第一次调用可能较慢
5. 注意云函数配额和计费
