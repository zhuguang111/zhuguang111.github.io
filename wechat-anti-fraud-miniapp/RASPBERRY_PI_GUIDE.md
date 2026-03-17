# 树莓派对接指南

本文档说明如何将树莓派设备对接至微信小程序云开发，实现人员位置追踪数据上报。

## 前提条件

1. 已在微信开发者工具中开通云开发
2. 已部署以下云函数：
   - reportLocation
   - getLocationRecords
   - getHourlyStatistics
   - getLocations

## 云函数调用方式

树莓派通过微信小程序云开发的 HTTP API 调用云函数。

### 调用地址

```
https://{环境ID}.weixin.qq.com/tcb/invokecloudfunction?env={环境ID}&name=reportLocation
```

### 请求头

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### 获取 Access Token

需要在微信小程序管理后台获取：

1. 登录微信公众平台：https://mp.weixin.qq.com
2. 开发管理 -> 开发设置 -> 小程序代码泄漏保护（设置打开）
3. 小程序密钥（AppSecret）

获取 access_token：
```
https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APPID}&secret={APPSECRET}
```

## 数据上报示例

### Python 示例代码

```python
import requests
import time
import base64

# 配置参数
APP_ID = "wx6b4f24f7e154d8b5"
APP_SECRET = "your_app_secret"
ENV_ID = "your-env-id"
LOCATION_ID = "location_001"
LOCATION_NAME = "梅边"

def get_access_token():
    url = f"https://api.weixin.qq.com/cgi-bin/token"
    params = {
        "grant_type": "client_credential",
        "appid": APP_ID,
        "secret": APP_SECRET
    }
    response = requests.get(url, params=params)
    data = response.json()
    return data.get("access_token")

def report_location(person_id, person_name, timestamp=None, image_path=None):
    access_token = get_access_token()
    
    url = f"https://{ENV_ID}.weixin.qq.com/tcb/invokecloudfunction"
    params = {
        "env": ENV_ID,
        "name": "reportLocation"
    }
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    if timestamp is None:
        timestamp = int(time.time() * 1000)
    
    data = {
        "location_id": LOCATION_ID,
        "location_name": LOCATION_NAME,
        "person_id": person_id,
        "person_name": person_name,
        "timestamp": timestamp
    }
    
    if image_path:
        with open(image_path, "rb") as f:
            image_base64 = base64.b64encode(f.read()).decode()
            data["imageData"] = image_base64
    
    response = requests.post(url, params=params, headers=headers, json=data)
    result = response.json()
    
    return result

# 使用示例
if __name__ == "__main__":
    result = report_location(
        person_id="person_001",
        person_name="张三",
        timestamp=int(time.time() * 1000)
    )
    print(result)
```

### 树莓派端检测流程

1. **人脸检测**：使用 OpenCV 或 picamera 检测画面中的人脸
2. **人脸识别**：将检测到的人脸与本地/云端数据库比对，获取人员ID
3. **上报数据**：调用 reportLocation 云函数上报位置信息

```python
# 简化的检测流程示例
def detect_and_report():
    # 1. 拍摄照片
    image = capture_image()
    
    # 2. 检测人脸
    faces = detect_faces(image)
    
    for face in faces:
        # 3. 人脸识别
        person_id, person_name = recognize_face(face)
        
        # 4. 上报数据
        result = report_location(
            person_id=person_id,
            person_name=person_name
        )
        
        if result.get("errcode") == 0:
            print("上报成功")
        else:
            print(f"上报失败: {result}")
```

## 请求参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| location_id | String | 是 | 监测点ID，如 "location_001" |
| location_name | String | 是 | 监测点名称，如 "梅边" |
| person_id | String | 是 | 人员ID，如 "person_001" |
| person_name | String | 否 | 人员名称，如 "张三" |
| timestamp | Number | 是 | 时间戳（毫秒），如 1640995200000 |
| imageData | String | 否 | 图片Base64编码，可选 |

## 响应说明

### 成功响应

```json
{
  "errcode": 0,
  "errmsg": "ok",
  "response_data": {
    "success": true,
    "data": {
      "record_id": "xxx",
      "message": "记录成功"
    }
  }
}
```

### 错误响应

```json
{
  "errcode": -1,
  "errmsg": "System error"
}
```

## 注意事项

1. **Access Token 有效期**：access_token 有效期为 2 小时，需缓存使用
2. **调用频率限制**：云函数有并发限制，避免短时间内大量调用
3. **图片上传**：图片Base64编码会增大请求体积，建议直接上传到云存储后传文件ID
4. **网络稳定性**：树莓派需保持网络连接，建议使用有线网络

## 常见问题

### Q1: 调用云函数返回 -1 错误

**可能原因**：
- access_token 过期或无效
- 环境ID不正确
- 云函数未部署

**解决方法**：
1. 重新获取 access_token
2. 确认环境ID与云开发控制台一致
3. 在微信开发者工具中检查云函数是否部署成功

### Q2: 上报成功但数据库没有记录

**可能原因**：
- 云函数执行出错

**解决方法**：
1. 在云开发控制台查看云函数日志
2. 检查数据库集合是否存在
