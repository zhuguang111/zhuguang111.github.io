const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { userInfo } = event;

  try {
    const userRecord = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get();

    let userData;

    if (userRecord.data.length === 0) {
      const createRes = await db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          createTime: new Date(),
          updateTime: new Date()
        }
      });

      userData = {
        _id: createRes._id,
        _openid: wxContext.OPENID,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      };
    } else {
      userData = userRecord.data[0];

      await db.collection('users').doc(userData._id).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          updateTime: new Date()
        }
      });
    }

    return {
      success: true,
      openid: wxContext.OPENID,
      data: userData
    };
  } catch (err) {
    console.error('登录失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
