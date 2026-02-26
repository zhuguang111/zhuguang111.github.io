Page({
  data: {
    content: ''
  },

  onLoad() {
    this.loadAgreement();
  },

  loadAgreement() {
    wx.request({
      url: 'https://raw.githubusercontent.com/zhuguang111/zhuguang111.github.io/main/wechat-anti-fraud-miniapp/pages/agreement/agreement.md',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            content: res.data
          });
        }
      },
      fail: () => {
        this.setData({
          content: '加载失败,请稍后重试'
        });
      }
    });
  }
});
