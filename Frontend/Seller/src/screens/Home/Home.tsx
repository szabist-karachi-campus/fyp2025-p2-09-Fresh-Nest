import RNBounceable from '@freakycoder/react-native-bounceable';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { TabPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useGetOrders, useGetVendorSales } from '@/queries/orders.queries';
import { useGetProducts } from '@/queries/product.queries';
import { useStores } from '@/stores';

type NavigationProp = StackNavigationProp<RootStackParamList>;

function Home() {
  const { borders, layout, backgrounds, gutters, fonts, variant } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { data: sales } = useGetVendorSales();
  const { data, isError, refetch } = useGetProducts();
  const { data: orders } = useGetOrders();
  const { user } = useStores();

  const TotalSales = sales?.totalSales || 0;
  const productData = data?.products || [];
  const orderData = orders?.orders || [];
  orderData.reverse();
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );
  const renderProductCard = ({ item }: { item: Product }) => (
    <RNBounceable
      onPress={() =>
        navigation.navigate(TabPaths.ProductDetails, { id: item._id })
      }
      style={[
        borders.rounded_16,
        backgrounds.gray100,
        gutters.padding_12,
        gutters.marginTop_12,
        gutters.marginRight_12,
        { width: 150 },
      ]}
    >
      <Image
        source={{ uri: item.image?.[0] }}
        style={[
          layout.fullWidth,
          gutters.marginBottom_8,
          borders.rounded_16,
          { aspectRatio: 1 },
        ]}
        resizeMode="cover"
      />
      <View style={[layout.row]}>
        <View>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
            {item.name}
          </Text>
          <Text style={[fonts.gray200, fonts.size_12, gutters.marginBottom_12]}>
            {item.category}
          </Text>
        </View>
      </View>
    </RNBounceable>
  );

  const renderOrderCard = ({ item }: { item: OrdersCard }) => (
    <RNBounceable
      onPress={() =>
        navigation.navigate(TabPaths.OrderDetails, { id: item._id })
      }
      style={[
        borders.rounded_16,
        backgrounds.gray100,
        gutters.padding_16,
        gutters.marginTop_12,
        gutters.marginRight_12,
        { width: 220, elevation: 2 }, // Slight shadow for depth
      ]}
    >
      {/* Order ID and Date */}
      <View style={[layout.justifyBetween, layout.row]}>
        <Text style={[fonts.bold, fonts.gray800, fonts.size_12]}>
          {t('home.order_id')}: {item.orderNo}
        </Text>
      </View>
      <View style={[gutters.marginBottom_8]}>
        <Text style={[fonts.gray400, fonts.size_12]}>
          {new Date(item.createdAt).toDateString()}
        </Text>
      </View>

      {/* Product List */}
      <View style={[gutters.marginBottom_12]}>
        {item.products.map((product, index) => (
          <View key={product._id} style={gutters.marginBottom_8}>
            <Text style={[fonts.gray800, fonts.size_12]}>• {product.name}</Text>
            <Text style={[fonts.gray400, fonts.size_12, gutters.marginLeft_8]}>
              {t('home.quantity')}: {item.quantities[index]}
            </Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View
        style={{
          borderBottomColor: '#ccc',
          borderBottomWidth: 1,
          marginBottom: 8,
        }}
      />

      {/* Payment and Total Info */}
      <Text style={[fonts.size_12, fonts.gray800, fonts.bold]}>
        {t('home.total_price')}: Rs. {item.total}
      </Text>
      <Text style={[fonts.size_12, fonts.gray400]}>
        {t('home.payment_status')}: {item.paymentStatus}
      </Text>
      <Text style={[fonts.size_12, fonts.gray400]}>
        {t('home.payment_method')}: {item.paymentMethod}
      </Text>
    </RNBounceable>
  );

  return (
    <SafeScreen
      isError={isError}
      onResetError={refetch}
      style={[layout.flex_1, gutters.marginHorizontal_16]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            borders.rounded_16,
            backgrounds.gray100,
            gutters.padding_24,
          ]}
        >
          <View>
            <Text
              style={[
                fonts.bold,
                fonts.gray200,
                fonts.size_16,
                gutters.marginBottom_16,
              ]}
            >
              {t('home.welcome')}, {user.name}
            </Text>
            <Text style={[fonts.gray800, fonts.size_12]}>
              {t('home.total_sales')}:
            </Text>
            <Text style={[fonts.bold, fonts.gray800, fonts.size_32]}>
              Rs. {TotalSales}
            </Text>
          </View>
          <RNBounceable
            onPress={() => navigation.navigate(TabPaths.Analytics)}
            style={[layout.justifyCenter, layout.itemsCenter]}
          >
            <Icons.MaterialCommunityIcons
              name="chart-box"
              size={75}
              color={variant === 'dark' ? '#fff' : '#000'}
            />
            <Text style={[fonts.size_12, fonts.gray800, fonts.alignCenter]}>
              {t('home.analytics')}
            </Text>
          </RNBounceable>
        </View>
        <View style={[layout.row, layout.justifyBetween, layout.itemsCenter]}>
          <Text
            style={[
              fonts.bold,
              fonts.gray800,
              fonts.size_16,
              gutters.marginTop_24,
            ]}
          >
            {t('home.my_products')}
          </Text>
          <RNBounceable onPress={() => navigation.navigate(TabPaths.Products)}>
            <Text
              style={[
                fonts.bold,
                fonts.gray800,
                fonts.size_12,
                gutters.marginTop_24,
              ]}
            >
              {t('home.view_all')}
            </Text>
          </RNBounceable>
        </View>
        {productData.length > 0 ? (
          <FlatList
            data={productData.slice(0, 5)}
            keyExtractor={(item: any) => item._id.toString()}
            renderItem={renderProductCard}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={[fonts.gray400, fonts.size_16, gutters.marginTop_12]}>
            No products available.
          </Text>
        )}
        <View style={[layout.row, layout.justifyBetween, layout.itemsCenter]}>
          <Text
            style={[
              fonts.bold,
              fonts.gray800,
              fonts.size_16,
              gutters.marginTop_24,
            ]}
          >
            {t('home.my_orders')}
          </Text>
          <RNBounceable onPress={() => navigation.navigate(TabPaths.Orders)}>
            <Text
              style={[
                fonts.bold,
                fonts.gray800,
                fonts.size_12,
                gutters.marginTop_24,
              ]}
            >
              {t('home.view_all')}
            </Text>
          </RNBounceable>
        </View>
        {orderData.length > 0 ? (
          <FlatList
            data={orderData.slice(0, 5)}
            keyExtractor={(item: any) => item._id.toString()}
            renderItem={renderOrderCard}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={[fonts.gray400, fonts.size_16, gutters.marginTop_12]}>
            No orders available.
          </Text>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

export default Home;
