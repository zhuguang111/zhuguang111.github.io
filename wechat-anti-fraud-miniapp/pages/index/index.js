Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    agreedToTerms: false
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
      if (!this.data.agreedToTerms) {
        wx.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        });
        return;
      }
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
      console.log('开始登录, userInfo:', userInfo);

      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          userInfo: userInfo
        }
      });

      console.log('云函数返回结果:', res);

      if (res.result && res.result.success) {
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
      } else {
        throw new Error('登录失败: ' + JSON.stringify(res.result));
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: '登录失败,请重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
    }
  },

  navigateToAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    });
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
  },

  onAgreementChange(e) {
    this.setData({
      agreedToTerms: e.detail.value.length > 0
    });
  }
});
