import { toast } from '@backpackapp-io/react-native-toast';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import * as Yup from 'yup';

import { useTheme } from '@/theme';
import { TabPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { Button } from '@/components/molecules';
import * as Icons from '@/components/molecules/icons';
import Input from '@/components/molecules/Input';
import { SafeScreen } from '@/components/templates';

import { useCreateAd, useGetBidRange } from '@/queries/ad.queries';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CreateAd = ({ route }: any) => {
  const { id: productId } = route.params;
  const { gutters, fonts, layout, variant } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [showInfo, setShowInfo] = useState(false);

  const { mutateAsync } = useCreateAd();
  const { data } = useGetBidRange();

  const minBid = data?.averageBid || 0;
  const maxBid = data?.highestBid || 0;

  const [loading, setLoading] = useState(false);

  const validationCreateAdSchema = useMemo(() => {
    return Yup.object({
      budget: Yup.number()
        .typeError('Budget must be a number')
        .required('Budget is required')
        .min(1, 'Budget must be at least 1'),
      cost: Yup.number()
        .typeError('Cost must be a number')
        .required('Cost is required')
        // .min(minBid || 0, `Cost must be at least ${minBid}`)
        .test(
          'cost-less-than-budget',
          'Cost must be less than or equal to the set Budget',
          function (value) {
            return value <= this.parent.budget;
          },
        ),
    });
  }, [minBid, maxBid]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      budget: 0,
      cost: 0,
    },
    resolver: yupResolver(validationCreateAdSchema),
    mode: 'onChange',
  });

  const fields: Fields[] = [
    {
      name: 'budget',
      type: 'budget',
      placeholder: 'Budget',
      key: 'budget',
      keyboardType: 'phone-pad',
    },
    {
      name: 'cost',
      type: 'cost',
      placeholder: 'Cost per Click',
      key: 'cost',
      keyboardType: 'phone-pad',
    },
  ];

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const response = await mutateAsync({
        budget: data.budget,
        cost: data.cost,
        productId: productId,
      });
      if (response.success === true) {
        toast.success(response.message);
      } else if (response.success === false) {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Something went wrong. Please try again.';

      toast.error(errorMessage);
    } finally {
      navigation.navigate(TabPaths.Home);
      setLoading(false);
    }
  });

  return (
    <SafeScreen>
      <Text
        style={[
          fonts.bold,
          fonts.size_24,
          fonts.gray800,
          gutters.marginTop_24,
          gutters.marginBottom_24,
          fonts.alignCenter,
        ]}
      >
        Boost Listing
      </Text>
      <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
        <View style={[layout.justifyCenter, { width: '90%' }]}>
          {minBid && maxBid && (
            <Text style={{ marginBottom: 10, textAlign: 'center' }}>
              Bid Range: Min {minBid} | Max {maxBid}
            </Text>
          )}

          {fields.map((field) => {
            return (
              <Controller
                key={field.key}
                control={control}
                name={field.key as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    error={errors[field.key as 'budget' | 'cost']?.message}
                    handleChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    key={field.key}
                    secure={field.secure}
                    keyboardType={field.keyboardType || 'phone-pad'}
                    placeholder={field.placeholder}
                  />
                )}
              />
            );
          })}

          <Button label="Create Ad" loading={loading} onPress={onSubmit} />
          <View style={[layout.row, layout.itemsCenter]}>
            <Text style={[gutters.marginRight_12]}>
              How our advertising system works?
            </Text>
            <RNBounceable
              onPress={() => {
                setShowInfo(!showInfo);
              }}
            >
              <Icons.Entypo
                name="info-with-circle"
                size={16}
                color={variant === 'dark' ? '#fff' : '#000'}
                style={[gutters.marginTop_8, gutters.marginBottom_8]}
              />
            </RNBounceable>
          </View>
          {showInfo && (
            <Text
              style={[
                fonts.size_12,
                gutters.marginTop_12,
                { color: variant === 'dark' ? '#fff' : '#000' },
              ]}
            >
              {t('CreateAd.advertisementInfo')}
            </Text>
          )}
        </View>
      </View>
    </SafeScreen>
  );
};

export default CreateAd;
