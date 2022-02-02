import { View } from '@tarojs/components'
import { CCard } from '@components/CCard'
import { classnames } from '~/tailwindcss-classnames'

const User = (): JSX.Element => {
  const infoView = () => {
    return <View>

    </View>
  }
  return (
    <View className='User GeneralBg'>
      <View className={classnames('p-4')}>
        <CCard content={infoView} />
      </View>
    </View>
  )
}

export default User
