//cj.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    cjInfo: [

    ],
    xqNum: {
      grade: '',
      semester: ''
    },
    xqName: {
      grade: '',
      semester: ''
    },
    share_id: ''
  },
  //分享
  onShareAppMessage: function() {
    var id = this.data.share_id
    return {
      title: this.data.real_name + '的成绩单',
      desc: '快来e广科查询你的期末成绩单',
      path: `/pages/index/index?r=/pages/core/cj/cj|id:${id}`,
      success: function(res) {
        // 分享成功
      },
      fail: function(res) {
        // 分享失败
      }
    };
  },
  //下拉更新
  onPullDownRefresh: function() {
    var _this = this;
    _this.getData(_this.data.share_id);
  },
  onLoad: function(options) {
    var _this = this;
    //判断并读取缓存
    // if (app.cache.cj && !options.id) {
    //   _this.cjRender(app.cache.cj);
    // }
    // app.loginLoad().then(function() {
    //   _this.loginHandler.call(_this, options);
    // });
    _this.getData()
  },
  loginHandler: function(options) {
    var _this = this;
    var share_id = options.id || '';

    _this.getData(share_id);
  },
  cjRender: function(data) {
    this.setData({
      account: data.account,
      real_name: data.real_name,
      share_id: data.share_id || 233,
      rank: data.rank || null,
      cjInfo: data.score,
      xqName: data.year + '学年 第' + data.term + '学期',
      update_time: data.update_time || null,
      remind: ''
    });
  },
  getData: function() { //share_id
    var _this = this;
    app.wx_request("/api/v1/score/2021/1", "GET").then(
      function(res) {
        if (res.data && res.data.message === 'success') {
          console.log(res.data.detail)
          var data = {
            "account": "2019123456",
            "real_name": "小明",
            "year": 2021,
            "term":1,
            "score": [
              {
                "lesson_name": "课程名-1",
                "pscj": 43, //平时分
                "qmcj": 66, //卷面分
                "score": 59
              },
              {
                "lesson_name": "课程名-2",
                "pscj": 43, //平时分
                "qmcj": 66, //卷面分
                "score": 66
              },
            ],
            "rank": {
                "avgGpa": 233.3,
                "class_rank": 1,
                "credits": 1234
            }
          }
          _this.cjRender(data);
        }
      }
    )
    
    // var share_id = share_id;
    // wx.showNavigationBarLoading();
    // app.wx_request("/school_sys/api_score", "GET", {
    //   'share_id': share_id
    // }).then(function(res) {
    //   if (res.data && res.data.status === 200) {
    //     var _data = res.data.data;
    //     if (!_data) {
    //       app.removeCache('cj');
    //       _this.setData({
    //         remind: res.data.msg || '未知错误'
    //       });
    //       wx.hideNavigationBarLoading()
    //       wx.stopPullDownRefresh();
    //       return;
    //     }
    //     if (_data.score && Object.keys(_data.score).length != 0) {
    //       //保存成绩缓存
    //       app.saveCache('cj', _data);
    //       _this.cjRender(_data);
    //     } else {
    //       _this.setData({
    //         remind: '暂无数据'
    //       });
    //     }
    //   } else {
    //     app.removeCache('cj');
    //     _this.setData({
    //       remind: res.data.msg || '未知错误'
    //     });
    //   }
    //   wx.hideNavigationBarLoading()
    //   wx.stopPullDownRefresh();
    // }).catch(function(res) {
    //   _this.setData({
    //     remind: '网络错误'
    //   });
    //   console.warn('网络错误');
    //   wx.hideNavigationBarLoading();
    //   wx.stopPullDownRefresh();
    // });
  }
});