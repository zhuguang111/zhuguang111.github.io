Page({
  data: {
    records: [],
    loading: false
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  async loadRecords() {
    this.setData({
      loading: true
    });

    try {
      const openid = wx.getStorageSync('openid');
      if (!openid) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      const res = await wx.cloud.callFunction({
        name: 'getFraudRecords',
        data: {
          openid: openid
        }
      });

      if (res.result.success) {
        this.setData({
          records: res.result.data
        });
      }
    } catch (err) {
      console.error('加载记录失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  onPullDownRefresh() {
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
