# 微信切换权限说明

## 为什么换微信后没有权限?

这是**正常的微信小程序机制**!

每个微信用户的登录是独立的:
- 用户A登录后,获得用户A的OpenID
- 切换到用户B,需要重新授权登录
- 用户的登录信息存储在各自的微信中

## 如何让所有用户都能登录?

**已经实现!** 所有用户都可以登录:

1. **打开小程序**
2. **勾选用户协议**
3. **点击"授权登录"**
4. **获取用户头像和昵称**

每个用户独立存储,互不干扰。

## 用户登录流程

### 首次登录
1. 用户打开小程序
2. 勾选"我已阅读并同意《用户协议与隐私政策》"
3. 点击"授权登录"按钮
4. 微信弹出授权对话框
5. 用户点击"允许"
6. 系统自动创建用户账号
7. 登录成功

### 再次登录
1. 用户打开小程序
2. 如果登录信息未过期,自动登录
3. 如果登录信息过期,需要重新授权

## 登录信息存储

### 本地存储
```javascript
// 存储用户信息
wx.setStorageSync('userInfo', userInfoData);

// 存储OpenID
wx.setStorageSync('openid', openid);
```

### 登录状态检查
```javascript
// 检查是否已登录
const userInfo = wx.getStorageSync('userInfo');
if (userInfo) {
  // 已登录
} else {
  // 未登录
}
```

## 切换微信账号

### 场景1: 在同一台手机切换微信账号
1. 退出当前微信账号
2. 登录新的微信账号
3. 打开小程序
4. **必须重新授权登录** (这是正常的)

### 场景2: 在不同设备登录
1. 在手机A登录用户A
2. 在手机B登录用户B
3. 两个用户独立,互不影响
4. 每个用户都需要授权登录

### 场景3: 在开发者工具切换微信
1. 清除缓存
2. 重新编译
3. 模拟不同用户登录

## 登录过期时间

### 微信登录有效期
- **access_token**: 2小时
- **refresh_token**: 30天
- 小程序会自动处理token刷新

### 本地存储有效期
- **userInfo**: 永久(除非手动清除)
- **openid**: 永久(除非手动清除)

建议:
- 每次打开小程序检查登录状态
- 如果登录失效,重新授权

## 用户权限说明

### 普通用户权限
- ✅ 登录小程序
- ✅ 查看首页信息
- ✅ 提交举报线索
- ✅ 查看自己的举报记录
- ✅ 上传证据(图片/视频/文件)

### 管理员权限
- ✅ 登录管理员后台
- ✅ 查看所有用户的举报记录
- ✅ 处理举报(通过/驳回)
- ✅ 查看附件
- ❌ 不能提交举报(使用管理员账号)

## 多用户并发测试

### 测试方法1: 使用多台设备
1. 在手机A使用用户A登录
2. 在手机B使用用户B登录
3. 在手机C使用用户C登录
4. 同时测试功能

### 测试方法2: 使用开发者工具
1. 打开微信开发者工具
2. 点击"真机调试"
3. 用多部手机扫描二维码
4. 每部手机都是独立用户

### 测试方法3: 清除缓存
1. 在开发者工具中点击"清缓存"
2. 选择"清除全部缓存"
3. 重新编译
4. 模拟新用户登录

## 常见问题

### Q1: 为什么每次都要重新登录?

A: 可能原因:
- 本地缓存被清除
- 登录信息过期
- 切换了微信账号

**解决**: 重新授权登录即可

### Q2: 两个用户能看到彼此的举报吗?

A: 不能!
- 普通用户只能看到自己的举报
- 管理员可以看到所有举报
- 这是隐私保护机制

### Q3: 如何查看有多少用户注册了?

A: 在云开发控制台:
1. 点击"数据库"
2. 选择"users"集合
3. 查看记录总数

### Q4: 管理员账号可以用普通微信登录吗?

A: 不行!
- 管理员后台需要单独登录
- 使用管理员用户名和密码
- 与普通用户登录是分开的

### Q5: 如何修改用户信息?

A: 目前版本:
- 用户头像和昵称从微信获取
- 用户登录时自动更新
- 暂不支持手动修改

### Q6: 登录失败怎么办?

A: 检查:
1. 网络连接是否正常
2. 云函数是否部署成功
3. 数据库集合是否创建
4. 是否勾选了用户协议

## 安全建议

### 1. 不要存储敏感信息
本地存储只存储:
- 用户基本信息(昵称、头像)
- OpenID
- 登录状态

### 2. 定期清理缓存
- 防止存储数据过大
- 保护用户隐私

### 3. 限制登录频率
- 防止恶意请求
- 保护服务器资源

### 4. 使用HTTPS
- 确保数据传输安全
- 防止中间人攻击

## 技术实现

### 用户登录云函数
```javascript
// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { userInfo } = event;

  // 检查用户是否存在
  const userRecord = await db.collection('users').where({
    _openid: wxContext.OPENID
  }).get();

  let userData;

  if (userRecord.data.length === 0) {
    // 新用户,创建账号
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
    // 老用户,更新信息
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
};
```

## 总结

1. **换微信后需要重新登录是正常的**
2. **所有用户都可以独立登录**
3. **每个用户的数据是隔离的**
4. **管理员和普通用户分开登录**

如果有任何问题,请查看:
- `ADMIN_GUIDE.md` - 管理员使用指南
- `TROUBLESHOOTING.md` - 故障排查指南
