# 无人机数据接入小程序部署指南

## 架构说明

```
无人机 → HTTP请求 → 云服务器(3000端口) → 微信云开发API → 小程序云数据库 → 小程序显示
```

## 第一步:配置微信云开发

### 1.1 创建新云函数

1. 打开微信开发者工具
2. 导入项目: `wechat-anti-fraud-miniapp`
3. 在`cloudfunctions`目录下找到`submitFraudFromDrone`
4. 右键 → "上传并部署:云端安装依赖"
5. 等待部署完成

### 1.2 获取云开发配置

1. 在微信开发者工具中,点击"云开发"按钮
2. 记录以下信息:
   - **环境ID**: `env-xxx` (在云开发控制台→设置→环境设置)
   - **AppID**: 已有 `wx6b4f24f7e154d8b5`

### 1.3 获取访问令牌

访问微信开放平台获取access_token:
```
GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
```

## 第二步:部署云服务器

### 2.1 环境要求

- Node.js 16+ 
- Ubuntu 20.04 或 CentOS 7+
- 公网IP
- 开放3000端口

### 2.2 安装依赖

```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 2.3 部署服务

```bash
# 上传drone-server文件夹到服务器
cd /opt
mkdir drone-server
cd drone-server

# 上传文件后安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env
```

编辑`.env`文件:
```
CLOUD_ENV_ID=你的云环境ID
CLOUD_ACCESS_TOKEN=你的access_token
PORT=3000
```

### 2.4 启动服务

```bash
# 开发模式
npm run dev

# 生产模式(推荐使用PM2)
npm install -g pm2
pm2 start server.js --name drone-server
pm2 save
pm2 startup
```

### 2.5 配置防火墙

```bash
# 开放3000端口
sudo ufw allow 3000
sudo ufw reload

# 或使用iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## 第三步:配置无人机端

### 3.1 Python示例

```bash
# 安装依赖
pip install requests

# 修改配置
nano drone_client.py
# 将 server_url 改为你的云服务器IP

# 运行测试
python drone_client.py
```

### 3.2 Node.js示例

```bash
# 安装依赖
npm install axios

# 修改配置
nano drone_client.js
# 将 serverUrl 改为你的云服务器IP

# 运行测试
node drone_client.js
```

### 3.3 ESP32示例

```arduino
// 修改WiFi配置
const char* ssid = "你的WiFi名称";
const char* password = "你的WiFi密码";
const char* serverUrl = "http://你的服务器IP:3000/api/drone-alert";

// 编译上传到ESP32
```

## 第四步:测试流程

### 4.1 测试云服务器

```bash
# 健康检查
curl http://your-server-ip:3000/api/health

# 预期返回:
# {
#   "status": "ok",
#   "timestamp": "2025-03-04T...",
#   "service": "无人机数据转发服务"
# }
```

### 4.2 测试数据提交

```bash
curl -X POST http://your-server-ip:3000/api/drone-alert \
  -H "Content-Type: application/json" \
  -d '{
    "droneId": "TEST_001",
    "fraudType": "冒充客服",
    "phone": "13800138000",
    "description": "测试数据",
    "location": {"latitude": 39.9042, "longitude": 116.4074},
    "sensors": {"temperature": 25, "humidity": 60},
    "confidence": 0.95
  }'
```

### 4.3 查看小程序数据

1. 打开小程序
2. 进入"记录"页面
3. 查看是否收到测试数据
4. 检查数据中是否包含droneData字段

## 第五步:数据格式说明

### 无人机发送的数据格式

```json
{
  "droneId": "DRONE_001",
  "fraudType": "冒充客服",
  "phone": "13800138000",
  "amount": "5000",
  "time": "2025-03-04T10:30:00Z",
  "description": "无人机检测到可疑活动",
  "attachments": [],
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "altitude": 120,
  "sensors": {
    "temperature": 28,
    "humidity": 65,
    "airQuality": "moderate",
    "noiseLevel": 75
  },
  "timestamp": "2025-03-04T10:30:00Z",
  "detectionConfidence": 0.92
}
```

### 存储到小程序的数据格式

```json
{
  "_id": "report_xxx",
  "_openid": "drone_system",
  "fraudType": "冒充客服",
  "phone": "13800138000",
  "amount": "5000",
  "content": "无人机检测到可疑活动",
  "status": "pending",
  "submitTime": "2025-03-04 10:30",
  "droneData": {
    "droneId": "DRONE_001",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074
    },
    "sensors": {
      "temperature": 28,
      "humidity": 65
    },
    "detectionConfidence": 0.92
  },
  "source": "drone"
}
```

## 常见问题

### Q1: access_token如何获取有效token?

A: 使用微信开放平台API,有效期2小时,建议定时刷新

### Q2: 云函数调用失败?

A: 检查以下项:
- 云函数是否部署成功
- 环境ID是否正确
- access_token是否有效
- 网络连接是否正常

### Q3: 无人机无法连接服务器?

A: 检查:
- 服务器IP是否正确
- 3000端口是否开放
- 防火墙是否拦截
- 无人机网络是否正常

### Q4: 数据在小程序中看不到?

A: 检查:
- 云数据库权限设置
- 小程序是否正确加载数据
- 检查`fraud_reports`集合是否有数据

### Q5: 如何区分无人机提交和用户提交?

A: 无人机提交的数据`source`字段为`"drone"`,并包含`droneData`字段

## 安全建议

1. **HTTPS加密**: 生产环境建议使用HTTPS
2. **API密钥**: 为无人机端添加API密钥验证
3. **数据验证**: 在云服务器端验证数据格式
4. **限流控制**: 添加请求频率限制
5. **日志记录**: 记录所有请求和响应

## 监控和维护

```bash
# 查看服务日志
pm2 logs drone-server

# 重启服务
pm2 restart drone-server

# 查看服务状态
pm2 status

# 监控资源使用
pm2 monit
```

## 扩展功能

1. **实时通知**: 使用微信云开发实时数据库推送
2. **数据统计**: 在云函数中添加统计分析
3. **报警规则**: 基于置信度自动触发报警
4. **地图显示**: 在小程序中显示无人机位置
