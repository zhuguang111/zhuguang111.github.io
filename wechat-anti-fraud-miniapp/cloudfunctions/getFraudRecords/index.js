const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid } = event;

  try {
    const res = await db.collection('fraud_reports')
      .where({
        _openid: openid
      })
      .orderBy('createTime', 'desc')
      .get();

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
