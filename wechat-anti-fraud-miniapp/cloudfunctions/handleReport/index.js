const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { id, action } = event;

  try {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const res = await db.collection('fraud_reports').doc(id).update({
      data: {
        status: newStatus,
        handleTime: new Date(),
        updateTime: new Date()
      }
    });

    return {
      success: true
    };
  } catch (err) {
    console.error('处理举报失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
