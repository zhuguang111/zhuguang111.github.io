const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/drone-alert', async (req, res) => {
  try {
    const droneData = req.body;

    console.log('收到无人机数据:', JSON.stringify(droneData, null, 2));

    if (!droneData.droneId) {
      return res.status(400).json({
        success: false,
        error: '缺少droneId'
      });
    }

    const cloudFunctionData = {
      fraudType: droneData.fraudType || '其他',
      phone: droneData.phone || '',
      amount: droneData.amount || '',
      time: droneData.time || new Date().toISOString(),
      content: droneData.description || '无人机检测到可疑活动',
      attachments: droneData.attachments || [],
      droneData: {
        droneId: droneData.droneId,
        location: droneData.location,
        altitude: droneData.altitude,
        sensors: droneData.sensors,
        timestamp: droneData.timestamp || new Date().toISOString(),
        detectionConfidence: droneData.detectionConfidence
      }
    };

    const cloudEnvId = process.env.CLOUD_ENV_ID || 'your-env-id';

    const accessToken = process.env.CLOUD_ACCESS_TOKEN || 'your-access-token';

    const response = await axios.post(
      `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${accessToken}&env=${cloudEnvId}&name=submitFraudFromDrone`,
      cloudFunctionData
    );

    if (response.data.errcode === 0) {
      const result = JSON.parse(response.data.resp_data);

      if (result.success) {
        res.json({
          success: true,
          message: '数据已提交到小程序',
          reportId: result._id,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || '云函数执行失败'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: `微信云开发API错误: ${response.data.errmsg}`
      });
    }

  } catch (error) {
    console.error('处理无人机数据失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '无人机数据转发服务'
  });
});

app.listen(PORT, () => {
  console.log(`无人机数据转发服务已启动: http://localhost:${PORT}`);
  console.log(`API端点: POST http://localhost:${PORT}/api/drone-alert`);
});
