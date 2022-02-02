const range = (size) =>
  Object.fromEntries(
    [...Array(size).keys()]
      .slice(1)
      .map((i) => [`${ i }_${ size }`, `${ (i / size) * 100 }%`])
  )

module.exports = {
  content: ['./src/**/*.{html,js,tsx}'],
  preflight: false,
  separator: '_',
  compile: false,
  globalUtility: false,
  darkMode: 'media',
  corePlugins: {
    space: false,
    divideStyle: false,
    divideWidth: false,
    divideColor: false,
    divideOpacity: false,
    // 涉及到通配符（*），wx 小程序不支持
    ringWidth: false,
    ringColor: false,
    ringOpacity: false,
    ringOffsetWidth: false,
    ringOffsetColor: false,
    // web 浏览器相关功能，wx 小程序不支持
    appearance: false,
    cursor: false,
    outline: false,
    placeholderColor: false,
    pointerEvents: false,
    stroke: false,
    tableLayout: false,
    userSelect: false
  },
  exclude: [/([0-9]{1,}[.][0-9]*)$/],
  theme: {
    width: (theme) => ({
      auto: 'auto',
      full: '100%',
      screen: '100vw',
      ...Object.assign(...[2, 3, 4, 5, 6, 12].map(range)),
      ...theme('spacing')
    }),
    height: (theme) => ({
      auto: 'auto',
      full: '100%',
      screen: '100vh',
      ...Object.assign(...[2, 3, 4, 5, 6, 12].map(range)),
      ...theme('spacing')
    }),
    maxHeight: {
      full: '100%',
      screen: '100vh'
    }
  },
}
