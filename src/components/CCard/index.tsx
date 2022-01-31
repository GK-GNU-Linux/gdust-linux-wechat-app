import { View } from '@tarojs/components'

type PropsType = {
  content: any
}

export const CCard = (props: PropsType): JSX.Element => {
  return (
    <View className={'bg-white border-2'}>
      <View>
        {props.content}
      </View>
    </View>
  )
}
