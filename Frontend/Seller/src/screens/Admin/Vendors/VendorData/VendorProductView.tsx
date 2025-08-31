import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

type ProductScreenProps = RouteProp<
  RootStackParamList,
  AdminPaths.VendorProductView
>;

const Product = () => {
  const route = useRoute<ProductScreenProps>();
  const { product: productDetails, vendorName } = route.params;
  const { layout, gutters, fonts } = useTheme();

  if (!productDetails) {
    return (
      <View
        style={[
          layout.flex_1,
          gutters.padding_16,
          layout.justifyCenter,
          layout.itemsCenter,
        ]}
      >
        <Text style={[fonts.bold, fonts.size_24, fonts.gray800]}>
          Product not found.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        layout.flex_1,
        gutters.padding_16,
        layout.justifyBetween,
        gutters.marginTop_80,
      ]}
    >
      <View>
        <Image
          source={{ uri: productDetails.image?.[0] }}
          style={[
            layout.fullWidth,
            { aspectRatio: 1, borderRadius: 16, marginBottom: 24 },
          ]}
          resizeMode="cover"
        />

        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.gray800,
            gutters.marginBottom_8,
          ]}
        >
          {productDetails.name}
        </Text>
        <Text style={[fonts.size_12, fonts.gray400]}>By: {vendorName}</Text>
        <Text style={[fonts.size_12, fonts.gray400, gutters.marginBottom_16]}>
          Category: {productDetails.category}
        </Text>

        {/* Price & Quantity */}
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.marginBottom_24,
          ]}
        >
          <Text style={[fonts.bold, fonts.size_32, fonts.gray800]}>
            Rs. {productDetails.price}
            <Text style={[fonts.size_12, fonts.gray400]}>
              {' '}
              /{productDetails.unit}
            </Text>
          </Text>
        </View>

        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.gray800,
            gutters.marginBottom_8,
          ]}
        >
          Description
        </Text>
        <Text style={[fonts.size_16, fonts.gray800]}>
          {productDetails.description || 'No description available.'}
        </Text>
      </View>
    </View>
  );
};

export default Product;
