import { View } from '@tarojs/components'
import { classnames } from '~/tailwindcss-classnames'

type PropsType = {
  content: any
}

export const CCard = (props: PropsType): JSX.Element => {
  return (
    <View className={classnames('bg-white','border-2','border-gray-200','rounded-md','shadow-2xl','bg-blend-screen')}>
      <View className={classnames('p-4')}>
        {props.content}
      </View>
    </View>
  )
}
