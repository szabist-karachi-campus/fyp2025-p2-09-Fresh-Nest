// components/ProductCard.tsx

import React from 'react';
import { View, Text, Image } from 'react-native';
import RNBounceable from '@freakycoder/react-native-bounceable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '@/theme';

type Props = {
  item: Product;
  index: number;
  onPress?: () => void;
};

const ProductCard = ({ item, index, onPress }: Props) => {
  const { layout, gutters, fonts, backgrounds, borders, variant } = useTheme();

  return (
    <RNBounceable
      onPress={onPress}
      style={[
        borders.rounded_16,
        backgrounds.gray100,
        gutters.padding_12,
        gutters.marginTop_12,
        { width: '97%' },
      ]}
    >
      <View
        style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}
      >
        <Image
          source={{ uri: item.image?.[0] }}
          style={[layout.fullWidth, { aspectRatio: 1 }]}
          resizeMode="cover"
        />
        {item.isBoosted && index < 4 && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#FFD700',
              borderRadius: 12,
              paddingVertical: 4,
              paddingHorizontal: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <FontAwesome5 name="bolt" size={10} color="#000" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 4,
              }}
            >
              Featured
            </Text>
          </View>
        )}
      </View>

      <View style={[layout.row, layout.justifyBetween, layout.itemsCenter]}>
        <View style={{ flex: 1 }}>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
            {item.name}
          </Text>
          <Text style={[fonts.gray400, fonts.size_12]}>{item.vendor.name}</Text>
          <Text style={[fonts.gray200, fonts.size_12]}>{item.category}</Text>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
            Rs: {item.price}
            <Text style={[fonts.size_12, fonts.gray400]}> /{item.unit}</Text>
          </Text>
        </View>
        <RNBounceable
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: variant === 'dark' ? '#fff' : '#000',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            // Optional: add to cart
          }}
        >
          <FontAwesome5
            name="plus"
            size={16}
            color={variant === 'dark' ? '#000' : '#fff'}
          />
        </RNBounceable>
      </View>
    </RNBounceable>
  );
};

export default ProductCard;
