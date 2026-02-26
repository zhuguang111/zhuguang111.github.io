Page({
  data: {
    isLoggedIn: false,
    adminName: '',
    reports: [],
    filterStatus: 'all',
    loading: false,
    username: '',
    password: ''
  },

  onLoad() {
    this.checkLoginStatus();
  },
    this.checkLoginStatus();
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  async login() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...'
    });

    try {
      const res = await wx.cloud.callFunction({
        name: 'adminLogin',
        data: {
          username: username,
          password: password
        }
      });

      if (res.result.success) {
        wx.setStorageSync('adminInfo', {
          username: res.result.data.username
        });

        this.setData({
          isLoggedIn: true,
          adminName: res.result.data.username,
          username: '',
          password: ''
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        this.loadReports();
      } else {
        wx.showToast({
          title: res.result.error || '登录失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
    const adminInfo = wx.getStorageSync('adminInfo');
    if (adminInfo) {
      this.setData({
        isLoggedIn: true,
        adminName: adminInfo.username
      });
      this.loadReports();
    }
  },

  onFilterChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      filterStatus: status
    });
    this.loadReports();
  },

  async loadReports() {
    this.setData({
      loading: true
    });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getAdminReports',
        data: {
          status: this.data.filterStatus === 'all' ? '' : this.data.filterStatus
        }
      });

      if (res.result.success) {
        this.setData({
          reports: res.result.data
        });
      }
    } catch (err) {
      console.error('加载举报记录失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  async handleReport(e) {
    const { id, action } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认操作',
      content: action === 'approve' ? '确认通过此举报?' : '确认驳回此举报?',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'handleReport',
              data: {
                id: id,
                action: action
              }
            });

            if (result.result.success) {
              wx.showToast({
                title: '操作成功',
                icon: 'success'
              });
              this.loadReports();
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
  },

  viewDetail(e) {
    const { report } = e.currentTarget.dataset;
    wx.showModal({
      title: '举报详情',
      content: `类型: ${report.fraudType}\n电话: ${report.phone}\n金额: ${report.amount}\n时间: ${report.time}\n描述: ${report.content}`,
      showCancel: false
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出管理员账号?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminInfo');
          this.setData({
            isLoggedIn: false,
            adminName: '',
            reports: []
          });
        }
      }
    });
  }
});
