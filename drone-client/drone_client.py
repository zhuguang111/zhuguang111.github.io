import requests
import json
from datetime import datetime

class DroneAntiFraud:
    def __init__(self, server_url='http://your-server-ip:3000'):
        self.server_url = server_url
        self.drone_id = 'DRONE_001'

    def send_fraud_alert(self, fraud_data):
        url = f'{self.server_url}/api/drone-alert'

        payload = {
            'droneId': self.drone_id,
            'fraudType': fraud_data.get('fraud_type', '其他'),
            'phone': fraud_data.get('phone', ''),
            'amount': fraud_data.get('amount', ''),
            'time': fraud_data.get('time', datetime.now().isoformat()),
            'description': fraud_data.get('description', '无人机检测到可疑活动'),
            'attachments': fraud_data.get('attachments', []),
            'location': fraud_data.get('location', {
                'latitude': 0,
                'longitude': 0
            }),
            'altitude': fraud_data.get('altitude', 0),
            'sensors': fraud_data.get('sensors', {
                'temperature': 25,
                'humidity': 60,
                'airQuality': 'good'
            }),
            'timestamp': datetime.now().isoformat(),
            'detectionConfidence': fraud_data.get('confidence', 0.85)
        }

        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': f'Drone-AntiFraud/1.0/{self.drone_id}'
            }

            response = requests.post(
                url,
                data=json.dumps(payload),
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f'数据提交成功! 报告ID: {result.get("reportId")}')
                    return True
                else:
                    print(f'提交失败: {result.get("error")}')
                    return False
            else:
                print(f'HTTP错误: {response.status_code}')
                return False

        except requests.exceptions.Timeout:
            print('请求超时')
            return False
        except requests.exceptions.RequestException as e:
            print(f'请求异常: {e}')
            return False
        except Exception as e:
            print(f'未知错误: {e}')
            return False

    def test_connection(self):
        try:
            url = f'{self.server_url}/api/health'
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print('服务器连接正常')
                return True
            else:
                print(f'服务器异常: {response.status_code}')
                return False
        except Exception as e:
            print(f'连接测试失败: {e}')
            return False


if __name__ == '__main__':

    drone = DroneAntiFraud('http://localhost:3000')

    if drone.test_connection():
        print('开始发送诈骗检测数据...')

        test_data = {
            'fraud_type': '冒充客服',
            'phone': '13800138000',
            'amount': '5000',
            'description': '无人机在商业区检测到疑似电信诈骗活动',
            'location': {
                'latitude': 39.9042,
                'longitude': 116.4074
            },
            'altitude': 120,
            'sensors': {
                'temperature': 28,
                'humidity': 65,
                'airQuality': 'moderate',
                'noiseLevel': 75
            },
            'confidence': 0.92,
            'attachments': []
        }

        success = drone.send_fraud_alert(test_data)
        if success:
            print('数据发送完成')
        else:
            print('数据发送失败')
