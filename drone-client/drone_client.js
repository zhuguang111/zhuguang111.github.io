const axios = require('axios');

class DroneAntiFraud {
  constructor(serverUrl = 'http://localhost:3000') {
    this.serverUrl = serverUrl;
    this.droneId = 'DRONE_001';
  }

  async sendFraudAlert(fraudData) {
    const url = `${this.serverUrl}/api/drone-alert`;

    const payload = {
      droneId: this.droneId,
      fraudType: fraudData.fraudType || '其他',
      phone: fraudData.phone || '',
      amount: fraudData.amount || '',
      time: fraudData.time || new Date().toISOString(),
      description: fraudData.description || '无人机检测到可疑活动',
      attachments: fraudData.attachments || [],
      location: fraudData.location || {
        latitude: 0,
        longitude: 0
      },
      altitude: fraudData.altitude || 0,
      sensors: fraudData.sensors || {
        temperature: 25,
        humidity: 60,
        airQuality: 'good'
      },
      timestamp: new Date().toISOString(),
      detectionConfidence: fraudData.confidence || 0.85
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Drone-AntiFraud/1.0/${this.droneId}`
        },
        timeout: 30000
      });

      if (response.status === 200 && response.data.success) {
        console.log(`数据提交成功! 报告ID: ${response.data.reportId}`);
        return true;
      } else {
        console.log(`提交失败: ${response.data.error}`);
        return false;
      }
    } catch (error) {
      console.error('请求失败:', error.message);
      return false;
    }
  }

  async testConnection() {
    try {
      const url = `${this.serverUrl}/api/health`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.status === 200) {
        console.log('服务器连接正常');
        return true;
      } else {
        console.log(`服务器异常: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('连接测试失败:', error.message);
      return false;
    }
  }
}

async function main() {
  const drone = new DroneAntiFraud('http://localhost:3000');

  const isHealthy = await drone.testConnection();
  if (isHealthy) {
    console.log('开始发送诈骗检测数据...');

    const testFraudData = {
      fraudType: '冒充客服',
      phone: '13800138000',
      amount: '5000',
      description: '无人机在商业区检测到疑似电信诈骗活动',
      location: {
        latitude: 39.9042,
        longitude: 116.4074
      },
      altitude: 120,
      sensors: {
        temperature: 28,
        humidity: 65,
        airQuality: 'moderate',
        noiseLevel: 75
      },
      confidence: 0.92,
      attachments: []
    };

    const success = await drone.sendFraudAlert(testFraudData);
    if (success) {
      console.log('数据发送完成');
    } else {
      console.log('数据发送失败');
    }
  }
}

main();
