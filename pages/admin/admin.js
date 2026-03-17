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
    console.log('检查登录状态');
    const adminInfo = wx.getStorageSync('adminInfo');
    console.log('存储的管理员信息:', adminInfo);
    if (adminInfo) {
      this.setData({
        isLoggedIn: true,
        adminName: adminInfo.username
      });
      console.log('已登录，显示管理界面');
    } else {
      this.setData({
        isLoggedIn: false,
        adminName: ''
      });
      console.log('未登录，显示登录界面');
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

      console.log('登录响应:', res);

      if (res.result && res.result.success) {
        wx.setStorageSync('adminInfo', { username: res.result.data.username });
        this.setData({
          isLoggedIn: true,
          adminName: res.result.data.username
        });
        
        // 申请订阅消息权限
        this.requestSubscribeMessage();
        
        wx.showToast({ title: '登录成功', icon: 'success' });
        // 延迟跳转，确保页面状态更新
        setTimeout(() => {
          wx.switchTab({ 
            url: '/pages/index/index',
            success: function(res) {
              console.log('跳转成功:', res);
            },
            fail: function(err) {
              console.log('跳转失败:', err);
            }
          });
        }, 500);
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
  },
  
  // 申请订阅消息权限
  requestSubscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: ['RiS4r38VpZrqZNIcRx_T2pa4-PucRSgxitinkpmnJow'], // 订阅消息模板ID
      success: (res) => {
        console.log('订阅消息申请成功:', res);
        if (res['RiS4r38VpZrqZNIcRx_T2pa4-PucRSgxitinkpmnJow'] === 'accept') {
          wx.setStorageSync('hasSubscribe', true);
        }
      },
      fail: (err) => {
        console.log('订阅消息申请失败:', err);
      }
    });
  }
});
