Page({
  data: {
    stats: { totalLocations: 0, activeAlerts: 0, todayDetections: 0 },
    recentAlerts: []
  },
  onShow() { this.loadData(); },
  async loadData() {
    const db = wx.cloud.database();
    const _ = db.command;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    try {
      const [locRes, alertRes, recRes, recentRes] = await Promise.all([
        db.collection('detection_locations').where({ status: 'active', is_deleted: false }).count(),
        db.collection('alerts').where({ is_handled: false }).count(),
        db.collection('drone_detection').where({ detected_at: _.gte(todayStart) }).count(),
        db.collection('alerts').orderBy('created_at', 'desc').limit(5).get()
      ]);
      this.setData({
        stats: { totalLocations: locRes.total, activeAlerts: alertRes.total, todayDetections: recRes.total },
        recentAlerts: recentRes.data.map(item => ({...item, formatted_time: `${String(new Date(item.created_at).getHours()).padStart(2,'0')}:${String(new Date(item.created_at).getMinutes()).padStart(2,'0')}`}))
      });
    } catch (err) { console.error('加载数据失败:', err); }
  },
  navigateToAlerts() { wx.navigateTo({url:'/pages/drone-alerts/drone-alerts'}); },
  navigateToRecords() { wx.navigateTo({url:'/pages/detection-records/detection-records'}); },
  navigateToLocations() { wx.navigateTo({url:'/pages/location-management/location-management'}); }
});
