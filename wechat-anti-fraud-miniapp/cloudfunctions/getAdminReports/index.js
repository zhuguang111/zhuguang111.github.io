const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { status } = event;

  try {
    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }

    const res = await db.collection('fraud_reports')
      .where(whereCondition)
      .orderBy('createTime', 'desc')
      .get();

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error('查询举报记录失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
