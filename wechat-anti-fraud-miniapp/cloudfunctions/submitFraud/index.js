const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { fraudType, phone, amount, time, content, attachments } = event;

  try {
    const submitTime = new Date();
    const formattedTime = `${submitTime.getFullYear()}-${String(submitTime.getMonth() + 1).padStart(2, '0')}-${String(submitTime.getDate()).padStart(2, '0')} ${String(submitTime.getHours()).padStart(2, '0')}:${String(submitTime.getMinutes()).padStart(2, '0')}`;

    const res = await db.collection('fraud_reports').add({
      data: {
        _openid: wxContext.OPENID,
        fraudType: fraudType,
        phone: phone,
        amount: amount || '',
        time: time || '',
        content: content,
        attachments: attachments || [],
        status: 'pending',
        submitTime: formattedTime,
        createTime: submitTime
      }
    });

    return {
      success: true,
      _id: res._id
    };
  } catch (err) {
    console.error('提交失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
