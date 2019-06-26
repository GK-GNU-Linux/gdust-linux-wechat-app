//ks.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    list: [],
    first: 1,
    teacher: false,
    id: '',
    name: '',
    share_id: ''
  },
  togglePage: function (e) {
    var id = e.currentTarget.id, data = {};
    data.show = [];
    for (var i = 0, len = this.data.class.length; i < len; i++) {
      data.show[i] = false;
    }
    if (this.data.first) {
      this.setData(data);
      this.data.first = 0;
    }
    data.show[id] = !this.data.show[id];
    this.setData(data);
  },
  //分享
  onShareAppMessage: function () {
    var id = this.data.share_id
    return {
      title: this.data.name + '的考试安排',
      desc: '莞香小喵 - 考试安排',
      path: `/pages/index/index?r=/pages/core/ks/ks|id:${id}`
    };
  },
  //下拉更新
  onPullDownRefresh: function () {
    var _this = this;
    _this.loginHandler({
      id: '',
    });
  },
  onLoad: function (options) {
    var _this = this;
    app.loginLoad().then(function () {
      _this.loginHandler.call(_this, options);
    });
  },
  //让分享时自动登录
  loginHandler: function (options) {
    var _this = this;
    var data = {
      share_id: options.id || ''
    };
    //判断并读取缓存
    if (app.cache.ks && !options.id) {
      ksRender(app.cache.ks);
    }
    function ksRender(list) {
      if (!list || !list.length) {
        _this.setData({
          remind: '无考试安排'
        });
        return false;
      }
      var days = ['一', '二', '三', '四', '五', '六', '日'];
      for (var i = 0, len = list.length; i < len; ++i) {
        list[i].open = false;
        list[i].index = i;
        list[i].day = days[list[i].day - 1];
        list[i].time = list[i].time.trim().replace('—', '~');
        //list[i].lesson = list[i].lesson.replace(',','-');
        //倒计时提醒
        if (list[i].days > 0) {
          list[i].countdown = '还有' + list[i].days + '天考试';
          list[i].place = '（' + list[i].time + '）' + list[i].room;
        } else if (list[i].days < 0) {
          list[i].countdown = '考试已过了' + (-list[i].days) + '天';
          list[i].place = '';
        } else {
          list[i].countdown = '今天考试';
          list[i].place = '（' + list[i].time + '）' + list[i].room;
        }
      }
      list[0].open = true;
      _this.setData({
        list: list,
        remind: ''
      });
    }
    wx.showNavigationBarLoading();
    app.wx_request("/exam/api_exam_schedule", "GET", data).then(function (res) {
      if (res.data && res.data.status === 200) {
        var data = res.data.data;
        if (data) {
          if (!options.id) {
            //保存考试缓存
            app.saveCache('ks', data.exam);
          }
          ksRender(data.exam);
          _this.setData({
            id: data.account,
            name: data.real_name,
            share_id: data.share_id
          });
        } else { _this.setData({ remind: '暂无数据' }); }

      } else {
        app.removeCache('ks');
        _this.setData({
          remind: res.data.msg || '未知错误'
        });
      }
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }).catch(function (res) {
      if (_this.data.remind == '加载中') {
        _this.setData({
          remind: '网络错误'
        });
      }
      console.warn('网络错误');
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  },
  // 展示考试详情
  slideDetail: function (e) {
    var id = e.currentTarget.dataset.id,
      list = this.data.list;
    // 每次点击都将当前open换为相反的状态并更新到视图，视图根据open的值来切换css
    for (var i = 0, len = list.length; i < len; ++i) {
      if (i == id) {
        list[i].open = !list[i].open;
      } else {
        list[i].open = false;
      }
    }
    this.setData({
      list: list
    });
  }
});
