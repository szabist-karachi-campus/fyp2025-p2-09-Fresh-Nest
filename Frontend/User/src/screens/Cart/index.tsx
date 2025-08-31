import React from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { Button } from '@/components/molecules';
import { useTheme } from '@/theme';
import { useStores } from '@/stores';
import { observer } from 'mobx-react-lite';
import RNBounceable from '@freakycoder/react-native-bounceable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type CartScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Cart
>;

const Cart = observer(() => {
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const { cart } = useStores();
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { t } = useTranslation();
  const renderCartItem = ({ item }: { item: any }) => (
    <View
      style={[
        layout.col,
        layout.itemsCenter,
        gutters.marginBottom_12,
        gutters.padding_12,
        backgrounds.gray100,
        borders.rounded_16,
      ]}
    >
      <View
        style={[
          layout.row,
          layout.itemsCenter,
          gutters.marginBottom_12,
          gutters.padding_12,
          backgrounds.gray100,
          borders.rounded_4,
        ]}
      >
        <Image
          source={{ uri: item.image }}
          style={[
            {
              width: 60,
              height: 60,
            },
            borders.rounded_4,
            gutters.marginRight_12,
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
            {item.name}
          </Text>
          <Text style={[fonts.size_16, fonts.gray400]}>
            Rs. {item.price} x {item.quantity}
          </Text>
        </View>
        <View style={[layout.itemsCenter]}>
          <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
            Rs. {item.price * item.quantity}
          </Text>
        </View>
      </View>
      <View
        style={[
          layout.row,
          layout.fullWidth,
          layout.itemsCenter,
          layout.justifyBetween,
          backgrounds.gray50,
          borders.rounded_16,
          gutters.paddingVertical_8,
          gutters.paddingHorizontal_16,
        ]}
      >
        <RNBounceable
          onPress={() => cart.updateItemQuantity(item.id, item.quantity - 1)}
        >
          <FontAwesome5 name={item.quantity === 1 ? 'trash' : 'minus'} />
        </RNBounceable>
        <Text>{item.quantity}</Text>
        <RNBounceable
          onPress={() => cart.updateItemQuantity(item.id, item.quantity + 1)}
        >
          <FontAwesome5 name="plus" />
        </RNBounceable>
      </View>
    </View>
  );

  const calculateTotal = () =>
    cart.cartItems.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0,
    );

  return (
    <View style={[layout.flex_1, gutters.padding_16]}>
      <View>
        {cart.cartItems.length === 0 ? (
          <Text
            style={[
              { height: '65%' },
              layout.itemsCenter,
              layout.justifyCenter,
              fonts.size_16,
              fonts.bold,
              fonts.gray400,
            ]}
          >
            {t('cart.empty_cart_message')}
          </Text>
        ) : (
          <FlatList
            data={cart.cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            numColumns={1}
            extraData={cart.cartItems}
            style={{ height: '65%' }}
          />
        )}
      </View>

      <View
        style={[
          layout.row,
          layout.itemsCenter,
          layout.justifyBetween,
          gutters.marginTop_16,
          borders.wTop_2,
          borders.gray200,
          gutters.paddingVertical_24,
        ]}
      >
        <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
          {t('cart.total_label')}
        </Text>
        <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
          Rs. {calculateTotal()}
        </Text>
      </View>
      <Button
        label={t('cart.proceed_to_checkout_button')}
        disabled={cart.cartItems.length === 0}
        onPress={() => navigation.navigate(Paths.Checkout)}
      />
      <View
        style={[
          layout.row,
          layout.itemsCenter,
          layout.justifyBetween,
          borders.gray200,
          gutters.marginTop_8,
        ]}
      >
        <View
          style={[
            layout.flex_1,
            backgrounds.gray200,
            gutters.marginHorizontal_8,
            { height: 1 },
          ]}
        />
        <Text style={[fonts.size_12, fonts.gray400]}>OR</Text>
        <View
          style={[
            layout.flex_1,
            backgrounds.gray200,
            gutters.marginHorizontal_8,
            { height: 1 },
          ]}
        />
      </View>

      <Button
        label={t('cart.subscribe_button')}
        disabled={cart.cartItems.length === 0}
        onPress={() => navigation.navigate(Paths.CreateSubscription)}
      />
    </View>
  );
});

export default Cart;
