export default {
  pages: [
    'pages/index/index',
    'pages/user/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#089def',
    navigationBarTitleText: '名字是啥',
    navigationBarTextStyle: 'white'
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
        iconPath: 'assets/images/index/index.png',
        selectedIconPath: 'assets/images/index/index@active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/images/index/more.png',
        selectedIconPath: 'assets/images/index/more@active.png'
      }
    ]
  }
}
