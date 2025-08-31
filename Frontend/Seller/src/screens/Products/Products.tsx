import RNBounceable from '@freakycoder/react-native-bounceable';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { TabPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { FloatingButton } from '@/components/molecules';
import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useGetProducts } from '@/queries/product.queries';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Products = () => {
  const { borders, layout, backgrounds, gutters, fonts } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data, isError, refetch } = useGetProducts();
  const { t } = useTranslation();
  const [productData, setProductData] = useState<Product[]>([]);
  useEffect(() => {
    if (data) {
      setProductData(data?.products || []);
    }
  }, [data]);
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
        gutters.marginBottom_12,
        gutters.marginRight_8,
      ]}
    >
      {item.isBoosted && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            right: 16,
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#FFC107',
            padding: 8,
            borderRadius: 200,
          }}
        >
          <Icons.FontAwesome5 name="bolt" size={10} color="#000" />
        </View>
      )}
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
      <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
        {item.name}
      </Text>
      <Text style={[fonts.gray200, fonts.size_12, gutters.marginBottom_8]}>
        {item.category}
      </Text>
      <Text style={[fonts.size_12, fonts.gray800]}>
        Rs. {item.price.toString()}
      </Text>
    </RNBounceable>
  );

  return (
    <SafeScreen
      isError={isError}
      onResetError={refetch}
      style={[layout.flex_1, gutters.marginHorizontal_16]}
    >
      <Text
        style={[
          fonts.bold,
          fonts.alignCenter,
          fonts.size_24,
          fonts.gray800,
          gutters.marginVertical_16,
        ]}
      >
        {t('Product.productTitle')}
      </Text>
      {productData.length > 0 ? (
        <FlashList
          data={productData}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderProductCard}
          estimatedItemSize={200}
          numColumns={2}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View
          style={[
            layout.flex_1,
            layout.itemsCenter,
            layout.justifyCenter,
            backgrounds.gray100,
            gutters.padding_16,
            borders.rounded_16,
          ]}
        >
          <Icons.MaterialCommunityIcons
            name="package-variant-closed"
            size={50}
            color="#888"
          />
          <Text style={[fonts.size_16, fonts.gray800, gutters.marginTop_8]}>
            No products available
          </Text>
        </View>
      )}
      <FloatingButton
        onPress={() => navigation.navigate(TabPaths.AddProduct)}
        icon="plus"
      />
    </SafeScreen>
  );
};

export default Products;
