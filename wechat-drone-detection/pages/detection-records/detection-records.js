Page({
  data: {
    records: [],
    locations: [],
    selectedLocationId: '',
    selectedLocationName: '',
    selectedDate: '',
    today: '',
    filterDrone: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },

  onLoad() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({ today });
    this.loadLocations();
    this.loadRecords();
  },

  async loadLocations() {
    try {
      const res = await wx.cloud.callFunction({ name: 'getLocations' });
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
      const query = {
        page: this.data.page,
        page_size: this.data.pageSize
      };

      if (this.data.selectedLocationId) {
        query.location_id = this.data.selectedLocationId;
      }

      if (this.data.selectedDate) {
        query.start_date = this.data.selectedDate;
        query.end_date = this.data.selectedDate;
      }

      if (this.data.filterDrone !== '') {
        query.is_drone = this.data.filterDrone === 'true';
      }

      const res = await wx.cloud.callFunction({
        name: 'getDetectionRecords',
        data: query
      });

      if (res.result && res.result.success) {
        const newRecords = this.data.page === 1
          ? res.result.data.records
          : [...this.data.records, ...res.result.data.records];

        const processedRecords = newRecords.map(item => {
          const time = new Date(item.detected_at);
          return {
            ...item,
            formatted_time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
          };
        });

        this.setData({
          records: processedRecords,
          hasMore: processedRecords.length < res.result.data.total
        });
      }
    } catch (err) {
      console.error('加载记录失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onLocationChange(e) {
    const index = e.detail.value;
    const location = this.data.locations[index];
    this.setData({
      selectedLocationId: location.location_id,
      selectedLocationName: location.location_id ? location.location_name : '',
      page: 1,
      records: []
    });
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

  switchFilter(e) {
    const drone = e.currentTarget.dataset.drone;
    this.setData({
      filterDrone: drone,
      page: 1,
      records: []
    });
    this.loadRecords();
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 });
    this.loadRecords();
  }
});
