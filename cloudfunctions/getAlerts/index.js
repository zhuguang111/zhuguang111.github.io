const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { is_read, is_handled, page = 1, page_size = 20 } = event;

  try {
    let query = {};

    if (is_read !== undefined && is_read !== '') {
      query.is_read = is_read;
    }

    if (is_handled !== undefined && is_handled !== '') {
      query.is_handled = is_handled;
    }

    const skip = (page - 1) * page_size;

    const countResult = await db.collection('alerts').where(query).count();
    const total = countResult.total;

    const unreadCountResult = await db.collection('alerts').where({ is_read: false }).count();
    const unread_count = unreadCountResult.total;

    const alerts = await db.collection('alerts')
      .where(query)
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(page_size)
      .get();

    return {
      success: true,
      data: {
        alerts: alerts.data,
        unread_count: unread_count,
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
