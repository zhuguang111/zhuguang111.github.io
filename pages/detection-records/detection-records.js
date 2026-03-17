Page({
  data: {
    records: [],
    locations: [],
    selectedLocationId: '',
    selectedLocationName: '全部',
    selectedDate: '',
    today: new Date().toISOString().split('T')[0],
    filterDrone: '',
    page: 1,
    hasMore: true,
    loading: false
  },
  
  onLoad() {
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
    this.loadLocations();
    // 加载全部记录，不设置日期筛选
    this.setData({ selectedDate: '', filterDrone: '' });
    this.loadRecords();
  },
  
  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      selectedDate: date,
      page: 1,
      records: []
    });
    this.loadRecords();
  },
  
  async loadLocations() {
    const db = wx.cloud.database();
    const res = await db.collection('detection_locations').where({ status: 'active', is_deleted: false }).get();
    this.setData({ locations: [{ location_id: '', location_name: '全部' }, ...res.data] });
  },
  
  async loadRecords() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const db = wx.cloud.database();
    const _ = db.command;
    let query = {};
    if (this.data.selectedLocationId) query.location_id = this.data.selectedLocationId;
    if (this.data.filterDrone !== '') query.is_drone = this.data.filterDrone === 'true';
    if (this.data.selectedDate) {
      const date = new Date(this.data.selectedDate);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      const startOfDayTimestamp = startOfDay.getTime();
      const endOfDayTimestamp = endOfDay.getTime();
      query.detected_at = _.gte(startOfDayTimestamp).and(_.lte(endOfDayTimestamp));
      console.log('日期筛选:', this.data.selectedDate);
      console.log('查询时间范围:', { start: startOfDayTimestamp, end: endOfDayTimestamp });
    }
    console.log('查询条件:', query);
    try {
      const res = await db.collection('drone_detection').where(query).orderBy('detected_at', 'desc').get();
      console.log('查询结果:', res.data);
      // 处理时间格式化
      const formattedRecords = res.data.map(item => {
        let detectedAt = item.detected_at;
        // 如果 detected_at 是字符串，尝试转换为数字
        if (typeof detectedAt === 'string') {
          detectedAt = parseInt(detectedAt, 10);
        }
        if (detectedAt && !isNaN(detectedAt)) {
          const date = new Date(detectedAt);
          item.formatted_time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          item.formatted_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          console.log('记录时间:', detectedAt, '->', item.formatted_time, '日期:', item.formatted_date);
        } else {
          // 如果没有时间，使用当前时间
          const now = new Date();
          item.formatted_time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          item.formatted_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          console.log('记录无有效时间，使用当前时间:', item.formatted_time);
        }
        return item;
      });
      this.setData({ records: formattedRecords, hasMore: false, loading: false });
      console.log('设置的记录数据:', this.data.records);
    } catch (err) {
      console.error('加载记录失败:', err);
      this.setData({ records: [], hasMore: false, loading: false });
    }
  },
  
  onLocationChange(e) {
    const loc = this.data.locations[e.detail.value];
    this.setData({
      selectedLocationId: loc.location_id,
      selectedLocationName: loc.location_name,
      page: 1,
      records: []
    });
    this.loadRecords();
  },
  
  switchFilter(e) {
    this.setData({ filterDrone: e.currentTarget.dataset.drone, page: 1, records: [] });
    this.loadRecords();
  }
});