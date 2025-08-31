import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStores } from '@/stores';
import RNBounceable from '@freakycoder/react-native-bounceable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { FlashList } from '@shopify/flash-list';
import {
  useClickCount,
  useViewCount,
  useGetAds,
  useGetProducts,
} from '@/queries/product.queries';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Home
>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();
  const { layout, gutters, fonts, variant, borders, backgrounds } = useTheme();
  const { data: productData } = useGetProducts();
  const { data: Ads } = useGetAds();
  const { mutateAsync: clickCount } = useClickCount();
  const { mutateAsync: viewCount } = useViewCount();
  const { user, product } = useStores();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (productData) {
      let productsTemp: Product[] = [];
      for (let i = 0; i < productData.length; i++) {
        let productTemp: Product;
        productTemp = {
          id: productData[i]._id,
          name: productData[i].name,
          price: productData[i].price,
          description: productData[i].description,
          category: productData[i].category,
          vendor: productData[i].vendor,
          image: productData[i].image,
          isBoosted: productData[i].isBoosted,
          unit: productData[i].unit,
        };
        productsTemp.push(productTemp);
      }
      product.setMany({
        products: productsTemp,
      });
    }
  }, [productData]);

  useEffect(() => {
    const productIds = Ads?.map((ad: { product: string }) => ad.product);

    if (!productIds || !product.products) return;

    const boostedProducts = productIds
      .map((id: string) => product.products.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    const nonBoostedProducts = product.products.filter(
      (p) => !productIds.includes(p.id),
    );

    const sorted = [...boostedProducts, ...nonBoostedProducts];

    setProducts(sorted);
  }, [product.products, Ads]);

  const viewedProductIds = useRef<Set<string>>(new Set());

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: Product }> }) => {
      viewableItems.forEach(({ item }: { item: Product }) => {
        console.log(item.id);
        if (!viewedProductIds.current.has(item.id)) {
          viewedProductIds.current.add(item.id);
          viewCount(item.id);
        }
      });
    },
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  });

  const renderProductCard = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => (
    <RNBounceable
      onPress={async () => {
        navigation.navigate(Paths.Products, { id: item.id });
        if (index < 4) {
          console.log(item.id);
          await clickCount(item.id);
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
          <Text style={[fonts.gray400, fonts.size_12]}>{item.vendor.name}</Text>
          <Text style={[fonts.gray200, fonts.size_12, gutters.marginBottom_12]}>
            {item.category}
          </Text>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_16]}>
            Rs: {String(item.price)}
            <Text style={[fonts.size_12, fonts.gray400]}> /{item?.unit}</Text>
          </Text>
        </View>
        <View style={[layout.flex_1, layout.itemsEnd, layout.justifyCenter]}>
          <FontAwesome5
            name="plus"
            size={18}
            color={variant === 'dark' ? '#fff' : '#000'}
          />
        </View>
      </View>
    </RNBounceable>
  );

  const filteredProducts = products.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <>
      <View style={[layout.flex_1, gutters.marginHorizontal_16]}>
        <View
          style={[
            borders.rounded_16,
            backgrounds.gray100,
            gutters.padding_24,
            { marginTop: 60 },
          ]}
        >
          <Text
            style={[
              fonts.bold,
              fonts.gray200,
              fonts.size_16,
              gutters.marginBottom_12,
            ]}
          >
            {t('home.welcome_message')}
          </Text>
          <Text style={[fonts.bold, fonts.gray800, fonts.size_24]}>
            {user.name}
          </Text>
        </View>

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
            placeholder={t('home.search_placeholder')}
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductCard}
          numColumns={2}
          estimatedItemSize={250}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
        />
      </View>
    </>
  );
};

export default Home;
