Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      this.login(e.detail);
    } else {
      wx.showToast({
        title: '需要授权才能使用',
        icon: 'none'
      });
    }
  },

  async login(userInfo) {
    wx.showLoading({
      title: '登录中...'
    });

    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          userInfo: userInfo
        }
      });

      if (res.result.success) {
        const userInfoData = {
          ...res.result.data,
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName
        };

        wx.setStorageSync('userInfo', userInfoData);
        wx.setStorageSync('openid', res.result.openid);

        this.setData({
          userInfo: userInfoData,
          hasUserInfo: true
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  navigateToSubmit() {
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/submit/submit'
    });
  }
});
