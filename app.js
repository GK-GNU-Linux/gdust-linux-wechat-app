//app.js
var mta = require('./utils/mta_analysis.js')

App({
  version: 'v2.1.11', //版本号
  scene: 1001, //场景值
  shareTicket: null, //分享获取相同信息所需ticket
  session_id: null,
  is_login: false,
  redirect: false,
  account: 0,
  onLaunch: function (options) {
    const that = this
    //console.log(options)
    // 如果有新的版本强制更新版本
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager();
      updateManager.onUpdateReady(() => {
        updateManager.applyUpdate();
      });
    }
    var _this = this;
    if (options.scene) {
      _this.scene = options.scene;
    }
    mta.App.init({
      "appID": require('config').mta_app_id,
      "lauchOpts": options, //渠道分析,需在onLaunch方法传入options,如onLaunch:function(options){...}
      "statPullDownFresh": true, // 使用分析-下拉刷新次数/人数，必须先开通自定义事件，并配置了合法的eventID
      "statShareApp": true, // 使用分析-分享次数/人数，必须先开通自定义事件，并配置了合法的eventID
      "statReachBottom": true // 使用分析-页面触底次数/人数，必须先开通自定义事件，并配置了合法的eventID
    });
    _this.shareTicket = options.shareTicket;
    //读取缓存
    try {
      var data = wx.getStorageInfoSync();
      //console.log(data)
      if (data && data.keys.length) {
        data.keys.forEach(function (key) {
          var value = wx.getStorageSync(key);
          //console.log(value)
          if (value) {
            _this.cache[key] = value;
          }
        });
        if (_this.cache.version !== _this.version) {
          // _this.cache = {};
          // wx.clearStorage();
        } else {
          _this.session_id = _this.cache.session_id;
          _this.account = _this.cache.account;
        }
      }
    } catch (e) {
      console.warn('获取缓存失败');
    }
  },
  //保存缓存
  saveCache: function (key, value) {
    if (!key || !value) {
      return;
    }
    var _this = this;
    _this.cache[key] = value;
    wx.setStorage({
      key: key,
      data: value
    });
  },
  //清除缓存
  removeCache: function (key) {
    if (!key) {
      return;
    }
    var _this = this;
    _this.cache[key] = '';
    wx.removeStorage({
      key: key
    });
  },
  //后台切换至前台时
  onShow: function () {},
  checkCache: function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.util.isEmptyObject(_this.user.wx_info)) {
        _this.initWechatUser().then(function () {
          if (_this.util.isEmptyObject(_this.user.auth_user)) {
            _this.initSchoolUser().then(function () {
              resolve();
            }).catch(resolve)
          } else {
            resolve();
          }
        }).catch(reject)
      } else {
        resolve();
      }
    })
  },
  //判断是否有登录信息，让分享时自动登录
  loginLoad: function () {
    var _this = this;
    if(wx.getStorageSync('account')) {
      return new Promise(()=>{})
    }
    return new Promise((resolve,rej)=>{
      wx.login({
        success(res) {
          console.log('res: ', res);
          if (res.code) {
            //发起网络请求
            _this.wx_request('/api/v1/account/login/' + res.code).then(resp => {
              let payload = resp.data.detail;
              wx.setStorageSync('token', payload.token)
              wx.setStorageSync('account', payload.account)
              wx.setStorageSync('openid', payload.openid)
              if (payload.account === null) {
                // 跳转绑定
                _this.session_login().then(()=>{
                  resolve()
                });
              } else {
                console.log('ok');
              }
            });
          } else {
            console.log('登录失败！' + res.errMsg);
            rej('登录失败！' + res.errMsg)
          }
        }
      })
    })
  },
  wx_request: function (enpoint, method, data) {
    // 全局网络请求封装
    var _this = this;
    return new Promise(function (resolve, reject) {
      const session_id = wx.getStorageSync('token') || null
      //console.log(session_id)
      let header = {}
      if (session_id) {
        header = {
          'content-type': 'application/json',
          'Authorization':  "Bearer " + session_id
        }
      }
      wx.request({
        url: _this.server + enpoint,
        data: data || '',
        method: method || 'GET',
        header: header,
        success: function (res) {
          if (res.data.status == 10000) {
            console.log('重新登录')
            _this.session_login().then(function () {
              // 成功回调
              _this.wx_request(enpoint, method, data).then(function (res) {
                resolve(res);
              }).catch(function (res) {
                reject(res);
              });
              return;
            }).catch(function (res) {
              console.log(res);
              reject(res);
            });
          } else {
            resolve(res);
          }
        },
        fail: function (res) {
          _this.showLoadToast("网络出错")
          reject(res);
        }
      });
    })
  },
  check_session: function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      wx.checkSession({
        success: function () {
          wx.request({
            url: _this.server + '/mini_program/check_session',
            data: {
              'session_id': _this.session_id
            },
            method: "POST",
            success: function (res) {
              if (!res.data) {
                // 网络出错
                _this.showLoadToast("服务器出错")
                reject();
              } else {
                if (res.data.status == 200) {
                  console.log("session状态有效")
                  resolve();
                } else if (res.data.status == 403) {
                  _this.session_login().then(function () {
                    resolve();
                  }).catch(function (res) {
                    console.log(res);
                    reject(res);
                  });
                }
              }
            },
            fail: function (res) {
              _this.showLoadToast("网络出错233")
              reject(res);
            }
          });
        },
        fail: function (res) {
          // 没有登录微信
          reject(res);
        }
      })
    });
  },
  session_login: function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      let account = wx.getStorageSync('account') || null
      let token = wx.getStorageSync('token') || null
      let mzsm = wx.getStorageSync('mzsm') || null
      if(mzsm == null) {
        return
      }
      if (account && token) {
        _this.saveCache('session_id', token)
        _this.saveCache('account', wx.getStorageSync('account'))
        resolve();
      } else {
        wx.showModal({
          title: '提示',
          content: '你好鸭，请先绑定教务系统哦~',
          showCancel: false,
          success: function (res) {
            if (res.confirm) { //这里是点击了确定以后
              setTimeout(function () {
                // 直接跳转回首页
                wx.reLaunch({
                  url: '/pages/more/login'
                })
              }, 0)
            } else { //这里是点击了取消以后
              setTimeout(function () {
                // 直接跳转回首页
                wx.reLaunch({
                  url: '/pages/index/index'
                })
              }, 0)
            }
          }
        })
      }
    })
  },
  getUserInfo: function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      //获取微信用户信息
      wx.getUserInfo({
        withCredentials: true,
        success: function (res) {
          var info = res;
          // _this.user.wxinfo = info.userInfo;
          if (!info.encryptedData || !info.iv) {
            reject('无关联AppID');
            return;
          }
          wx.request({
            method: 'POST',
            url: _this.server + '/mini_program/wechat_login',
            data: {
              session_id: _this.session_id,
              key: info.encryptedData,
              iv: info.iv,
              rawData: info.rawData,
              signature: info.signature
            },
            success: function (res) {
              if (res.data && res.data.status === 200) {
                console.log("获取用户信息成功")
                _this.checkCache().then(function () {
                  resolve(res);
                }).catch(function (e) {
                  console.log(e)
                })
              } else {
                _this.showLoadToast("服务器异常")
              }
            },
            fail: function (res) {
              _this.showLoadToast("网络出错")
            },
            complete: function () {}
          });
        },
        fail: function (res) {
          // 提示用户授权页面
          _this.g_status = '未授权';
          wx.navigateTo({
            url: '/pages/authorize/index'
          });
          reject(res);
        }
      });
    })
  },
  initWechatUser: function () {
    // 获取必要的微信信息
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.wx_request("/mini_program/wechat_user").then(function (res) {
        if (res.data.status === 200) {
          _this.user.wx_info = res.data.data;
          _this.saveCache('wx_info', res.data.data);
          resolve();
        } else {
          reject(res);
        }
      }).catch(function (res) {
        reject(res);
      })
    })
  },
  initSchoolUser: function () {
    // 获取必要的绑定信息
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.wx_request("/school_sys/user_info").then(function (res) {
        if (res.data.status === 200) {
          var data = res.data.data;
          _this.user.auth_user = data.auth_user;
          _this.saveCache('auth_user', data.auth_user);
          if (_this.user.auth_user.user_type === 0) {
            _this.saveCache('student', data.user_info);
            _this.user.student = data.user_info;
          } else if (_this.user.auth_user.user_type === 1) {
            _this.saveCache('teacher', data.user_info);
            _this.user.teacher = data.user_info;
          }
          resolve();
        } else {
          reject(res);
        }
      }).catch(function (res) {
        reject(res);
      })
    })
  },
  showErrorModal: function (content, title) {
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      confirmColor: "#1f7bff",
      showCancel: false
    });
  },
  showLoadToast: function (title, duration) {
    wx.showToast({
      title: title || '加载中',
      icon: 'loading',
      mask: true,
      duration: duration || 10000
    });
  },
  cache: {},
  server: require('config').server,
  news_server: require('config').news_server,
  user: {
    //微信数据
    wx_info: {},
    //认证数据
    auth_user: {},
    //学生数据
    student: {},
    //教师数据
    teacher: {},
    //学校参数
    school: {}
  },
  banner_show: false,
  util: require('./utils/util')
})