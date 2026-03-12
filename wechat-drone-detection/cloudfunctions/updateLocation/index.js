const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { location_id, location_name, location_desc, frequency_min, frequency_max, threshold, status } = event;

  if (!location_id) {
    return {
      success: false,
      error: '缺少必要参数：location_id'
    };
  }

  try {
    const check = await db.collection('detection_locations').where({
      location_id: location_id
    }).get();

    if (check.data.length === 0) {
      return {
        success: false,
        error: '监测点不存在'
      };
    }

    const updateData = {
      updated_at: new Date()
    };

    if (location_name !== undefined) updateData.location_name = location_name;
    if (location_desc !== undefined) updateData.location_desc = location_desc;
    if (frequency_min !== undefined) updateData.frequency_min = frequency_min;
    if (frequency_max !== undefined) updateData.frequency_max = frequency_max;
    if (threshold !== undefined) updateData.threshold = threshold;
    if (status !== undefined) updateData.status = status;

    await db.collection('detection_locations').where({
      location_id: location_id
    }).update({
      data: updateData
    });

    return {
      success: true
    };
  } catch (err) {
    console.error('更新失败:', err);
    return {
      success: false,
      error: err.message || '更新失败'
    };
  }
};
