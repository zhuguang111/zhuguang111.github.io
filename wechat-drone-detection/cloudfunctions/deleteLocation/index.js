const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { location_id } = event;

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

    await db.collection('detection_locations').where({
      location_id: location_id
    }).update({
      data: {
        is_deleted: true,
        status: 'inactive',
        updated_at: new Date()
      }
    });

    return {
      success: true
    };
  } catch (err) {
    console.error('删除失败:', err);
    return {
      success: false,
      error: err.message || '删除失败'
    };
  }
};
