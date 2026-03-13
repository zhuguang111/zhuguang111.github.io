Page({
  data: {
    currentTab: 'records',
    selectedDate: '',
    today: '',
    selectedLocationId: '',
    selectedLocationName: '',
    locations: [],
    records: [],
    statistics: [],
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    loading: false
  },

  onLoad() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({
      selectedDate: today,
      today: today
    });
    this.loadLocations();
    this.loadRecords();
  },

  onShow() {
    if (this.data.currentTab === 'statistics') {
      this.loadStatistics();
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      page: 1,
      records: [],
      statistics: []
    });

    if (tab === 'records') {
      this.loadRecords();
    } else {
      this.loadStatistics();
    }
  },

  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      selectedDate: date,
      page: 1,
      records: [],
      statistics: []
    });

    if (this.data.currentTab === 'records') {
      this.loadRecords();
    } else {
      this.loadStatistics();
    }
  },

  onLocationChange(e) {
    const index = e.detail.value;
    if (index == 0) {
      this.setData({
        selectedLocationId: '',
        selectedLocationName: '',
        page: 1,
        records: [],
        statistics: []
      });
    } else {
      const location = this.data.locations[index];
      this.setData({
        selectedLocationId: location.location_id,
        selectedLocationName: location.location_name,
        page: 1,
        records: [],
        statistics: []
      });
    }

    if (this.data.currentTab === 'records') {
      this.loadRecords();
    } else {
      this.loadStatistics();
    }
  },

  async loadLocations() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getLocations'
      });

      if (res.result && res.result.success) {
        this.setData({
          locations: [{ location_id: '', location_name: '全部' }, ...res.result.data]
        });
      }
    } catch (err) {
      console.error('加载监测点失败:', err);
    }
  },

  async loadRecords() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getLocationRecords',
        data: {
          location_id: this.data.selectedLocationId,
          start_date: this.data.selectedDate,
          end_date: this.data.selectedDate,
          page: this.data.page,
          page_size: this.data.pageSize
        }
      });

      if (res.result && res.result.success) {
        const newRecords = this.data.page === 1 
          ? res.result.data.records 
          : [...this.data.records, ...res.result.data.records];

        this.setData({
          records: newRecords,
          total: res.result.data.total,
          hasMore: newRecords.length < res.result.data.total
        });
      }
    } catch (err) {
      console.error('加载记录失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  loadMore() {
    this.setData({
      page: this.data.page + 1
    });
    this.loadRecords();
  },

  async loadStatistics() {
    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getHourlyStatistics',
        data: {
          location_id: this.data.selectedLocationId,
          date: this.data.selectedDate
        }
      });

      if (res.result && res.result.success) {
        this.setData({
          statistics: res.result.data.statistics
        });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url]
    });
  }
});
