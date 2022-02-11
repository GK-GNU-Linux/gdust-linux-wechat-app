//index.js
//获取应用实例
var app = getApp();
var mta = require('../../utils/mta_analysis.js')
Page({
  data: {
    banner: false,
    offline: false,
    remind: '',
    cores: [
      [{
          id: 'kb',
          name: '课表查询',
          disabled: false,
          guest_view: false,
          student_disable: false,
          teacher_disabled: false,
          offline_disabled: false
        },
        {
          id: 'cj',
          name: '成绩查询',
          disabled: true,
          guest_view: false,
          student_disable: false,
          teacher_disabled: true,
          offline_disabled: false
        },
        // {
        //   id: 'kjs',
        //   name: '空教室',
        //   disabled: true,
        //   guest_view: true,
        //   student_disable: false,
        //   teacher_disabled: false,
        //   offline_disabled: true
        // },
        // {
        //   id: 'ks',
        //   name: '考试安排',
        //   disabled: true,
        //   guest_view: false,
        //   student_disable: false,
        //   teacher_disabled: true,
        //   offline_disabled: false
        // },
        // {
        //   id: 'mht',
        //   name: '喵话题',
        //   disabled: true,
        //   guest_view: true,
        //   student_disable: false,
        //   teacher_disabled: false,
        //   offline_disabled: false
        // },
        {
          id: 'jy',
          name: '借阅信息',
          disabled: true,
          guest_view: false,
          student_disable: false,
          teacher_disabled: false,
          offline_disabled: false
        },
        {
          id: 'df',
          name: '电费查询',
          disabled: true,
          guest_view: true,
          student_disable: false,
          teacher_disabled: false,
          offline_disabled: false
        },
        {
          id: 'zs',
          name: '图书馆空位',
          disabled: true,
          guest_view: true,
          student_disable: false,
          teacher_disabled: false,
          offline_disabled: true
        }
      ],
      // [{
      //     id: 'ykt',
      //     name: '校园导览',
      //     btn_type: 'mini_program',
      //     mini_program: {
      //       app_id: 'wxc788f5aef8a73386',
      //       path: 'pages/index'
      //     },
      //     disabled: true,
      //     guest_view: true,
      //     student_disable: false,
      //     teacher_disabled: false,
      //     offline_disabled: false
      //   },
      //   // {
      //   //   id: 'xs',
      //   //   name: '学生查询',
      //   //   disabled: true,
      //   //   guest_view: false,
      //   //   student_disable: true,
      //   //   teacher_disabled: false,
      //   //   offline_disabled: true
      //   // },
      //   // {
      //   //   id: 'zw',
      //   //   name: '图书馆占座',
      //   //   btn_type: 'mini_program',
      //   //   mini_program: {
      //   //     app_id: 'wx4a326c92f0674dd7',
      //   //     path: 'pages/menu/menu'
      //   //   },
      //   //   disabled: true,
      //   //   guest_view: true,
      //   //   student_disable: false,
      //   //   teacher_disabled: false,
      //   //   offline_disabled: false
      //   // }
      // ]
    ],
    card: {
      'kb': {
        show: false,
        data: {}
      },
      'ykt': {
        show: false,
        data: {
          'last_time': '',
          'balance': 0,
          'cost_status': false,
          'today_cost': {
            value: [],
            total: 0
          }
        }
      },
      'jy': {
        show: false,
        data: {}
      }
    },
    redirect: false,
    user: {},
    disabledItemTap: false //点击了不可用的页面
  },
  //分享
  onShareAppMessage: function() {
    return {
      title: 'e广科',
      desc: '查课小助手',
      path: '/pages/index/index'
    };
  },
  //下拉更新
  onPullDownRefresh: function() {
    var _this = this;
    app.loginLoad().then(function() {
      _this.initButton();
      _this.getScheduleCard()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
      wx.stopPullDownRefresh();
    }).catch(function(e) {
      console.log(e)
    });
    wx.stopPullDownRefresh();
  },
  onShow: function() {
    var _this = this;
    if (_this.data.redirect) {
      console.log("关闭重定向")
      _this.data.redirect = false;
    }
  },
  onLoad: function(options) {
    var _this = this;
    mta.Page.init()
    _this.getScheduleCard()
    var content = '使用本小程序(e广科)\r\n即代表同意以下条款：\r\n1.e广科提供内容或服务仅供于个人学习、研究或欣赏娱乐等用途。\r\n2.使用e广科绑定教务系统，即同意e广科代理取得教务系统个人相关信息，包括成绩与课表等\r\n3.e广科提供的内容均会缓存在e广科后台，用户使用时自动更新\r\n4.取得信息均以本校教务系统为准，e广科无法保证信息的实时性\r\n5.使用本工具风险由您自行承担，e广科不承担任何责任'
    if (!app.cache.mzsm) {
      // 免责声明
      wx.showModal({
        title: '免责声明',
        content: content,
        confirmColor: "#1f7bff",
        showCancel: false
      });
      app.saveCache('mzsm', 1);
    }
  },
  initButton: function() {
    var _this = this;
    //开关按钮设置
    function set_item_switch(item) {
      var is_teacher = app.user.auth_user.user_type == 1;
      var is_admin = app.user.wx_info.is_admin;
      if (!item.disabled) {
        if (item.guest_view) {
          item.disabled = false;
        } else if (is_admin) {
          item.disabled = false;
        } else if (!is_teacher) {
          if (!item.student_disable)
            item.disabled = false;
          else
            item.disabled = true;
        } else {
          if (!item.teacher_disabled)
            item.disabled = false;
          else
            item.disabled = true;
        }
      }
    }
    for (var page = 0, pageLen = _this.data.cores.length; page < pageLen; page++) {
      for (var item = 0; item < _this.data.cores[page].length; item++) {
        set_item_switch(_this.data.cores[page][item])
      }
    }
    _this.setData({
      cores: _this.data.cores,
      banner: app.banner_show
    });
  },
  disabled_item: function() {
    //点击了不可用按钮
    var _this = this;
    if (!_this.data.disabledItemTap) {
      _this.setData({
        disabledItemTap: true
      });
      setTimeout(function() {
        _this.setData({
          disabledItemTap: false
        });
      }, 2000);
    }
  },
  getCardData: function(load_cache) {
    console.log("获取首页卡片信息")
    var _this = this;
    if (_this.data.offline) {
      return;
    }
    //清空数据
    _this.setData({
      'remind': '加载中',
      'card.kb.show': false,
      'card.ykt.show': false,
      'card.jy.show': false,
      'card.sdf.show': false
    });
    var loadsum = 0; //正在请求连接数
    //判断并读取缓存
    wx.showNavigationBarLoading();

    function endRequest() {
      loadsum--; //减少正在请求连接
      if (!loadsum) {
        if (_this.data.remind) {
          _this.setData({
            remind: '首页暂无展示'
          });
        }
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    }
    loadsum++; //新增正在请求连接
    _this.getScheduleCard().then(function() {
      endRequest();
    }).catch(function(res) {
      console.log("课表加载失败")
      endRequest();
    })
    if (app.user.is_bind_mealcard) {
      loadsum++; //新增正在请求连接
      _this.getMealcardCard().then(function() {
        endRequest();
      }).catch(function(res) {
        console.log("一卡通信息加载失败")
        endRequest();
      })
    } else {
      app.removeCache('ykt');
    }
    loadsum++; //新增正在请求连接
    //获取借阅信息
    _this.getLibraryCard().then(function() {
      endRequest();
    }).catch(function(res) {
      console.log("借阅信息加载失败")
      endRequest();
    })
  },
  getScheduleCard: function() {
    var _this = this;
    //课表渲染
    function kbRender(info) {
      _this.setData({
        'card.kb.data': info,
        'card.kb.show': true,
        'card.kb.nothing': !info.length,
        'remind': ''
      });
    }
    app.loginLoad().then(function() {
      app.wx_request("/api/v1/schedule/today/" + wx.getStorageSync('account'), "GET").then(
        function(res) {
          var data = res.data.detail
          kbRender(data)
        }
      ).catch(err => {
        var info = []
        kbRender(info)
        console.log("error",err)
      })
    }).catch(err => {
      var info = []
      kbRender(info)
    })
  },
  
  getMealcardCard: function() {
    var _this = this;
    //一卡通渲染
    function yktRender(data) {
      _this.setData({
        'card.ykt.data.outid': data.outid,
        'card.ykt.data.last_time': data.lasttime,
        'card.ykt.data.balance': data.mainFare,
        'card.ykt.show': true,
        'remind': ''
      });
    }
    if (app.cache.ykt) {
      yktRender(app.cache.ykt);
    }
    return new Promise(function(resolve, reject) {
      //获取一卡通数据
      app.wx_request('/school_sys/api_mealcard').then(function(res) {
        if (res.data && res.data.status === 200) {
          yktRender(res.data.data);
          app.saveCache('ykt', res.data.data);
          resolve();
        } else {
          reject(res);
        }
      }).catch(function(res) {
        app.removeCache('ykt');
        reject();
      });
    })
  },
  getLibraryCard: function() {
    var _this = this;
    //借阅信息渲染
    function jyRender(info) {
      _this.setData({
        'card.jy.data': info,
        'card.jy.show': true,
        'remind': ''
      });
    }
    if (app.cache.jy) {
      jyRender(app.cache.jy);
    }
    return new Promise(function(resolve, reject) {
      //获取借阅信息
      app.wx_request('/library/xcx_info').then(function(res) {
        if (res.data && res.data.status === 200) {
          jyRender(res.data.data);
          app.saveCache('jy', res.data.data);
          resolve();
        } else {
          reject(res);
        }
      }).catch(function(res) {
        console.log(res)
        app.removeCache('jy');
        reject(res);
      });
    })
  }
  
});