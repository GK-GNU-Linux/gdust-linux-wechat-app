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
    wx.showToast({
      icon: 'none',
      title: '更新中',
    })
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
    // wx.getStorageSync('account')
    app.wx_request("/api/v1/score/" + wx.getStorageSync('account'), "GET").then(
      function(res) {
        if (res.data && res.data.message === 'success') {
          _this.makeData(res.data.detail).then(res=>{
            _this.cjRender(res);
          })

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
  },
  /**
   * 制作适合课表显示的数据
   * @param {*} params 
   */
  makeData: async function (detail) {
    console.log(detail)
    // const userInfo = await app.wx_request("/api/v1/info/" + wx.getStorageSync('account'), "GET")
    const scores = []
    for (const key of Object.keys(detail)) {
      scores.push({
        "lesson_name":  key,
        "pscj": '', //平时分
        "credit": detail[key]['credit'], //学分
        "qmcj": '', //卷面分
        "grade_point": detail[key]['grade_point'], //绩点
        "score": detail[key]['exam_result']
      },)
    }
    // userInfo?.data?.detail?.name || 
    const data = {
      "account": wx.getStorageSync('account'),
      "real_name": '',
      "year": 2021,
      "term":1,
      "score": scores,
      "rank": {
          "avgGpa": 233.3,
          "class_rank": 1,
          "credits": 1234
      }
    }
    return data
  }
});