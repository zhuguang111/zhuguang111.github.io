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
    const detectTime = timestamp ? new Date(timestamp) : new Date();
    const formattedTime = `${detectTime.getFullYear()}-${String(detectTime.getMonth() + 1).padStart(2, '0')}-${String(detectTime.getDate()).padStart(2, '0')} ${String(detectTime.getHours()).padStart(2, '0')}:${String(detectTime.getMinutes()).padStart(2, '0')}`;

    const locationCheck = await db.collection('detection_locations').where({
      location_id: location_id,
      status: 'active',
      is_deleted: false
    }).get();

    if (locationCheck.data.length === 0) {
      return {
        success: false,
        error: '监测点不存在或已停用'
      };
    }

    const location = locationCheck.data[0];
    let alertStatus = 'pending';
    let isAlert = false;

    if (is_drone && signal_strength >= location.threshold) {
      alertStatus = 'pending';
      isAlert = true;
    }

    const res = await db.collection('drone_detection').add({
      data: {
        location_id: location_id,
        location_name: location_name,
        frequency: frequency,
        signal_strength: signal_strength,
        is_drone: is_drone || false,
        alert_status: alertStatus,
        detected_at: detectTime,
        formatted_time: formattedTime,
        created_at: new Date()
      }
    });

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
          created_at: new Date()
        }
      });
    }

    return {
      success: true,
      data: {
        record_id: res._id,
        is_alert: isAlert,
        alert_id: alertCreated ? alertCreated._id : null,
        message: isAlert ? '检测到无人机信号，已发出警报' : '记录成功'
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
