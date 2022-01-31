export default {
  pages: [
    'pages/index/index',
    'pages/user/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8e8e93',
    selectedColor: '#00A8EA',
    backgroundColor: '#FFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        // iconPath: '',
        // selectedIconPath: '',
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        // iconPath: '',
        // selectedIconPath: ''
      }
    ]
  }
}
