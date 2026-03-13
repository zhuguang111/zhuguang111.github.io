const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { username, password } = event;

  try {
    // 简单的硬编码管理员账号(生产环境应该使用加密存储)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return {
        success: true,
        data: {
          username: username
        }
      };
    } else {
      return {
        success: false,
        error: '用户名或密码错误'
      };
    }
  } catch (err) {
    console.error('管理员登录失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
