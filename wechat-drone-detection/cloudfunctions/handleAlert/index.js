const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { alert_id, action } = event;

  if (!alert_id || !action) {
    return {
      success: false,
      error: '缺少必要参数'
    };
  }

  try {
    const alert = await db.collection('alerts').doc(alert_id).get();

    if (!alert.data) {
      return {
        success: false,
        error: '警报不存在'
      };
    }

    if (action === 'handle') {
      await db.collection('alerts').doc(alert_id).update({
        data: {
          is_handled: true,
          is_read: true,
          handled_at: new Date()
        }
      });

      await db.collection('drone_detection').doc(alert.data.detection_id).update({
        data: {
          alert_status: 'handled',
          handled_at: new Date()
        }
      });
    } else if (action === 'ignore') {
      await db.collection('alerts').doc(alert_id).update({
        data: {
          is_handled: true,
          is_read: true,
          handled_at: new Date()
        }
      });

      await db.collection('drone_detection').doc(alert.data.detection_id).update({
        data: {
          alert_status: 'ignored'
        }
      });
    } else if (action === 'read') {
      await db.collection('alerts').doc(alert_id).update({
        data: {
          is_read: true
        }
      });
    }

    return {
      success: true,
      message: '操作成功'
    };
  } catch (err) {
    console.error('操作失败:', err);
    return {
      success: false,
      error: err.message || '操作失败'
    };
  }
};
