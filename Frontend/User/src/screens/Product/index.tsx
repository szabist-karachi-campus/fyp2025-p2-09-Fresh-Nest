import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeScreen } from '@/components/template';
import { useTheme } from '@/theme';
import { useStores } from '@/stores';
import RNBounceable from '@freakycoder/react-native-bounceable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Button } from '@/components/molecules';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type ProductScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Products
>;

type ProductScreenProps = RouteProp<RootStackParamList, Paths.Products>;

const Product = () => {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const route = useRoute<ProductScreenProps>();
  const { id } = route.params;
  const { layout, gutters, fonts, variant, backgrounds } = useTheme();
  const { product, cart } = useStores();
  const productDetails = product.products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const total = (Number(productDetails?.price) || 0) * quantity;

  if (!productDetails) {
    return (
      <SafeScreen>
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
      </SafeScreen>
    );
  }

  const handleAddToCart = () => {
    if (!productDetails) return;

    cart.addToCart({
      id: productDetails.id,
      name: productDetails.name,
      price: Number(productDetails.price),
      quantity,
      total,
      image: productDetails.image?.[0],
    });
    navigation.goBack();
  };

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.padding_16, layout.justifyBetween]}>
        {/* Top Section: Image + Info */}
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
          <Text style={[fonts.size_12, fonts.gray400]}>
            By: {productDetails.vendor.name}
          </Text>
          <Text style={[fonts.size_12, fonts.gray400, gutters.marginBottom_16]}>
            Category: {productDetails.category}
          </Text>

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

            <View
              style={[
                layout.flex_1,
                layout.row,
                layout.itemsCenter,
                layout.justifyBetween,
                gutters.marginLeft_80,
              ]}
            >
              <RNBounceable
                style={[
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  },
                  layout.itemsCenter,
                  layout.justifyCenter,
                  backgrounds.gray200,
                  quantity === 0 && { opacity: 0.3 },
                ]}
                onPress={() => quantity > 0 && setQuantity(quantity - 1)}
                disabled={quantity === 0}
              >
                <FontAwesome5
                  name="minus"
                  size={18}
                  color={variant == 'dark' ? '#000' : '#fff'}
                />
              </RNBounceable>

              <Text
                style={[
                  fonts.bold,
                  fonts.size_24,
                  fonts.gray800,
                  gutters.marginHorizontal_12,
                ]}
              >
                {quantity}
              </Text>

              <RNBounceable
                style={[
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  },
                  layout.itemsCenter,
                  layout.justifyCenter,
                  backgrounds.gray200,
                ]}
                onPress={() => setQuantity(quantity + 1)}
              >
                <FontAwesome5
                  name="plus"
                  size={18}
                  color={variant == 'dark' ? '#000' : '#fff'}
                />
              </RNBounceable>
            </View>
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

        <Button
          label="Add to Cart"
          onPress={handleAddToCart}
          disabled={quantity === 0}
        />
      </View>
    </SafeScreen>
  );
};

export default Product;
