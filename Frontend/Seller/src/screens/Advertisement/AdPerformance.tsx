import { toast } from '@backpackapp-io/react-native-toast';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { PieChart } from 'react-native-gifted-charts';

import { useTheme } from '@/theme';

import { Button } from '@/components/molecules';
import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import {
  useGetAdByProduct,
  useGetAdPerformance,
  useGetBidRange,
  useUpdateAd,
} from '@/queries/ad.queries';

const AdPerformance = ({ route }: any) => {
  const { id: productId } = route.params;
  const { layout, gutters, fonts, borders, variant } = useTheme();
  const { t } = useTranslation();

  const { data: adData } = useGetAdByProduct(productId);
  const ad = adData?.ad;

  const { data: performance, refetch: refetchP } = useGetAdPerformance(ad?._id);
  const { data: bidRange, refetch: refetchR } = useGetBidRange();
  const { mutateAsync } = useUpdateAd();

  const [status, setStatus] = useState<string | null>(null);
  const [budget, setBudget] = useState('');
  const [cost, setCost] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (ad) {
      setStatus(ad.status);
      setBudget(ad.budget?.toString() || '');
      setCost(ad.cost?.toString() || '');
    }
  }, [ad]);

  const minBid = useMemo(
    () => Math.round(bidRange?.averageBid || 0),
    [bidRange],
  );
  const maxBid = useMemo(() => bidRange?.highestBid || 0, [bidRange]);

  const spent = performance?.spent || 0;
  const remaining = ad?.budget || 0;
  const total = spent + remaining;

  const pieData = useMemo(
    () => [
      { value: spent, color: '#e74c3c' },
      { value: remaining, color: '#2ecc71' },
    ],
    [spent, remaining],
  );

  const handleStatusToggle = async () => {
    if (!ad || !status) return;

    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(newStatus);
    setLoading(true);

    try {
      const response = await mutateAsync({
        id: ad._id,
        values: {
          budget: Number(budget),
          cost: Number(cost),
          status: newStatus,
        },
      });

      response.success
        ? toast.success(response.message)
        : toast.error(response.message);
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!ad) return;

    const newBudget = Number(budget);
    const newCost = Number(cost);

    if (isNaN(newBudget) || isNaN(newCost) || newBudget < 0 || newCost < 0) {
      toast.error('Please enter valid positive numbers.');
      return;
    }

    setLoading(true);

    try {
      const response = await mutateAsync({
        id: ad._id,
        values: {
          budget: newBudget,
          cost: newCost,
          status,
        },
      });

      response.success
        ? toast.success('Budget and cost updated.')
        : toast.error(response.message);
    } catch {
      toast.error('Update failed. Try again.');
    } finally {
      setLoading(false);
      setIsEditable(false);
      refetchP();
      refetchR();
    }
  };

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.gray800,
            fonts.alignCenter,
            gutters.marginTop_8,
          ]}
        >
          Ads Analytics
        </Text>

        <View
          style={[
            layout.flex_1,
            layout.itemsCenter,
            gutters.marginHorizontal_16,
            gutters.marginTop_24,
          ]}
        >
          <View
            style={[
              {
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              borders.w_2,
              borders.gray100,
              layout.fullWidth,
              layout.itemsCenter,
              borders.rounded_16,
              gutters.paddingVertical_24,
            ]}
          >
            <PieChart
              data={pieData}
              donut
              radius={100}
              innerRadius={70}
              centerLabelComponent={() => (
                <View style={layout.itemsCenter}>
                  <Text style={[fonts.bold, fonts.size_24]}>Rs {total}</Text>
                  <Text style={fonts.size_12}>Total Budget</Text>
                </View>
              )}
            />

            <View style={[gutters.marginTop_24, layout.itemsCenter]}>
              <Text style={[fonts.size_16, fonts.gray800]}>
                Spent: Rs {spent}
              </Text>
              <Text style={[fonts.size_16, fonts.gray800]}>
                Remaining: Rs {remaining}
              </Text>
              <Text
                style={[fonts.size_16, fonts.gray800, gutters.marginTop_12]}
              >
                Clicks: {ad?.clicks || 0} Views: {ad?.views || 0}
              </Text>
            </View>
          </View>

          {minBid && maxBid && (
            <Text
              style={[
                fonts.alignCenter,
                fonts.gray800,
                gutters.marginVertical_12,
              ]}
            >
              Bid Range: Min {minBid} | Max {maxBid}
            </Text>
          )}

          <View
            style={[
              {
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              layout.fullWidth,
              gutters.padding_16,
              borders.w_2,
              borders.gray100,
              borders.rounded_16,
            ]}
          >
            <Text
              style={[
                fonts.gray800,
                fonts.size_16,
                fonts.bold,
                gutters.marginBottom_8,
              ]}
            >
              Remaining Budget
            </Text>

            <TextInput
              placeholder="Remaining Budget"
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
              editable={isEditable}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
                backgroundColor: '#f9f9f9',
              }}
            />

            <Text
              style={[
                fonts.gray800,
                fonts.size_16,
                fonts.bold,
                gutters.marginBottom_8,
              ]}
            >
              Cost per Click
            </Text>

            <TextInput
              placeholder="Cost"
              keyboardType="numeric"
              value={cost}
              onChangeText={setCost}
              editable={isEditable}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
                fontSize: 16,
                backgroundColor: '#f9f9f9',
              }}
            />

            <View style={[layout.row, layout.itemsCenter]}>
              <Text style={[gutters.marginRight_8, fonts.gray800]}>
                How our advertising system works?
              </Text>
              <RNBounceable onPress={() => setShowInfo(!showInfo)}>
                <Icons.Entypo
                  name="info-with-circle"
                  size={15}
                  color={variant === 'dark' ? '#fff' : '#000'}
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

            <Button
              label={isEditable ? 'Save Changes' : 'Modify'}
              onPress={isEditable ? saveChanges : () => setIsEditable(true)}
              loading={loading}
            />
          </View>

          <Button
            label={status === 'Active' ? 'Deactivate' : 'Activate'}
            onPress={handleStatusToggle}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default AdPerformance;
