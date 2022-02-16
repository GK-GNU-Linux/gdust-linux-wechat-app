//kb.js
let isAdShowed = false
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    _days: ['一', '二', '三', '四', '五', '六', '日'],
    _weeks: ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周', '第八周', '第九周', '第十周', '十一周', '十二周', '十三周', '十四周', '十五周', '十六周', '十七周', '十八周', '十九周', '二十周', '二十一周', '二十二周', '二十三周', '二十四周', '二十五周', '二十六周'],
    _time: [ //课程时间与指针位置的映射，{begin:课程开始,end:结束时间,top:指针距开始top格数}
      {
        begin: '0:00',
        end: '8:29',
        beginTop: -4,
        endTop: -4
      },
      {
        begin: '8:30',
        end: '10:05',
        beginTop: 0,
        endTop: 200
      },
      {
        begin: '10:06',
        end: '10:24',
        beginTop: 204,
        endTop: 204
      },
      {
        begin: '10:25',
        end: '12:00',
        beginTop: 208,
        endTop: 408
      },
      {
        begin: '12:01',
        end: '14:39',
        beginTop: 414,
        endTop: 414
      },
      {
        begin: '14:40',
        end: '16:15',
        beginTop: 420,
        endTop: 620
      },
      {
        begin: '16:15',
        end: '16:29',
        beginTop: 624,
        endTop: 624
      },
      {
        begin: '16:30',
        end: '18:05',
        beginTop: 628,
        endTop: 828
      },
      {
        begin: '18:06',
        end: '19:29',
        beginTop: 834,
        endTop: 834
      },
      {
        begin: '19:30',
        end: '21:05',
        beginTop: 840,
        endTop: 1040
      },
      {
        begin: '20:41',
        end: '20:49',
        beginTop: 1044,
        endTop: 1044
      },
      {
        begin: '20:50',
        end: '23:59',
        beginTop: 1048,
        endTop: 1254
      },
    ],
    timelineTop: 0,
    scroll: {
      left: 0
    },
    delayShow: true,
    targetLessons: [],
    targetX: 0, //target x轴top距离
    targetY: 0, //target y轴left距离
    targetDay: 0, //target day
    targetWid: 0, //target wid
    targetI: 0, //target 第几个active
    targetLen: 0, //target 课程长度
    blur: false,
    today: '', //当前星期数
    toweek: 1, //当前周数
    week: 1, //视图周数（'*'表示学期视图）
    lessons: [], //课程data
    dates: [], //本周日期
    teacher: false, //是否为教师课表
    share_id: null,
    changeLock: false,
    real_name: null
  },
  //下拉更新
  onPullDownRefresh: function () {
    var _this = this;
    app.loginLoad().then(function () {
      new Promise(_this.update_kb).then((res)=>{
        wx.showToast({
          title: '更新课表成功',
          icon:'none',
          duration: 1500
        });
        wx.stopPullDownRefresh();
      })
    }).catch(function (e) {
      console.log(e)
    });
  },
  onLoad: function(options) {
    var _this = this;
    app.loginLoad().then(function () {
      _this.get_kb()
    }).catch(err => {
      console.log(err)
    })
    
  },
  onShow: function() {
    var _this = this;
    // 计算timeline时针位置
    function parseMinute(dateStr) {
      return dateStr.split(':')[0] * 60 + parseInt(dateStr.split(':')[1]);
    }

    function compareDate(dateStr1, dateStr2) {
      return parseMinute(dateStr1) <= parseMinute(dateStr2);
    }
    var nowTime = app.util.formatTime(new Date(), 'h:m');
    _this.data._time.forEach(function(e, i) {
      if (compareDate(e.begin, nowTime) && compareDate(nowTime, e.end)) {
        _this.setData({
          timelineTop: Math.round(e.beginTop + (e.endTop - e.beginTop) * (parseMinute(nowTime) - parseMinute(e.begin)) / 100)
        });
      };
    });
    //设置滚动至当前时间附近，如果周末为设置left为其最大值102
    var nowWeek = new Date().getDay();
    _this.setData({
      'scroll.left': (nowWeek === 6 || nowWeek === 0) ? 102 : 0
    });
  },
  scrollXHandle: function(e) {
    this.setData({
      'scroll.left': e.detail.scrollLeft
    });
  },
  showDetail: function(e) {
    // 点击课程卡片后执行
    var _this = this;
    var week = _this.data.week;
    var dataset = e.currentTarget.dataset;
    var lessons = _this.data.lessons[dataset.day][dataset.wid];
    var targetI = 0;
    lessons[dataset.cid].target = true;
    if (week != '*') {
      lessons = lessons.filter(function(e) {
        return e.weeks_arr.indexOf(parseInt(week)) !== -1;
      });
    }
    lessons.map(function(e, i) {
      if (lessons.length === 1) {
        e.left = 0;
      } else {
        //笼罩层卡片防止超出课表区域
        //周一~周四0~3:n lessons.length>=2*n+1时，设置left0为-n*128，否则设置为-60*(lessons.length-1)；
        //周日~周五6~4:n lessons.length>=2*(6-n)+1时，设置left0为-(7-n-lessons.length)*128，否则设置为-60*(lessons.length-1)；
        var left0 = -60 * (lessons.length - 1);
        if (dataset.day <= 3 && lessons.length >= 2 * dataset.day + 1) {
          left0 = -dataset.day * 128;
        } else if (dataset.day >= 4 && lessons.length >= 2 * (6 - dataset.day) + 1) {
          left0 = -(7 - dataset.day - lessons.length) * 128;
        }
        e.left = left0 + 128 * i;
      }
      return e;
    });
    lessons.forEach(function(e, i) {
      if (e.target) {
        targetI = i;
        lessons[i].target = false;
      }
    });
    if (!lessons.length) {
      return false;
    }
    _this.setData({
      targetX: dataset.day * 129 + 35 + 8,
      targetY: dataset.wid * 206 + Math.floor(dataset.wid / 2) * 4 + 60 + 8,
      targetDay: dataset.day,
      targetWid: dataset.wid,
      targetI: targetI,
      targetLessons: lessons,
      targetLen: lessons.length,
      blur: true
    });
  },
  hideDetail: function() {
    // 点击遮罩层时触发，取消主体部分的模糊，清空target
    this.setData({
      blur: false,
      targetLessons: [],
      targetX: 0,
      targetY: 0,
      targetDay: 0,
      targetWid: 0,
      targetI: 0,
      targetLen: 0
    });

  },
  infoCardTap: function(e) {
    var dataset = e.currentTarget.dataset;
    if (this.data.targetI == dataset.index) {
      return false;
    }
    this.setData({
      targetI: dataset.index
    });
  },
  infoCardChange: function(e) {
    var current = e.detail.current;
    if (this.data.targetI == current) {
      return false;
    }
    this.setData({
      targetI: current
    });
  },
  chooseView: function() {
    app.showLoadToast('切换视图中', 500);
    //切换视图(周/学期) *表示学期视图
    this.setData({
      week: this.data.week == '*' ? this.data.toweek : '*'
    });
  },
  returnCurrent: function() {
    //返回本周
    this.setData({
      week: this.data.toweek
    });
  },
  currentChange: function(e) {
    // 更改底部周数时触发，修改当前选择的周数
    if (!this.data.changeLock) {
      this.data.changeLock = true
      var current = e.detail.current
      this.setData({
        week: current + 1
      });
      this.data.changeLock = false
    }
  },
  catchMoveDetail: function() { /*阻止滑动穿透*/ },
  bindStartDetail: function(e) {
    this.setData({
      startPoint: [e.touches[0].pageX, e.touches[0].pageY]
    });
  },
  //滑动切换课程详情
  bindMoveDetail: function(e) {
    var _this = this;
    var curPoint = [e.changedTouches[0].pageX, e.changedTouches[0].pageY],
      startPoint = _this.data.startPoint,
      i = 0;
    if (curPoint[0] <= startPoint[0]) {
      if (Math.abs(curPoint[0] - startPoint[0]) >= Math.abs(curPoint[1] - startPoint[1])) {
        if (_this.data.targetI != _this.data.targetLen - 1) {
          i = 1; //左滑
        }
      }
    } else {
      if (Math.abs(curPoint[0] - startPoint[0]) >= Math.abs(curPoint[1] - startPoint[1])) {
        if (_this.data.targetI != 0) {
          i = -1; //右滑
        }
      }
    }
    if (!i) {
      return false;
    }
    _this.setData({
      targetI: parseInt(_this.data.targetI) + i
    });
  },
  //点击左右按钮切换swiper
  swiperChangeBtn: function(e) {
    var _this = this;
    if (_this.data.delayShow){
      _this.data.delayShow = false
      var dataset = e.currentTarget.dataset,
        i, data = {};
      if (_this.data[dataset.target] == 1 && dataset.direction == 'left') {
        i = 0;
      } else if (dataset.direction == 'left') {
        i = -1;
      } else if (dataset.direction == 'right') {
        i = 1;
      }
      data[dataset.target] = parseInt(_this.data[dataset.target]) + i;
      _this.setData(data, () => {
        _this.data.delayShow = true
      });
    }

  },
  get_kb: function(resolve,share_id) {
    //数组去除指定值
    function removeByValue(array, val) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] == val) {
          array.splice(i, 1);
          break;
        }
      }
      return array;
    }
    // 根据获取课表
    var _this = this,
      data = {
        week_num: _this.data.week,
        weekday: '',
      };
    if (app.user.is_teacher) {
      data.type = 'teacher';
    }
    //判断并读取缓存
    if (app.cache.kb_all && !share_id) {
      kbRender(app.cache.kb_all);
    }
    //课表渲染
    function kbRender(_data) {
      console.log(_data)
      //console.log(_data.today)
      _this.data.real_name = _data.real_name
      var colors = ['red', 'green', 'purple', 'yellow'];
      var today = parseInt(_data.today); //星期几，0周日,1周一
      today = today === 0 ? 6 : today - 1; //0周一,1周二...6周日
      var week = _data.week; //当前周
      var toweek = week;
      if (today === 6) {
        toweek = toweek - 1;
        if (week !=1){
          week = week - 1;
        }
      }
      var lessons = _data.lessons;
      //各周日期计算
      var nowD = new Date(),
        nowMonth = nowD.getMonth() + 1,
        nowDate = nowD.getDate();
      var dates = _this.data._weeks.slice(0); //0:第1周,1:第2周,..19:第20周
      dates = dates.map(function(e, m) {
        var idates = _this.data._days.slice(0); //0:周一,1:周二,..6:周日
        idates = idates.map(function(e, i) {
          var d = (m === (week - 1) && i === today) ? nowD : new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate() - ((week - 1 - m) * 7 + (today - i)));
          return {
            month: d.getMonth() + 1,
            date: d.getDate()
          }
        });
        return idates;
      });
      _this.setData({
        today: today,
        week: week,
        toweek: toweek,
        lessons: lessons,
        dates: dates,
        remind: ''
      });
    }
    wx.showNavigationBarLoading();
    //获取课表
      app.wx_request("/api/v1/schedule/" + wx.getStorageSync('account'), "GET").then(
        function(res) {
          // 获取课表完成
          if(resolve) {
            resolve()
          }
          var data = res.data.detail
          if (wx.getStorageSync('schedule') === '') {
            kbRender(data)
          } else {
            data = wx.getStorageSync('schedule');
            kbRender(data)
            wx.removeStorageSync('schedule')
          }
        }
      ).catch(err => {
        var course = []
        kbRender(course)
        console.log("error",err)
      })
      wx.hideNavigationBarLoading();
  },
  /**
   * 更新课表
   * @param {*} resolve 
   * @param {*} share_id 
   */
  update_kb: function(resolve,share_id) {
    //数组去除指定值
    function removeByValue(array, val) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] == val) {
          array.splice(i, 1);
          break;
        }
      }
      return array;
    }
    // 根据获取课表
    var _this = this,
      data = {
        week_num: _this.data.week,
        weekday: '',
      };
    if (app.user.is_teacher) {
      data.type = 'teacher';
    }
    //判断并读取缓存
    if (app.cache.kb_all && !share_id) {
      kbRender(app.cache.kb_all);
    }
    //课表渲染
    function kbRender(_data) {
      console.log(_data)
      //console.log(_data.today)
      _this.data.real_name = _data.real_name
      var colors = ['red', 'green', 'purple', 'yellow'];
      var today = parseInt(_data.today); //星期几，0周日,1周一
      today = today === 0 ? 6 : today - 1; //0周一,1周二...6周日
      var week = _data.week; //当前周
      var toweek = week;
      if (today === 6) {
        toweek = toweek - 1;
        if (week !=1){
          week = week - 1;
        }
      }
      var lessons = _data.lessons;
      //各周日期计算
      var nowD = new Date(),
        nowMonth = nowD.getMonth() + 1,
        nowDate = nowD.getDate();
      var dates = _this.data._weeks.slice(0); //0:第1周,1:第2周,..19:第20周
      dates = dates.map(function(e, m) {
        var idates = _this.data._days.slice(0); //0:周一,1:周二,..6:周日
        idates = idates.map(function(e, i) {
          var d = (m === (week - 1) && i === today) ? nowD : new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate() - ((week - 1 - m) * 7 + (today - i)));
          return {
            month: d.getMonth() + 1,
            date: d.getDate()
          }
        });
        return idates;
      });
      _this.setData({
        today: today,
        week: week,
        toweek: toweek,
        lessons: lessons,
        dates: dates,
        remind: ''
      });
    }
    wx.showNavigationBarLoading();
    //获取课表
      app.wx_request("/api/v1/schedule/update", "GET").then(
        function(res) {
          // 获取课表完成
          if(resolve) {
            resolve()
          }
          var data = res.data.detail
          if (wx.getStorageSync('schedule') === '') {
            kbRender(data)
          } else {
            data = wx.getStorageSync('schedule');
            kbRender(data)
            wx.removeStorageSync('schedule')
          }
        }
      ).catch(err => {
        console.log("error",err)
      })
      wx.hideNavigationBarLoading();
  }
});