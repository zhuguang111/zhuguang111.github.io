Page({
  data: {
    locations: [],
    loading: false,
    showModal: false,
    isEdit: false,
    form: {
      location_id: '',
      location_name: '',
      location_desc: '',
      frequency_min: '',
      frequency_max: '',
      threshold: ''
    }
  },

  onShow() {
    this.loadLocations();
  },

  async loadLocations() {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({ name: 'getLocations' });
      if (res.result && res.result.success) {
        this.setData({ locations: res.result.data });
      }
    } catch (err) {
      console.error('加载失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      form: {
        location_id: '',
        location_name: '',
        location_desc: '',
        frequency_min: '',
        frequency_max: '',
        threshold: ''
      }
    });
  },

  showEditModal(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showModal: true,
      isEdit: true,
      form: {
        location_id: item.location_id,
        location_name: item.location_name,
        location_desc: item.location_desc || '',
        frequency_min: item.frequency_min,
        frequency_max: item.frequency_max,
        threshold: item.threshold
      }
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`form.${field}`]: value
    });
  },

  async submitForm() {
    const { form, isEdit } = this.data;

    if (!form.location_id || !form.location_name || !form.frequency_min || !form.frequency_max || !form.threshold) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      const funcName = isEdit ? 'updateLocation' : 'addLocation';
      const res = await wx.cloud.callFunction({
        name: funcName,
        data: form
      });

      if (res.result && res.result.success) {
        wx.showToast({ title: '成功', icon: 'success' });
        this.hideModal();
        this.loadLocations();
      } else {
        wx.showToast({ title: res.result.error || '失败', icon: 'none' });
      }
    } catch (err) {
      console.error('操作失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteLocation(e) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除该监测点吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'deleteLocation',
              data: { location_id: id }
            });

            if (result.result && result.result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadLocations();
            }
          } catch (err) {
            console.error('删除失败:', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
