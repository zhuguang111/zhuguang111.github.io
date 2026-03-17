
Page({
  data: { 
    alerts: [], 
    filterType: 'all', 
    page: 1, 
    hasMore: true, 
    loading: false,
    lastAlertCount: 0
  },
  onLoad(options) {
    // 从其他页面跳转过来时，检查是否需要设置默认过滤器
    if (options && options.filter) {
      this.setData({ filterType: options.filter });
    }
  },
  onShow() { 
    const adminInfo = wx.getStorageSync('adminInfo');
    if (!adminInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.navigateTo({ url: '/pages/admin/admin' });
        }
      });
      return;
    }
    this.updateHandledAlerts();
    this.loadAlerts();
    // 启动警报监测定时器
    this.startAlertMonitor();
    // 立即检查一次新警报
    this.checkForNewAlerts();
  },
  onHide() {
    // 页面隐藏时停止监测
    this.stopAlertMonitor();
  },
  onUnload() {
    // 页面卸载时停止监测
    this.stopAlertMonitor();
  },
  startAlertMonitor() {
    // 每10秒检查一次新警报，提高检测频率
    this.alertMonitorTimer = setInterval(() => {
      this.checkForNewAlerts();
    }, 10000);
  },
  stopAlertMonitor() {
    if (this.alertMonitorTimer) {
      clearInterval(this.alertMonitorTimer);
      this.alertMonitorTimer = null;
    }
  },
  async checkForNewAlerts() {
    const db = wx.cloud.database();
    try {
      const res = await db.collection('alerts').where({
        is_read: false
      }).count();
      
      const currentAlertCount = res.total;
      if (currentAlertCount > this.data.lastAlertCount && currentAlertCount > 0) {
        // 有新警报，触发提醒
        this.triggerAlertNotification();
      }
      this.setData({ lastAlertCount: currentAlertCount });
    } catch (err) {
      console.error('检查新警报失败:', err);
    }
  },
  triggerAlertNotification() {
    console.log('触发警报提醒');
    
    // 显示通知
    wx.showModal({
      title: '🚨 新警报',
      content: '检测到新的无人机信号！\n请及时处理！',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          // 点击确定后刷新警报列表
          this.loadAlerts();
        }
      }
    });
  },
  async updateHandledAlerts() {
    // 更新所有已处理但未读的警报
    const db = wx.cloud.database();
    try {
      const res = await db.collection('alerts').where({
        is_handled: true,
        is_read: false
      }).get();
      
      if (res.data.length > 0) {
        for (const alert of res.data) {
          await db.collection('alerts').doc(alert._id).update({
            data: { is_read: true }
          });
        }
      }
    } catch (err) {
      console.error('更新警报状态失败:', err);
    }
  },
  switchFilter(e) { this.setData({filterType:e.currentTarget.dataset.type,page:1,alerts:[]}); this.loadAlerts(); },
  async loadAlerts() {
    if(this.data.loading)return;
    this.setData({loading:true});
    const db=wx.cloud.database();
    let query={};
    if(this.data.filterType==='handled')query.is_handled=true;
    else if(this.data.filterType==='pending')query.is_handled=false;
    const res=await db.collection('alerts').where(query).orderBy('created_at','desc').get();
    // 处理时间格式化
    const formattedAlerts = res.data.map(item => {
      let createdAt = item.created_at;
      if (typeof createdAt === 'string') {
        createdAt = parseInt(createdAt, 10);
      }
      if (createdAt && !isNaN(createdAt)) {
        const date = new Date(createdAt);
        item.formatted_time = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
        item.formatted_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      } else {
        const now = new Date();
        item.formatted_time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        item.formatted_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      }
      return item;
    });
    this.setData({alerts:formattedAlerts,hasMore:false,loading:false});
    // 更新最后警报数量
    this.setData({ lastAlertCount: formattedAlerts.length });
  },
  async handleAlert(e){
    const{id,action}=e.currentTarget.dataset;
    const db=wx.cloud.database();
    wx.showModal({title:'确认',content:'确认操作?',success:async(r)=>{
      if(r.confirm){
        // 无论是处理还是忽略，都将 is_handled 和 is_read 都设置为 true
        await db.collection('alerts').doc(id).update({data:{is_handled:true, is_read:true}});
        wx.showToast({title:'成功'});
        this.loadAlerts();
      }
    }});
  }
});