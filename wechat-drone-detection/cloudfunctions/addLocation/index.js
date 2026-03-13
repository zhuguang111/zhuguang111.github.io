const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { location_id, location_name, location_desc, frequency_min, frequency_max, threshold } = event;

  if (!location_id || !location_name || frequency_min === undefined || frequency_max === undefined || threshold === undefined) {
    return {
      success: false,
      error: '缺少必要参数'
    };
  }

  try {
    const check = await db.collection('detection_locations').where({
      location_id: location_id
    }).get();

    if (check.data.length > 0) {
      return {
        success: false,
        error: '监测点ID已存在'
      };
    }

    const res = await db.collection('detection_locations').add({
      data: {
        location_id: location_id,
        location_name: location_name,
        location_desc: location_desc || '',
        frequency_min: frequency_min,
        frequency_max: frequency_max,
        threshold: threshold,
        status: 'active',
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return {
      success: true,
      data: {
        location_id: res._id
      }
    };
  } catch (err) {
    console.error('添加失败:', err);
    return {
      success: false,
      error: err.message || '添加失败'
    };
  }
};
