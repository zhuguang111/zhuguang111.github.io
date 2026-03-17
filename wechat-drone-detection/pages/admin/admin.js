Page({
  data: {
    isLoggedIn: false,
    adminName: '',
    username: '',
    password: ''
  },

  onLoad() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const adminInfo = wx.getStorageSync('adminInfo');
    if (adminInfo) {
      this.setData({
        isLoggedIn: true,
        adminName: adminInfo.username
      });
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async login() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'adminLogin',
        data: { username, password }
      });

      if (res.result && res.result.success) {
        wx.setStorageSync('adminInfo', { username: res.result.data.username });
        this.setData({
          isLoggedIn: true,
          adminName: res.result.data.username,
          username: '',
          password: ''
        });
        wx.showToast({ title: '登录成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.result.error || '登录失败', icon: 'none' });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminInfo');
          this.setData({ isLoggedIn: false, adminName: '' });
        }
      }
    });
  },

  navigateToAlerts() {
    wx.navigateTo({ url: '/pages/drone-alerts/drone-alerts' });
  },

  navigateToRecords() {
    wx.navigateTo({ url: '/pages/detection-records/detection-records' });
  },

  navigateToLocations() {
    wx.navigateTo({ url: '/pages/location-management/location-management' });
  }
});
