import React from 'react';
import { View, Text } from 'react-native';
import { useStores } from '@/stores';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import * as Icons from '@/components/molecules/icons';
import { useTheme } from '@/theme';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/molecules';
import { SafeScreen } from '@/components/template';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useGetWalletBalance } from '@/queries/auth.queries';

type ProfileScreenNavigationProps = StackNavigationProp<
  RootStackParamList,
  Paths.Profile
>;

const Profile = () => {
  const navigation = useNavigation<ProfileScreenNavigationProps>();
  const { user } = useStores();
  const { data: walletData } = useGetWalletBalance();
  const { layout, borders, backgrounds, gutters, fonts, variant } = useTheme();

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.margin_16]}>
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.marginBottom_24,
          ]}
        >
          <Text style={[fonts.bold, fonts.size_24, fonts.gray800]}>
            Profile
          </Text>
          <RNBounceable
            style={[
              layout.row,
              layout.itemsCenter,
              borders.rounded_16,
              gutters.paddingHorizontal_12,
              gutters.paddingVertical_8,
              { backgroundColor: 'green' },
            ]}
            onPress={() =>
              navigation.navigate(Paths.WalletDetails, {
                id: walletData.wallet._id,
              })
            }
          >
            <Icons.SimpleLineIcons
              name="wallet"
              size={20}
              color={'#fff'}
              style={gutters.marginRight_8}
            />
            <Text style={[fonts.bold, fonts.size_12, { color: '#fff' }]}>
              {walletData?.wallet?.balance ?? 0}
            </Text>
          </RNBounceable>
        </View>

        <View
          style={[
            layout.itemsCenter,
            layout.justifyCenter,
            gutters.marginTop_32,
          ]}
        >
          <View
            style={[
              layout.itemsCenter,
              layout.justifyCenter,
              borders.w_1,
              borders.gray100,
              backgrounds.gray100,
              { borderRadius: 100, width: 150, height: 150 },
            ]}
          >
            <FontAwesome5Icon
              name="user-alt"
              size={80}
              color={variant === 'dark' ? '#fff' : '#000'}
            />
          </View>

          <Text
            style={[
              fonts.bold,
              fonts.size_32,
              fonts.gray800,
              gutters.marginVertical_24,
            ]}
          >
            {user.name}
          </Text>

          <Text
            style={[
              fonts.bold,
              fonts.size_16,
              fonts.gray800,
              gutters.marginBottom_16,
            ]}
          >
            {user.email}
          </Text>

          <Text
            style={[
              fonts.bold,
              fonts.size_16,
              fonts.gray800,
              gutters.marginBottom_12,
            ]}
          >
            {user.phone}
          </Text>

          <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
            {user.address}
          </Text>
          {user.address && (
            <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
              {user.city}, {user.state}, {user.postalcode}
            </Text>
          )}
        </View>
        <Button
          label="View Orders"
          onPress={() => navigation.navigate(Paths.Orders)}
        />
        <Button
          label="View Subscriptions"
          onPress={() => navigation.navigate(Paths.Subscriptions)}
        />
        <Button
          label="Settings"
          onPress={() => navigation.navigate(Paths.Settings)}
        />
      </View>
    </SafeScreen>
  );
};

export default Profile;
