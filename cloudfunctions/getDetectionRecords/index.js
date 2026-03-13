const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { location_id, start_date, end_date, is_drone, page = 1, page_size = 20 } = event;

  try {
    let query = {};

    if (location_id) {
      query.location_id = location_id;
    }

    if (is_drone !== undefined && is_drone !== '') {
      query.is_drone = is_drone;
    }

    if (start_date || end_date) {
      query.detected_at = {};
      if (start_date) {
        query.detected_at.$gte = new Date(start_date + ' 00:00:00');
      }
      if (end_date) {
        query.detected_at.$lte = new Date(end_date + ' 23:59:59');
      }
    }

    const skip = (page - 1) * page_size;

    const countResult = await db.collection('drone_detection').where(query).count();
    const total = countResult.total;

    const records = await db.collection('drone_detection')
      .where(query)
      .orderBy('detected_at', 'desc')
      .skip(skip)
      .limit(page_size)
      .get();

    return {
      success: true,
      data: {
        records: records.data,
        total: total,
        page: page,
        page_size: page_size,
        total_pages: Math.ceil(total / page_size)
      }
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      error: err.message || '查询失败'
    };
  }
};
