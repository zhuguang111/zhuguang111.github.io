Page({
  data: {
    stats: {
      totalLocations: 0,
      activeAlerts: 0,
      todayDetections: 0
    },
    recentAlerts: []
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      const [locationsRes, alertsRes, recordsRes] = await Promise.all([
        wx.cloud.callFunction({ name: 'getLocations' }),
        wx.cloud.callFunction({ name: 'getAlerts', data: { is_handled: false } }),
        wx.cloud.callFunction({ name: 'getDetectionRecords', data: { page: 1, page_size: 50 } })
      ]);

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const todayRecords = (recordsRes.result?.data?.records || []).filter(r => {
        const recordDate = new Date(r.detected_at).toISOString().split('T')[0];
        return recordDate === todayStr;
      });

      this.setData({
        stats: {
          totalLocations: locationsRes.result?.data?.length || 0,
          activeAlerts: alertsRes.result?.data?.unread_count || 0,
          todayDetections: todayRecords.length
        },
        recentAlerts: (alertsRes.result?.data?.alerts || []).slice(0, 5).map(item => {
          const time = new Date(item.created_at);
          return {
            ...item,
            formatted_time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
          };
        })
      });
    } catch (err) {
      console.error('加载数据失败:', err);
    }
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

  navigateToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  }
});
