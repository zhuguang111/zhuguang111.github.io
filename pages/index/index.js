Page({
  data: {
    stats: { totalLocations: 0, activeAlerts: 0, todayDetections: 0 },
    recentAlerts: []
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
    this.loadData(); 
  },
  async loadData() {
    const db = wx.cloud.database();
    const _ = db.command;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const todayStartTimestamp = todayStart.getTime();
    const todayEndTimestamp = todayEnd.getTime();
    
    console.log('当前时间:', now);
    console.log('今天开始时间:', todayStart);
    console.log('今天结束时间:', todayEnd);
    console.log('今天开始时间戳:', todayStartTimestamp);
    console.log('今天结束时间戳:', todayEndTimestamp);
    
    try {
      // 测试查询所有检测记录
      const allRecords = await db.collection('drone_detection').orderBy('detected_at', 'desc').limit(10).get();
      console.log('所有检测记录:', allRecords.data);
      
      // 测试查询今天的检测记录
      const todayRecords = await db.collection('drone_detection').where({
        detected_at: _.gte(todayStartTimestamp).and(_.lte(todayEndTimestamp))
      }).get();
      console.log('今天的检测记录:', todayRecords.data);
      console.log('今天的检测记录数量:', todayRecords.data.length);
      
      // 加载最近的10条警报，确保有足够的数据显示
      const [locRes, alertRes, recRes, recentRes] = await Promise.all([
        db.collection('detection_locations').where({ status: 'active', is_deleted: false }).count(),
        db.collection('alerts').where({ is_handled: false }).count(),
        db.collection('drone_detection').where({ 
          detected_at: _.gte(todayStartTimestamp).and(_.lte(todayEndTimestamp)) 
        }).count(),
        db.collection('alerts').orderBy('created_at', 'desc').limit(10).get()
      ]);
      
      console.log('今日检测查询条件:', { start: todayStartTimestamp, end: todayEndTimestamp });
      console.log('今日检测数量:', recRes.total);
      console.log('最近警报数据:', recentRes.data);
      
      const formattedAlerts = recentRes.data.map(item => {
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
      
      this.setData({
        stats: { totalLocations: locRes.total, activeAlerts: alertRes.total, todayDetections: recRes.total },
        recentAlerts: formattedAlerts
      });
      
      console.log('设置的最近警报数据:', this.data.recentAlerts);
    } catch (err) {
      console.error('加载数据失败:', err);
      // 发生错误时，确保 recentAlerts 是一个数组
      this.setData({ recentAlerts: [] });
    }
  },
  navigateToAlerts: function() {
    console.log('点击了查看全部');
    wx.switchTab({ 
      url: '/pages/drone-alerts/drone-alerts',
      success: function(res) {
        console.log('跳转到警报页面成功:', res);
        // 跳转到警报页面后，设置过滤器为"全部"
        const page = getCurrentPages().pop();
        if (page) {
          page.setData({ filterType: 'all' });
          page.loadAlerts();
        }
      },
      fail: function(err) {
        console.log('跳转到警报页面失败:', err);
      }
    });
  },
  navigateToRecords() { wx.navigateTo({url:'/pages/detection-records/detection-records'}); },
  navigateToLocations() { wx.navigateTo({url:'/pages/location-management/location-management'}); },
  navigateToAdmin() { wx.navigateTo({url:'/pages/admin/admin'}); }
});