# 无人机数据快速测试指南

## 快速测试步骤

### 1. 本地测试(推荐先在本地测试)

#### 1.1 启动云服务器

```bash
cd /workspace/drone-server
npm install
node server.js
```

#### 1.2 发送测试数据

```bash
# 方法1: 使用curl
curl -X POST http://localhost:3000/api/drone-alert \
  -H "Content-Type: application/json" \
  -d '{
    "droneId": "TEST_001",
    "fraudType": "冒充客服",
    "phone": "13800138000",
    "description": "本地测试数据",
    "location": {"latitude": 39.9042, "longitude": 116.4074},
    "sensors": {"temperature": 25, "humidity": 60},
    "confidence": 0.95
  }'

# 方法2: 使用Python客户端
cd /workspace/drone-client
python drone_client.py

# 方法3: 使用Node.js客户端
cd /workspace/drone-client
node drone_client.js
```

### 2. 云端部署

#### 2.1 部署到云服务器

```bash
# 1. 上传drone-server文件夹到云服务器
scp -r drone-server user@your-server-ip:/opt/

# 2. SSH登录到云服务器
ssh user@your-server-ip

# 3. 安装依赖并启动
cd /opt/drone-server
npm install
cp .env.example .env
nano .env  # 修改配置

# 启动服务
pm2 start server.js --name drone-server
pm2 save
```

#### 2.2 配置防火墙

```bash
sudo ufw allow 3000
sudo ufw enable
```

### 3. 无人机端配置

#### 3.1 Python无人机端

```python
from drone_client import DroneAntiFraud

# 修改服务器地址
drone = DroneAntiFraud('http://your-cloud-server-ip:3000')

# 发送数据
data = {
    'fraud_type': '冒充客服',
    'phone': '13800138000',
    'description': '无人机检测到可疑活动'
}
drone.send_fraud_alert(data)
```

#### 3.2 修改ESP32配置

```arduino
const char* serverUrl = "http://your-cloud-server-ip:3000/api/drone-alert";
```

## 测试数据示例

### 基础数据
```json
{
  "droneId": "DRONE_001",
  "fraudType": "冒充客服",
  "phone": "13800138000",
  "description": "基础测试数据"
}
```

### 完整数据
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

## 验证清单

- [ ] 云服务器成功启动在3000端口
- [ ] 健康检查接口返回正常
- [ ] 能成功发送测试数据
- [ ] 云函数`submitFraudFromDrone`已部署
- [ ] 云数据库收到数据
- [ ] 小程序能查看到无人机提交的数据
- [ ] 数据中包含droneData字段

## 常见错误排查

### 错误1: 连接被拒绝
```
错误: Connection refused
解决: 检查服务器是否启动,端口是否开放
```

### 错误2: 超时
```
错误: Request timeout
解决: 检查网络连接,增加超时时间
```

### 错误3: 云函数调用失败
```
错误: 云函数执行失败
解决: 检查access_token、环境ID、网络连接
```

## 下一步

1. 将云函数部署到微信云开发
2. 将云服务器部署到生产环境
3. 配置无人机的实际IP和网络
4. 进行端到端测试
