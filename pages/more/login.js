//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    schools_list: [],
    index: 0,
    usertype: [{
        name: '0',
        value: '学生',
        checked: 'true'
      },
      {
        name: '1',
        value: '教师'
      },
      {
        name: '2',
        value: '部门'
      },
    ],
    remind: '加载中',
    help_status: false,
    userid_focus: false,
    passwd_focus: false,
    userid: '',
    passwd: '',
    utype: 0,
    angle: 0
  },
  onReady: function() {
    var _this = this;
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (_this.data.angle !== angle) {
        _this.setData({
          angle: angle
        });
      }
    });
  },
  onLoad: function(options) {
    var _this = this;
    _this.setData({
      remind: ''
    });
  },
  bind: function() {
    var _this = this;
    if (!_this.data.userid || !_this.data.passwd) {
      app.showErrorModal('账号及密码不能为空', '提醒');
      return false;
    }
    wx.showLoading({
      title: '绑定中',
    })
    // var school_id = _this.data.schools_list[_this.data.index].id;
    var account = _this.data.userid;
    var data = {
      account: account,
      password: _this.data.passwd
    }
    app.wx_request("/api/v1/account/bind", 'POST', data).then(
      function(res) {
        console.log("login=res:",res)
        if (res.data && res.data.message === "账号绑定成功") {
          wx.setStorageSync('token',res.data.detail.token);
          wx.setStorageSync('account', res.data.detail.account)
          wx.setStorageSync('openid', res.data.detail.openid)
          wx.hideLoading()
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 1000
          });
          setTimeout(function () {
            // 直接跳转回首页
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 1000)
          return
        } else {
          wx.hideToast();
          wx.hideLoading()
          app.showErrorModal(res.data.message, '绑定失败');
        }
      }
    ).catch(function(res) {
      wx.hideToast();
      wx.hideLoading()
      app.showErrorModal(res.errMsg, '绑定失败');
    })
  },
  getBindResult: function (account){
    var _this = this;
    _this.checkBindResult(account).then(function (res) {
      if (res.data.status === 100) {
        // 绑定中，开始轮询
        setTimeout(function () {
          return _this.getBindResult(account)
        }, 500)
      }
      if (res.data.status === 200) {
        wx.hideLoading()
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 1500
        });
        setTimeout(function () {
          // 直接跳转回首页
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
        return
      }
    }).catch(function (res) {
      wx.hideToast();
      wx.hideLoading()
      app.showErrorModal(res, '绑定失败');
      return
    })
  },
  checkBindResult: function(school_id, account) {
    // 检查是否绑定成功
    var _this = this;
    return new Promise(function(resolve, reject) {
      var data = {
        school_id: school_id,
        account: account
      }
      app.wx_request("/school_sys/xcx_bind/result", 'POST', data).then(function(res) {
        if (res.data && res.data.status === 200) {
          resolve(res);
        } else if (res.data && res.data.status === 100) {
          // 绑定中，开始轮询
          resolve(res);
        } else {
          reject(res.data.msg);
        }
      }).catch(function(res) {
        console.log(res);
        reject(res);
      })
    })
  },
  schoolPickerChange: function(e) {
    console.log(this.data.schools_list[e.detail.value].id)
    this.setData({
      index: e.detail.value,
    })
  },
  radioChange: function(e) {
    this.setData({
      utype: e.detail.value
    });
  },
  useridInput: function(e) {
    this.setData({
      userid: e.detail.value
    });
    if (e.detail.value.length >= 11) {
      wx.hideKeyboard();
    }
  },
  passwdInput: function(e) {
    this.setData({
      passwd: e.detail.value
    });
  },
  inputFocus: function(e) {
    if (e.target.id == 'userid') {
      this.setData({
        'userid_focus': true
      });
    } else if (e.target.id == 'passwd') {
      this.setData({
        'passwd_focus': true
      });
    }
  },
  inputBlur: function(e) {
    if (e.target.id == 'userid') {
      this.setData({
        'userid_focus': false
      });
    } else if (e.target.id == 'passwd') {
      this.setData({
        'passwd_focus': false
      });
    }
  },
  tapHelp: function(e) {
    if (e.target.id == 'help') {
      this.hideHelp();
    }
  },
  showHelp: function(e) {
    this.setData({
      'help_status': true
    });
  },
  hideHelp: function(e) {
    this.setData({
      'help_status': false
    });
  }
});