Page({
  data: {
    alerts: [],
    unreadCount: 0,
    filterType: 'all',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },

  onShow() {
    this.loadAlerts();
  },

  switchFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      filterType: type,
      page: 1,
      alerts: []
    });
    this.loadAlerts();
  },

  async loadAlerts() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      let query = {};
      if (this.data.filterType === 'unread') {
        query.is_read = false;
      } else if (this.data.filterType === 'pending') {
        query.is_handled = false;
      }

      const res = await wx.cloud.callFunction({
        name: 'getAlerts',
        data: {
          ...query,
          page: this.data.page,
          page_size: this.data.pageSize
        }
      });

      if (res.result && res.result.success) {
        const newAlerts = this.data.page === 1
          ? res.result.data.alerts
          : [...this.data.alerts, ...res.result.data.alerts];

        const processedAlerts = newAlerts.map(item => {
          const time = new Date(item.created_at);
          return {
            ...item,
            formatted_time: `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
          };
        });

        this.setData({
          alerts: processedAlerts,
          unreadCount: res.result.data.unread_count,
          hasMore: processedAlerts.length < res.result.data.total
        });

        if (this.data.page === 1 && res.result.data.unread_count > 0) {
          this.playAlertSound();
        }
      }
    } catch (err) {
      console.error('加载警报失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  playAlertSound() {
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = '/assets/alert.mp3';
    audioContext.play();
  },

  loadMore() {
    this.setData({
      page: this.data.page + 1
    });
    this.loadAlerts();
  },

  async handleAlert(e) {
    const { id, action } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认操作',
      content: action === 'handle' ? '确认处理此警报?' : '确认忽略此警报?',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'handleAlert',
              data: {
                alert_id: id,
                action: action
              }
            });

            if (result.result && result.result.success) {
              wx.showToast({
                title: '操作成功',
                icon: 'success'
              });
              this.setData({ page: 1, alerts: [] });
              this.loadAlerts();
            }
          } catch (err) {
            console.error('操作失败:', err);
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});
