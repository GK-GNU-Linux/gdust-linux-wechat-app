//xs.js
//获取应用实例
var app = getApp();

Page({
  data: {
    header: {
      defaultValue: '',
      inputValue: '',
      help_status: false
    },
    main: {
      mainDisplay: true, // main 显示的变化标识
      total: 0,
      sum: 0,
      page: 0,
      message: '上滑加载更多'
    },
    testData: [],
    messageObj: { // 查询失败的提示信息展示对象
      messageDisplay: true,
      message: '' 
    }
  },

  bindClearSearchTap: function (e) {
    this.setData({
      'main.mainDisplay': true,
      'main.total': 0,
      'main.sum': 0,
      'main.page': 0,
      'main.message': '上滑加载更多',
      'testData': [],
      'header.inputValue': ''
    });
  },

  bindSearchInput: function(e) {
    this.setData({
      'header.inputValue': e.detail.value,
      'main.total': 0,
      'main.sum': 0,
      'main.page': 0,
      'main.message': '上滑加载更多',
      'testData': []
    });
    if(!this.data.messageObj.messageDisplay){
      this.setData({
        'messageObj.messageDisplay': true,
        'messageObj.message': ''
      });
    }
    return e.detail.value;
  },

  // 点击搜索
  bindConfirmSearchTap: function () {
    this.setData({
      'main.total': 0,
      'main.sum': 0,
      'main.page': 0,
      'main.message': '上滑加载更多',
      'testData': []
    });
    this.search();
  },
  //分享
  onShareAppMessage: function () {
    return {
      title: '广东科技学院图书馆找书',
      desc: '莞香小喵 - 我要找书',
      path: `/pages/index/index?r=/pages/core/zs/zs`
    };
  },
  // 上滑加载更多
  onReachBottom: function(){
    if(this.data.main.message != '已全部加载' && this.data.main.message != '正在加载中'){
      this.search();
    }
  },

  // 搜索
  search: function (key) {

    var that = this,
        inputValue = key || that.data.header.inputValue,
        messageDisplay = false,
        message = '',
        reDdata = null,
        numberSign = false; // 用户输入的是姓名还是学号的标识
      
    // 消除字符串首尾的空格
    function trim(str) {

      return str.replace(/(^\s*)|(\s*$)/g, '');
    }

    inputValue = trim(inputValue);

    // 抽离对messageObj的设置成一个单独的函数
    function setMessageObj(messageDisplay, message) {

      that.setData({
        'messageObj.messageDisplay': messageDisplay,
        'messageObj.message': message
      });
    }

    // 对输入的是空格或未进行输入进行处理
    if (inputValue === '') {

      this.setData({
        'main.mainDisplay': true
      });

      return false;
    }

    // 防止注入攻击
    function checkData(v) {

        var temp = v;
          
        v = v.replace(/\\|\/|\.|\'|\"|\<|\>/g, function (str) { return ''; });
        v = trim(v);

        messageDisplay = v.length < temp.length ? false : true;
        message = '请勿输入非法字符!';

        return v;
    }

    // 对输入进行过滤
    inputValue = checkData(inputValue);

    setMessageObj(messageDisplay, message);
    this.setData({
       'header.inputValue': inputValue
    });

    // 存在非法输入只会提示错误消息而不会发送搜索请求
    if (messageDisplay === false) { 
      return false;
    }

    // 对输入类型进行处理 inputValue:String
    if (!isNaN(parseInt(inputValue, 10))) {

      numberSign = true;
    }

    // 处理成功返回的数据
    function doSuccess(data, messageDisplay) {

      var rows = data.rows;
      // 对数据进行自定义加工 给每个数据对象添加一些自定义属性
      function doData(data) {

        var curData = null,
            curXm = null,
            curXh = null,
            len = data.length;

        // 若查询没有查出结果，则直接显示提示信息并退出
        if (len === 0) {
          doFail();
          return false;
        }

        for (var i = 0; i < len; i++) {
          curData = data[ i ];
          curData.display = false; // 添加控制隐藏列表信息显示的标识
          curData.headImg = curData.headImg || '/images/core/zs.png';
        }

        return data;
      }
     
      reDdata = doData(rows);
      
      // 若reDdata===false, 查询没有结果
      if (reDdata === false) {
        return false;
      }

      that.setData({
        'testData': that.data.testData.concat(reDdata),
        'main.mainDisplay': false,
        'main.total': data.total,
        'main.sum': that.data.main.sum + data.rows.length,
        'messageObj.messageDisplay': messageDisplay,
        'main.message': '上滑加载更多'
      });
      wx.hideToast();

      if (reDdata.length === 1) {
        that.bindOpenList(0);
      }

      if(data.total <= that.data.main.sum) {
        that.setData({
          'main.message': '已全部加载'
        });
      }

    }
    
    // 处理没找到搜索到结果或错误情况
    function doFail(err) {

      var message = typeof err === 'undefined' ? '未搜索到相关结果' : err;
      
      setMessageObj(false, message);
      wx.hideToast();
    }
    
    that.setData({
      'main.message': '正在加载中',
      'main.page': that.data.main.page + 1
    });
    app.showLoadToast();
    wx.request({
      url: 'https://library.gxgk.cc/library/',
      method: 'GET',
      data: {
        keyword: inputValue,
        page: that.data.main.page
      },
      success: function(res) {
        
        if(res.data && res.data.code === 200) {

          doSuccess(res.data.data, true);
        }else{

          app.showErrorModal(res.data.msg);
          doFail(res.data.msg);
        }
      },
      fail: function(res) {
        
        app.showErrorModal(res.errMsg);
        doFail(res.errMsg);
      }
    });

  },

  // main——最优
  bindOpenList: function (e) {
    var index = !isNaN(e) ? e : parseInt(e.currentTarget.dataset.index),
        data = {};
    data['testData['+index+'].display'] = !this.data.testData[index].display;
    this.setData(data);
  },

  onLoad: function(options){
    var _this = this;
    app.loginLoad(function(){
      _this.loginHandler.call(_this, options);
    });
  },
  //让分享时自动登录
  loginHandler: function (options) {
    if(options.key){
      this.setData({
        'main.mainDisplay': false,
        'header.defaultValue': options.key,
        'header.inputValue': options.key
      });
      this.search();
    }
  },

  tapHelp: function(e){
    if(e.target.id == 'help'){
      this.hideHelp();
    }
  },
  showHelp: function(e){
    this.setData({
      'header.help_status': true
    });
  },
  hideHelp: function(e){
    this.setData({
      'header.help_status': false
    });
  }
});