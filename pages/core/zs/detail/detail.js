//detail.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    xfData: [], // 书籍数据
    listAnimation: {}, // 列表动画
    book_url: ''
  },
  //分享
  onShareAppMessage: function () {
    return {
      title: this.data.book_name + ' - 书籍详情 - 莞香小喵',
      desc: '广东科技学院唯一的小程序',
      path: '/pages/index/index?r=/pages/core/zs/detail/detail|url:' + this.data.book_url
    };
  },
  // 页面加载
  onLoad: function (options) {
    var _this = this;
    //判断并读取缓存
    _this.data.book_url = options.url;
    //if (app.cache.zs) { xfRender(app.cache.zs); }
    function zsRender(info) {
      // 为每一本书设置是否显示当前数据详情的标志open, false表示不显示
      var list = info.rows;
      for (var i = 0, len = list.length; i < len; ++i) {
        list[i].open = false;
      }
      list[0].open = true;
      _this.setData({
        remind: '',
        book_name: info.book_name,
        xfData: list,
        catalog: info.catalog
      });
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: "https://library.gxgk.cc/library/book_detail",
      method: 'GET',
      data: {
        url: options.url
      },
      success: function (res) {
        if (res.data && res.data.code === 200) {
          var info = res.data.data;
          if (info) {
            zsRender(info);
          } else { _this.setData({ remind: '暂无数据' }); }

        } else {
          app.removeCache('zs');
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }

      },
      fail: function (res) {
        if (_this.data.remind == '加载中') {
          _this.setData({
            remind: '网络错误'
          });
        }
        console.warn('网络错误');
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  },

  // 展示书籍详情
  slideDetail: function (e) {

    var id = e.currentTarget.id,
      list = this.data.xfData;

    // 每次点击都将当前open换为相反的状态并更新到视图，视图根据open的值来切换css
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].access_num == id) {
        list[i].open = !list[i].open;
      } else {
        list[i].open = false;
      }
    }
    this.setData({
      xfData: list
    });
  }
});