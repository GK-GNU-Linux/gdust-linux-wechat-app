import { View } from '@tarojs/components'
import { classnames } from '~/tailwindcss-classnames'

type PropsType = {
  content: any
}

export const CCard = (props: PropsType): JSX.Element => {
  return (
    <View className={classnames('bg-white','border-2','rounded-md')}>
      <View className={classnames('p-2')}>
        {props.content}
      </View>
    </View>
  )
}
