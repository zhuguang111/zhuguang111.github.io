Page({
  data: {
    formData: {
      fraudType: '',
      phone: '',
      amount: '',
      time: '',
      content: '',
      attachments: []
    },
    fraudTypes: [
      '冒充公检法',
      '冒充客服',
      '中奖诈骗',
      '网络贷款',
      '投资理财',
      '刷单返利',
      '冒充亲友',
      '其他'
    ]
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }
  },

  onFraudTypeChange(e) {
    this.setData({
      'formData.fraudType': this.data.fraudTypes[e.detail.value]
    });
  },

  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  onAmountInput(e) {
    this.setData({
      'formData.amount': e.detail.value
    });
  },

  onTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
    });
  },

  onContentInput(e) {
    this.setData({
      'formData.content': e.detail.value
    });
  },

  chooseImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          'formData.attachments': tempFilePaths
        });
      }
    });
  },

  async submitForm() {
    const { fraudType, phone, content } = this.data.formData;

    if (!fraudType) {
      wx.showToast({
        title: '请选择诈骗类型',
        icon: 'none'
      });
      return;
    }

    if (!phone) {
      wx.showToast({
        title: '请输入涉事电话',
        icon: 'none'
      });
      return;
    }

    if (!content) {
      wx.showToast({
        title: '请输入详细描述',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...'
    });

    try {
      const fileInfo = this.data.formData.attachments.map(filePath => {
        return wx.cloud.uploadFile({
          cloudPath: `fraud/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
          filePath: filePath
        });
      });

      const uploadResults = await Promise.all(fileInfo);
      const fileIDs = uploadResults.map(res => res.fileID);

      const res = await wx.cloud.callFunction({
        name: 'submitFraud',
        data: {
          fraudType: this.data.formData.fraudType,
          phone: this.data.formData.phone,
          amount: this.data.formData.amount,
          time: this.data.formData.time,
          content: this.data.formData.content,
          attachments: fileIDs
        }
      });

      if (res.result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });

        this.setData({
          formData: {
            fraudType: '',
            phone: '',
            amount: '',
            time: '',
            content: '',
            attachments: []
          }
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/history/history'
          });
        }, 1500);
      }
    } catch (err) {
      console.error('提交失败:', err);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});
