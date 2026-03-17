const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { location_id, location_name, frequency, signal_strength, is_drone, timestamp } = event;

  if (!location_id || !location_name || !frequency || signal_strength === undefined) {
    return {
      success: false,
      error: '缺少必要参数'
    };
  }

  try {
    console.log('收到检测数据:', event);
    
    // 处理时间戳，确保使用正确的时间
    let detectTime;
    const providedTimestamp = timestamp;
    console.log('收到的时间戳:', providedTimestamp);
    console.log('时间戳类型:', typeof providedTimestamp);
    
    if (providedTimestamp !== undefined && providedTimestamp !== null && providedTimestamp !== '') {
      // 有传入时间戳，尝试解析
      let timestampValue = providedTimestamp;
      
      // 如果是字符串，尝试转换为数字
      if (typeof timestampValue === 'string') {
        // 检查是否是数字字符串
        if (!isNaN(timestampValue)) {
          timestampValue = parseInt(timestampValue, 10);
        } else {
          // 尝试作为日期字符串解析
          const parsed = Date.parse(timestampValue);
          if (!isNaN(parsed)) {
            timestampValue = parsed;
          }
        }
      }
      
      // 如果是数字，判断是秒还是毫秒
      if (typeof timestampValue === 'number') {
        // 如果时间戳小于 10000000000，假设是秒（10位），转换为毫秒（13位）
        if (timestampValue < 10000000000) {
          timestampValue = timestampValue * 1000;
        }
        detectTime = new Date(timestampValue);
      } else {
        // 无法解析，使用当前时间
        detectTime = new Date();
      }
    } else {
      // 没有传入时间戳，使用当前时间
      detectTime = new Date();
    }
    
    // 确保时间有效
    if (isNaN(detectTime.getTime())) {
      console.log('无效时间，使用当前时间');
      detectTime = new Date();
    }
    
    console.log('处理后的时间:', detectTime);
    console.log('处理后的时间戳:', detectTime.getTime());
    
    const formattedTime = `${detectTime.getFullYear()}-${String(detectTime.getMonth() + 1).padStart(2, '0')}-${String(detectTime.getDate()).padStart(2, '0')} ${String(detectTime.getHours()).padStart(2, '0')}:${String(detectTime.getMinutes()).padStart(2, '0')}`;
    console.log('格式化时间:', formattedTime);

    let locationCheck = null;
    let location = null;
    let alertStatus = 'pending';
    let isAlert = false;
    
    try {
      locationCheck = await db.collection('detection_locations').where({
        location_id: location_id,
        status: 'active',
        is_deleted: false
      }).get();
      console.log('监测点检查结果:', locationCheck.data);
      
      if (locationCheck.data.length > 0) {
        location = locationCheck.data[0];
        console.log('找到监测点:', location);
        
        // 判断是否为警报
        if (is_drone && signal_strength >= location.threshold) {
          alertStatus = 'pending';
          isAlert = true;
        }
      } else {
        console.log('监测点不存在或已停用，使用默认阈值');
        // 监测点不存在时，使用默认阈值
        const defaultThreshold = -60; // 默认阈值
        if (is_drone && signal_strength >= defaultThreshold) {
          alertStatus = 'pending';
          isAlert = true;
        }
      }
    } catch (locErr) {
      console.error('监测点检查失败:', locErr);
      // 监测点检查失败时，使用默认阈值
      const defaultThreshold = -60; // 默认阈值
      if (is_drone && signal_strength >= defaultThreshold) {
        alertStatus = 'pending';
        isAlert = true;
      }
    }

    // 创建检测记录
    const res = await db.collection('drone_detection').add({
      data: {
        location_id: location_id,
        location_name: location_name,
        frequency: frequency,
        signal_strength: signal_strength,
        is_drone: is_drone || false,
        alert_status: alertStatus,
        detected_at: detectTime.getTime(), // 存储时间戳
        formatted_time: formattedTime,
        created_at: new Date().getTime() // 存储时间戳
      }
    });
    console.log('检测记录创建成功:', res);

    let alertCreated = null;
    if (isAlert) {
      alertCreated = await db.collection('alerts').add({
        data: {
          detection_id: res._id,
          location_id: location_id,
          location_name: location_name,
          frequency: frequency,
          signal_strength: signal_strength,
          is_read: false,
          is_handled: false,
          created_at: new Date().getTime() // 存储时间戳
        }
      });
      console.log('警报创建成功:', alertCreated);
      
      // 发送订阅消息
      try {
        console.log('开始发送订阅消息');
        console.log('OPENID:', wxContext.OPENID);
        
        // 发送订阅消息
        if (wxContext.OPENID) {
          try {
            await cloud.openapi.subscribeMessage.send({
              touser: wxContext.OPENID,
              templateId: 'RiS4r38VpZrqZNIcRx_T2pa4-PucRSgxitinkpmnJow', // 订阅消息模板ID
              page: 'pages/drone-alerts/drone-alerts',
              data: {
                thing1: {
                  value: location_name
                },
                thing2: {
                  value: `无人机信号检测 (${frequency} MHz, ${signal_strength} dBm)`
                },
                thing3: {
                  value: location_name
                },
                time4: {
                  value: formattedTime
                }
              }
            });
            console.log('订阅消息发送成功');
          } catch (err) {
            console.error('订阅消息发送失败:', err);
          }
        }
      } catch (err) {
        console.error('订阅消息发送失败:', err);
      }
    }

    return {
      success: true,
      data: {
        record_id: res._id,
        is_alert: isAlert,
        alert_id: alertCreated ? alertCreated._id : null,
        message: isAlert ? '检测到无人机信号，已发出警报' : '记录成功',
        detected_at: detectTime.getTime() // 返回时间戳供前端验证
      }
    };
  } catch (err) {
    console.error('记录失败:', err);
    return {
      success: false,
      error: err.message || '记录失败'
    };
  }
};