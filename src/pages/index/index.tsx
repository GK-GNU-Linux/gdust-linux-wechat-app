import { Image, Text, View } from '@tarojs/components'
import './index.scss'
import { CCard } from '@components/CCard'
import { classnames } from '~/tailwindcss-classnames'
import Kb from '@img/core/kb.png'
import Cj from '@img/core/cj.png'
// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type navItem = {
  icon: string,
  text: string,
}

type navType = Array<navItem>

export const Index = (): JSX.Element => {
  const navList: navType = [
    {
      icon: Kb,
      text: '课程表'
    },
    {
      icon: Cj,
      text: '查询成绩'
    }
  ]

  const navCard = () => {
    return <View className={classnames('grid', 'grid-cols-4', 'gap-4')}>
      {
        navList &&
        navList.map((item, index) => (
          <View key={index} className={classnames('flex', 'flex-col', 'items-center')}>
            <Image className={classnames('w-10', 'h-10', 'mb-1')} src={item.icon} />
            <Text className={classnames('text-xs')}>{item.text}</Text>
          </View>
        ))
      }
    </View>
  }

  return (
    <View className='Index'>
      <View className={classnames('p-2')}>
        <CCard content={navCard()} />
      </View>
    </View>
  )

}

export default Index

