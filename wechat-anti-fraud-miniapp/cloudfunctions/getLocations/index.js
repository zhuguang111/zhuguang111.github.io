const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  try {
    const locations = await db.collection('locations')
      .orderBy('created_at', 'desc')
      .get();

    return {
      success: true,
      data: locations.data
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      error: err.message || '查询失败'
    };
  }
};
