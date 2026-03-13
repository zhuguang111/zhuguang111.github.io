App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'zhuguang-1gctmq3g17561f0c',
        traceUser: true,
      });
    }
    this.globalData = {};
  }
});
