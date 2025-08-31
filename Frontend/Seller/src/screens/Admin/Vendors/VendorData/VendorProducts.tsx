import RNBounceable from '@freakycoder/react-native-bounceable';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { FontAwesome5 } from '@/components/molecules/icons';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  AdminPaths.VendorProducts
>;
type OTPScreenRouteProp = RouteProp<
  RootStackParamList,
  AdminPaths.VendorProducts
>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { layout, gutters, fonts, variant, borders, backgrounds } = useTheme();
  const [search, setSearch] = useState('');
  const route = useRoute<OTPScreenRouteProp>();
  const { products, vendorName } = route.params;

  const renderProductCard = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => (
    <RNBounceable
      onPress={async () => {
        navigation.navigate(AdminPaths.VendorProductView, {
          product: item,
          vendorName,
        });
        if (index < 4) {
        }
      }}
      style={[
        borders.rounded_16,
        backgrounds.gray100,
        gutters.padding_12,
        gutters.marginTop_12,
        { width: '97%' },
      ]}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.image?.[0] }}
          style={[
            layout.fullWidth,
            gutters.marginBottom_12,
            { aspectRatio: 1, borderRadius: 16 },
          ]}
          resizeMode="cover"
        />
        {item.isBoosted && index < 4 && (
          <View
            style={[
              {
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'gold',
              },
              borders.rounded_16,
              gutters.padding_8,
              layout.flex_1,
              layout.row,
              layout.itemsCenter,
            ]}
          >
            <FontAwesome5 name="bolt" size={8} color="#000" />
            <Text
              style={[
                fonts.size_8,
                fonts.bold,
                { color: '#000', marginLeft: 4 },
              ]}
            >
              featured
            </Text>
          </View>
        )}
      </View>

      <View style={[layout.row]}>
        <View>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
            {item.name}
          </Text>
          <Text style={[fonts.gray400, fonts.size_12]}>{vendorName}</Text>
          <Text style={[fonts.gray200, fonts.size_12, gutters.marginBottom_12]}>
            {item.category}
          </Text>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
            Rs: {String(item.price)}
            <Text style={[fonts.size_12, fonts.gray400]}> /{item?.unit}</Text>
          </Text>
        </View>
      </View>
    </RNBounceable>
  );

  const filteredProducts = products.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <View
      style={[layout.flex_1, gutters.marginHorizontal_16, gutters.marginTop_80]}
    >
      <View
        style={[
          layout.row,
          layout.itemsCenter,
          layout.justifyBetween,
          gutters.marginBottom_12,
        ]}
      >
        <TextInput
          style={[
            borders.rounded_16,
            backgrounds.gray100,
            gutters.padding_12,
            fonts.size_16,
            fonts.gray800,
            gutters.marginTop_12,
            gutters.marginRight_12,
            { width: '85%', color: variant === 'dark' ? '#fff' : '#000' },
          ]}
          placeholder={'Search products...'}
          placeholderTextColor={variant === 'dark' ? '#fff' : '#000'}
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
        <RNBounceable
          style={[
            borders.rounded_16,
            backgrounds.gray100,
            gutters.padding_12,
            gutters.marginTop_12,
          ]}
        >
          <FontAwesome5
            name="search"
            size={20}
            color={variant === 'dark' ? '#fff' : '#000'}
          />
        </RNBounceable>
      </View>
      <FlashList
        data={filteredProducts}
        keyExtractor={(item) => item.id + item.name}
        renderItem={renderProductCard}
        numColumns={2}
        estimatedItemSize={250}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Home;
