import { toast } from '@backpackapp-io/react-native-toast';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Yup from 'yup';

import { useTheme } from '@/theme';
import { TabPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import Button from '@/components/molecules/Button/Button';
import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useGetAdByProduct } from '@/queries/ad.queries';
import { useGetCategories } from '@/queries/category.queries';
import {
  useDeleteProduct,
  useGetProduct,
  useUpdateProduct,
} from '@/queries/product.queries';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProductDetails = ({ route }: any) => {
  const { id: productId } = route.params;
  const { layout, fonts, gutters, backgrounds, borders, variant } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data, isError, refetch } = useGetProduct(productId);
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { data: categories } = useGetCategories();
  const { data: adData } = useGetAdByProduct(productId);

  const product = data?.product;
  const [open, setOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const fields = [
    {
      name: 'Product Name',
      placeholder: 'Product Name',
      key: 'productName',
      keyboardType: 'default',
    },
    {
      name: 'Category',
      placeholder: 'Category',
      key: 'category',
      keyboardType: 'default',
    },
    {
      name: 'Price',
      placeholder: 'price',
      key: 'price',
      keyboardType: 'number-pad',
    },
    {
      name: 'Description',
      placeholder: 'Description',
      key: 'description',
      keyboardType: 'default',
    },
  ];

  const validationProductSchema = Yup.object({
    productName: Yup.string()
      .trim()
      .required('Product Name is required')
      .min(3, 'Product Name must be at least 3 characters'),
    category: Yup.string()
      .trim()
      .required('Category is required')
      .min(3, 'Category must be at least 3 characters'),
    price: Yup.string()
      .required('Price is required')
      .min(1, 'Price must be at least 1'),
    description: Yup.string()
      .trim()
      .required('Description is required')
      .min(3, 'Description must be at least 3 characters'),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productName: '',
      category: '',
      price: '0',
      description: '',
    },
    resolver: yupResolver(validationProductSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (data?.product) {
      reset({
        productName: data.product.name,
        category: data.product.category,
        price: data.product.price.toString(),
        description: data.product.description,
      });
    }
  }, [data]);

  const handleDeleteProduct = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteProduct(productId);
              if (response.success === true) {
                toast.success(
                  response.message || 'Product deleted successfully!',
                );
                navigation.goBack();
              }
            } catch (error: any) {
              toast.error(error.message || 'Failed to delete the product.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleUpdateProduct = handleSubmit(async (data) => {
    try {
      const response = await updateProduct({
        values: {
          name: data.productName,
          category: data.category,
          price: parseFloat(data.price),
          description: data.description,
        },
        productId,
      });
      if (response.success === true) {
        toast.success(response.message || 'Product updated successfully!');
        setIsEditable(false);
        refetch();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update the product.');
    }
  });

  const navigate = () => {
    adData.success
      ? navigation.navigate(TabPaths.AdPerformance, { id: productId })
      : navigation.navigate(TabPaths.CreateAd, { id: productId });
  };

  if (isError) {
    return (
      <SafeScreen>
        <Text style={[fonts.bold, fonts.size_16]}>
          Failed to load product details.
        </Text>
        <Button label="Retry" onPress={refetch} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={gutters.marginHorizontal_8}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[layout.flex_1, gutters.marginHorizontal_16]}
      >
        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.gray800,
            gutters.marginBottom_16,
          ]}
        >
          {product?.name}
        </Text>
        <Image
          source={{ uri: product?.image?.[0] }}
          style={[
            layout.fullWidth,
            gutters.marginBottom_12,
            borders.rounded_4,
            { aspectRatio: 1 },
          ]}
          resizeMode="cover"
        />

        {fields.map((field, index) => (
          <React.Fragment key={field.key}>
            <Text
              style={[
                fonts.bold,
                fonts.gray800,
                fonts.size_16,
                gutters.marginBottom_8,
              ]}
            >
              {field.name}
            </Text>
            <Controller
              key={field.key}
              control={control}
              name={field.key as any}
              render={({ field: { onChange, value } }) =>
                field.key === 'category' ? (
                  <DropDownPicker
                    items={
                      categories?.categories.map((category: Category) => ({
                        label: category.name,
                        value: category.name,
                      })) || []
                    }
                    open={open}
                    value={value}
                    setOpen={setOpen}
                    setValue={onChange}
                    onChangeValue={(val) => onChange(val)}
                    placeholder="Select Category"
                    disabled={!isEditable}
                    style={[
                      backgrounds.gray100,
                      borders.gray200,
                      borders.rounded_4,
                    ]}
                    textStyle={{
                      color: variant === 'dark' ? '#fff' : '#000',
                    }}
                    dropDownContainerStyle={[
                      backgrounds.gray100,
                      borders.gray200,
                      borders.rounded_4,
                    ]}
                    ArrowDownIconComponent={() => (
                      <Icons.MaterialIcons
                        name="keyboard-arrow-down"
                        size={20}
                        color={variant === 'dark' ? '#fff' : '#000'}
                      />
                    )}
                  />
                ) : (
                  <TextInput
                    key={field.key + index}
                    style={[
                      borders.rounded_4,
                      borders.w_1,
                      borders.gray200,
                      fonts.gray800,
                      backgrounds.gray100,
                      gutters.padding_16,
                    ]}
                    value={value}
                    editable={isEditable}
                    onChangeText={onChange}
                    multiline={field.key === 'description'}
                  />
                )
              }
            />
            <Text style={{ color: 'red', marginVertical: 2 }}>
              {
                errors[
                  field.key as
                    | 'productName'
                    | 'category'
                    | 'price'
                    | 'description'
                ]?.message
              }
            </Text>
          </React.Fragment>
        ))}

        {isEditable && (
          <Button label="Update Product" onPress={handleUpdateProduct} />
        )}
      </ScrollView>

      <View style={styles.floatingContainer}>
        <RNBounceable
          style={[styles.fab, { backgroundColor: '#FFC107' }]}
          onPress={navigate}
        >
          <Icons.FontAwesome5 name="bolt" size={20} color="#000" />
        </RNBounceable>

        <RNBounceable
          style={[styles.fab, { backgroundColor: '#2196F3' }]}
          onPress={() => setIsEditable(!isEditable)}
        >
          <Icons.MaterialIcons
            name={isEditable ? 'save' : 'edit'}
            size={24}
            color="#fff"
          />
        </RNBounceable>

        <RNBounceable
          style={[styles.fab, { backgroundColor: '#F44336' }]}
          onPress={handleDeleteProduct}
        >
          <Icons.MaterialIcons name="delete-outline" size={24} color="#fff" />
        </RNBounceable>
      </View>
    </SafeScreen>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
