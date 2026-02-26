Page({
  data: {
    formData: {
      fraudType: '',
      phone: '',
      amount: '',
      time: '',
      content: '',
      attachments: [],
      videos: [],
      files: []
    },
    fraudTypes: [
      '冒充公检法',
      '冒充客服',
      '中奖诈骗',
      '网络贷款',
      '投资理财',
      '刷单返利',
      '冒充亲友',
      '杀猪盘'
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
    const currentCount = this.data.formData.attachments.length;
    if (currentCount >= 8) {
      wx.showToast({
        title: '最多上传8张图片',
        icon: 'none'
      });
      return;
    }
    wx.chooseImage({
      count: 8 - currentCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          'formData.attachments': [...this.data.formData.attachments, ...tempFilePaths]
        });
      }
    });
  },

  chooseVideo() {
    const currentCount = this.data.formData.videos.length;
    if (currentCount >= 1) {
      wx.showToast({
        title: '最多上传1个视频',
        icon: 'none'
      });
      return;
    }
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        this.setData({
          'formData.videos': [...this.data.formData.videos, res.tempFilePath]
        });
      }
    });
  },

  chooseFile() {
    const currentCount = this.data.formData.files.length;
    if (currentCount >= 2) {
      wx.showToast({
        title: '最多上传2个文件',
        icon: 'none'
      });
      return;
    }
    wx.chooseMessageFile({
      count: 2 - currentCount,
      type: 'file',
      extension: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      success: (res) => {
        const tempFiles = res.tempFiles;
        this.setData({
          'formData.files': [...this.data.formData.files, ...tempFiles]
        });
      }
    });
  },

  removeAttachment(e) {
    const { type, index } = e.currentTarget.dataset;
    if (type === 'image') {
      const attachments = [...this.data.formData.attachments];
      attachments.splice(index, 1);
      this.setData({
        'formData.attachments': attachments
      });
    } else if (type === 'video') {
      const videos = [...this.data.formData.videos];
      videos.splice(index, 1);
      this.setData({
        'formData.videos': videos
      });
    } else if (type === 'file') {
      const files = [...this.data.formData.files];
      files.splice(index, 1);
      this.setData({
        'formData.files': files
      });
    }
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
      // 上传图片
      const imageUploads = this.data.formData.attachments.map(filePath => {
        return wx.cloud.uploadFile({
          cloudPath: `fraud/images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
          filePath: filePath
        });
      });

      // 上传视频
      const videoUploads = this.data.formData.videos.map(filePath => {
        const ext = filePath.split('.').pop();
        return wx.cloud.uploadFile({
          cloudPath: `fraud/videos/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`,
          filePath: filePath
        });
      });

      // 上传文件
      const fileUploads = this.data.formData.files.map(file => {
        const ext = file.name.split('.').pop();
        return wx.cloud.uploadFile({
          cloudPath: `fraud/files/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`,
          filePath: file.path
        });
      });

      const uploadResults = await Promise.all([...imageUploads, ...videoUploads, ...fileUploads]);
      const fileIDs = uploadResults.map(res => res.fileID);

      const res = await wx.cloud.callFunction({
        name: 'submitFraud',
        data: {
          fraudType: this.data.formData.fraudType,
          phone: this.data.formData.phone,
          amount: this.data.formData.amount,
          time: this.data.formData.time,
          content: this.data.formData.content,
          attachments: fileIDs,
          hasImages: this.data.formData.attachments.length > 0,
          hasVideos: this.data.formData.videos.length > 0,
          hasFiles: this.data.formData.files.length > 0
        }
      });

      if (res.result.success) {
        wx.showToast({
          title: '线索提交成功',
          icon: 'success'
        });

        this.setData({
          formData: {
            fraudType: '',
            phone: '',
            amount: '',
            time: '',
            content: '',
            attachments: [],
            videos: [],
            files: []
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
        title: '提交失败,请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});
