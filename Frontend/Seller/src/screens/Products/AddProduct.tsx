import { toast } from '@backpackapp-io/react-native-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ScrollView } from 'react-native-gesture-handler';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import { HelperText } from 'react-native-paper';
import * as Yup from 'yup';

import { useTheme } from '@/theme';
import { TabPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { Button, Input } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

import { useGetCategories } from '@/queries/category.queries';
import {
  useCreateProduct,
  useUploadProductImages,
} from '@/queries/product.queries';

type NavigationProp = StackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

const AddProductScreen = () => {
  const { gutters, backgrounds, borders, fonts, layout, variant } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const scrollRef = useRef<ScrollView>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImagePickerResponse>();

  const { data: categories } = useGetCategories();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: uploadImages } = useUploadProductImages();

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('AddProduct.productNameRequired'))
      .min(2, t('AddProduct.productNameShort'))
      .max(25, t('AddProduct.productNameLong')),
    price: Yup.number()
      .required(t('AddProduct.productPriceRequired'))
      .typeError(t('AddProduct.productPriceInvalid'))
      .min(0, 'Price must be greater than or equal to 0'),
    description: Yup.string()
      .max(500, 'Description must not exceed 500 characters')
      .required('Description is required'),
    category: Yup.string().required(t('AddProduct.productCategoryRequired')),
    unit: Yup.string().required(t('AddProduct.productUnitRequired')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
  });

  const handleSnapToItem = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (width * 0.8 + 10));
    scrollRef.current?.scrollTo({
      x: index * (width * 0.8 + 10),
      animated: true,
    });
  };

  const handleImageUpload = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 1,
      selectionLimit: 3,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorCode) {
        console.log(
          response.didCancel
            ? 'User cancelled image picker'
            : response.errorMessage,
        );
        return;
      }
      setResult(response);
    });
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);

    if (!result?.assets || result.assets.length === 0) {
      toast.error('Please upload at a product image.');
      setLoading(false);
      return;
    }

    try {
      const newProduct = await createProduct(formData);
      if (result?.assets) {
        await uploadImages({
          productId: newProduct.product._id,
          images: result.assets,
        });
      }
      toast.success('Product added successfully!');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: TabPaths.Home }],
        }),
      );
    } catch (error: any) {
      console.log(formData);
      console.error('Error adding product:', error);
      toast.error(error?.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const dropdownItems =
    categories?.categories.map((category: Category) => ({
      label: category.name,
      value: category.name,
    })) || [];

  return (
    <SafeScreen
      style={[
        layout.itemsCenter,
        layout.justifyBetween,
        gutters.marginHorizontal_24,
      ]}
    >
      <View>
        <Text
          style={[
            fonts.bold,
            fonts.size_16,
            fonts.gray800,
            gutters.marginBottom_16,
          ]}
        >
          {t('AddProduct.addProductTitle')}
        </Text>

        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={t('AddProduct.productName')}
              handleChange={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.name?.message}
              keyboardType={'default'}
            />
          )}
        />

        <Controller
          name="price"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={t('AddProduct.productPrice')}
              keyboardType="phone-pad"
              handleChange={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.price?.message}
            />
          )}
        />

        <View style={{ zIndex: 3 }}>
          <Controller
            name="category"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <DropDownPicker
                  items={dropdownItems}
                  open={categoryOpen}
                  onOpen={() => setUnitOpen(false)} // Close unit when category opens
                  value={value}
                  setOpen={setCategoryOpen}
                  setValue={onChange}
                  onChangeValue={onChange}
                  placeholder={t('AddProduct.productCategory')}
                  style={[
                    backgrounds.gray100,
                    borders.gray200,
                    borders.rounded_16,
                    gutters.marginTop_12,
                  ]}
                  textStyle={{ color: variant === 'dark' ? '#fff' : '#000' }}
                  dropDownContainerStyle={[
                    backgrounds.gray100,
                    borders.gray200,
                    borders.rounded_16,
                    gutters.marginTop_12,
                  ]}
                />
                {errors.category && (
                  <HelperText type="error">
                    {errors.category.message}
                  </HelperText>
                )}
              </>
            )}
          />
        </View>

        <View style={{ zIndex: 2 }}>
          <Controller
            name="unit"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DropDownPicker
                items={[
                  { label: 'Kg', value: 'Kg' },
                  { label: 'g', value: 'g' },
                  { label: 'Ltr', value: 'Ltr' },
                  { label: 'mL', value: 'mL' },
                  { label: 'Pcs', value: 'Pcs' },
                ]}
                open={unitOpen}
                value={value}
                setOpen={setUnitOpen}
                setValue={(callback) => onChange(callback(value))}
                placeholder={t('AddProduct.productUnit')}
                style={[
                  backgrounds.gray100,
                  borders.gray200,
                  borders.rounded_16,
                  gutters.marginTop_12,
                ]}
                textStyle={{ color: variant === 'dark' ? '#fff' : '#000' }}
                dropDownContainerStyle={[
                  backgrounds.gray100,
                  borders.gray200,
                  borders.rounded_16,
                  gutters.marginTop_12,
                ]}
              />
            )}
          />
        </View>

        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={t('AddProduct.productDescription')}
              handleChange={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.description?.message}
              keyboardType={'default'}
            />
          )}
        />
      </View>

      {result?.assets && (
        <View style={{ width: '100%', marginTop: 20 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleSnapToItem}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {result.assets.map((image, index) => (
              <View
                key={index}
                style={{
                  height: 150,
                  width: width * 0.8,
                  marginRight: 10,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Button
        label={t('AddProduct.productImage')}
        onPress={handleImageUpload}
      />
      <Button
        label={t('AddProduct.addProductButton')}
        loading={loading}
        onPress={handleSubmit(onSubmit)}
      />
    </SafeScreen>
  );
};

export default AddProductScreen;
