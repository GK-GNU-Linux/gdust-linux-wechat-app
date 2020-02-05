//kjs.js
//获取应用实例
var app = getApp();

// 定义常量数据
var WEEK_DATA = ['', '第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周', '第八周', '第九周', '第十周',
    '十一周', '十二周', '十三周', '十四周', '十五周', '十六周', '十七周', '十八周', '十九周', '二十周'
  ],
  DAY_DATA = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  CLASSTIME_DATA = ['', {
      time: '1-2节',
      index: 1
    }, {
      time: '3-4节',
      index: 3
    }, {
      time: '5-6节',
      index: 5
    },
    {
      time: '7-8节',
      index: 7
    }, {
      time: '9-10节',
      index: 9
    }
  ],
  BUILDING_LIST = [[], ['', '1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋', '9栋', '工1'], ['', '松4', '松5', '松6', '松L3', '松L6']],
  SCHOOL_ARAE = ['', '南城', '松山湖']
Page({
  data: {
    DATA: {
      SCHOOL_ARAE: SCHOOL_ARAE,
      WEEK_DATA: WEEK_DATA,
      DAY_DATA: DAY_DATA,
      CLASSTIME_DATA: CLASSTIME_DATA,
      BUILDING_DATA: BUILDING_LIST[1],
    },
    active: { // 发送请求的数据对象 初始为默认值
      weekNo: 1,
      weekDay: 1,
      buildingNo: 1,
      classNo: 1,
      areaNo: 1,
    },
    errObj: {
      errorDisplay: false
    },
    nowWeekDay: 1,
    nowWeekNo: 1,
    nowClassNo: 1,
    testData: null,
    remind: '',
    time_list: [{
        begin: '8:30',
        end: '10:05'
      },
      {
        begin: '10:25',
        end: '12:00'
      },
      {
        begin: '14:40',
        end: '16:15'
      },
      {
        begin: '16:30',
        end: '18:05'
      },
      {
        begin: '19:30',
        end: '21:05'
      },
    ],
  },
  onLoad: function(options) {
    var _this = this;
    app.loginLoad().then(function() {
      _this.loginHandler.call(_this, options);
    });
  },
  //分享
  onShareAppMessage: function () {
    return {
      title: '广东科技学院空教室',
      desc: '莞香小喵 - 空教室查询',
      path: `/pages/index/index?r=/pages/core/kjs/kjs`
    };
  },
  loginHandler: function(options) {
    // 比较获取时间，比较出第几节
    var _this = this;

    function parseMinute(dateStr) {
      return dateStr.split(':')[0] * 60 + parseInt(dateStr.split(':')[1]);
    }

    function compareDate(dateStr1, dateStr2) {
      return parseMinute(dateStr1) <= parseMinute(dateStr2);
    }
    var nowTime = app.util.formatTime(new Date(), 'h:m');
    var time_length = _this.data.time_list.length;
    _this.data.time_list.forEach(function(e, i) {
      if (i === time_length - 1 && compareDate(e.end, nowTime)) {
        _this.data.nowClassNo = 5;
      } else if (compareDate(e.end, nowTime)) {
        _this.data.nowClassNo = i + 2;
      };
    });
    var week_day = new Date().getDay();  
    console.log(week_day)
    _this.setData({
      'nowWeekDay': week_day,
      'active.weekDay': week_day,
      'nowWeekNo': 1,
      'active.weekNo': 1,
      'nowClassNo': _this.data.nowClassNo,
      'active.classNo': _this.data.nowClassNo
    });
    // 初始默认显示
    if (_this.data.remind == '') {
      _this.sendRequest();
    }
  },

  //下拉更新
  onPullDownRefresh: function() {
    this.sendRequest();
  },

  // 发送请求的函数
  sendRequest: function(query) {
    app.showLoadToast();
    wx.showNavigationBarLoading();
    var _this = this;
    var query = query || {},
      activeData = _this.data.active;
    return new Promise(function(resolve, reject) {
      var requestData = {
        campus_area: query.areaNo || activeData.areaNo,
        weeks: query.weekNo || activeData.weekNo,
        week: query.weekDay || activeData.weekDay,
        class_time: _this.data.DATA.CLASSTIME_DATA[query.classNo || activeData.classNo].index,
        building: query.buildingNo || activeData.buildingNo
      };

      // 对成功进行处理
      function doSuccess(data) {
        var week_num = data.week_num
        var week_day = new Date().getDay();  
        if (week_day === 0) {
          week_num = week_num - 1;
        }
        _this.setData({
          'testData': data.class_room_list,
          'nowWeekNo': week_num,
          'active.weekNo': week_num,
          'errObj.errorDisplay': true
        });
      }

      app.wx_request("/school_sys/api_empty_class_room", "POST", requestData).then(function(res) {
        if (res.data && res.data.status === 200) {
          doSuccess(res.data.data);
          resolve();
        } else {
          app.showErrorModal(res.data.msg);
        }
      }).catch(function(res) {
        _this.setData({
          remind: '网络错误'
        });
        console.warn('网络错误');
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        reject();
      }).then(function() {
        wx.hideToast();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    })
  },

  // week
  chooseWeek: function(e) {
    var _this = this;
    var index = parseInt(e.target.dataset.weekno, 10);
    if (isNaN(index)) {
      return false;
    }
    this.sendRequest({
      weekNo: index
    }).then(function() {
      _this.setData({
        'active.weekNo': index
      });
    });
  },

  // day
  chooseDay: function(e) {
    var _this = this;
    var index = parseInt(e.target.dataset.dayno, 10);

    if (isNaN(index)) {
      return false;
    }

    this.sendRequest({
      weekDay: index
    }).then(function () {
      _this.setData({
        'active.weekDay': index
      });
    });
  },
  chooseSchoolArea: function(e) {
    var _this = this;
    var index = parseInt(e.target.dataset.areano, 10);
    if (isNaN(index)) {
      return false;
    }
    this.sendRequest({
      buildingNo: 1,
      areaNo: index
    }).then(function () {
      _this.setData({
        'DATA.BUILDING_DATA': BUILDING_LIST[index],
        'active.areaNo': index,
        'active.buildingNo': 1
      });
    });
  },
  // classTime
  chooseClaasTime: function(e) {
    var _this = this;
    var index = e.target.dataset.classno;
    if (isNaN(index)) {
      return false;
    }
    this.sendRequest({
      classNo: index
    }).then(function () {
      _this.setData({
        'active.classNo': index
      });
    });
  },

  // building
  chooseBuilding: function(e) {
    var _this = this;
    var index = parseInt(e.target.dataset.buildingno, 10);
    if (isNaN(index)) {
      return false;
    }
    this.sendRequest({
      buildingNo: index
    }).then(function () {
      _this.setData({
        'active.buildingNo': index
      });
    });
  }
});