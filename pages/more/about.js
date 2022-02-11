//about.js
//获取应用实例
var app = getApp();
Page({
  data: {
    version: '',
    showLog: false
  },
  onLoad: function () {
    this.setData({
      version: app.version,
      year: new Date().getFullYear()
    });
  },
  onShareAppMessage: function () {
    return {
      title: 'e广科',
      desc: '分享你的大学生活',
      path: '/pages/more/about'
    }
  },
  toggleLog: function () {
    this.setData({
      showLog: !this.data.showLog
    });
  }
});