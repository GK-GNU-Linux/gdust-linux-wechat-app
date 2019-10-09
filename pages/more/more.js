//more.js
//获取应用实例
var app = getApp();
Page({
  data: {
    user: {}
  },
  onShow: function () {
    var _this = this;
    app.loginLoad().then(function () {
      _this.getData();
    })
  },
  getData: function () {
    var _this = this;
    _this.setData({ 
      'user': app.user,
      'is_library': app.cache.jy
    });
  },
  refreshSchedule: function() {
    wx.showToast({
      title: '刷新中',
      icon: 'loading',
      duration: 1500
    });
    app.wx_request("/school_sys/refresh_schedule", 'GET').then(
      function (res) {
        if (res.data && res.data.status === 200) {
          wx.hideLoading()
          wx.showToast({
            title: '刷新成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    ).catch(function (res) {
      app.showErrorModal(res.errMsg, '刷新失败');
    })
  }
});