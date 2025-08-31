import MasonryList from '@react-native-seoul/masonry-list';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { useTheme } from '@/theme';

import * as Icons from '@/components/molecules/icons';

import {
  useGetAdAnalytics,
  useGetBestseller,
  useGetMonthlySalesAnalytics,
  useGetOrderAnalytics,
  useGetSubscriptionAnalytics,
  useGetVendorRevenue,
} from '@/queries/analytics.queries';

const getRandomHeight = () => Math.floor(Math.random() * 20 + 100);

const SectionCard = ({
  icon,
  title,
  value,
  color,
  height,
}: SectionCardProps) => (
  <View style={[styles.card, { height }]}>
    <View style={styles.cardHeader}>
      {icon}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
  </View>
);

const Analytics = () => {
  const { layout, backgrounds, gutters, fonts } = useTheme();
  const { data: Revenue } = useGetVendorRevenue();
  const { data: OrderAnalytics } = useGetOrderAnalytics();
  const { data: BestSeller } = useGetBestseller();
  const { data: AdAnalytics } = useGetAdAnalytics();
  const { data: SubscriptionAnalytics } = useGetSubscriptionAnalytics();
  const { data: MonthlySalesAnalytics, isLoading } =
    useGetMonthlySalesAnalytics();

  const monthlyData = MonthlySalesAnalytics?.monthlyAnalytics || [];

  const barData = monthlyData.slice(-6).map((item: any) => ({
    value: item.sales,
    label: item.month.slice(0, 3),
    frontColor: '#3498db',
  }));

  if (isLoading) {
    return (
      <View
        style={[
          layout.flex_1,
          layout.itemsCenter,
          layout.justifyCenter,
          backgrounds.gray100,
        ]}
      >
        <View
          style={{
            padding: 24,
            borderRadius: 12,
            backgroundColor: '#fff',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            alignItems: 'center',
          }}
        >
          <Icons.MaterialCommunityIcons
            name="chart-box-outline"
            size={40}
            color={'#4CAF50'}
            style={{ marginBottom: 12 }}
          />
          <Text style={[fonts.size_16, fonts.bold, { marginBottom: 4 }]}>
            Loading Analytics...
          </Text>
          <Text style={[fonts.size_12, fonts.gray400]}>
            Please wait while we gather insights
          </Text>
        </View>
      </View>
    );
  }

  const analyticsData = [
    {
      title: 'Total Revenue',
      value: `Rs. ${Revenue?.totalRevenue || '0'}`,
      icon: (
        <Icons.FontAwesome5 name="money-bill-wave" size={20} color="#2ecc71" />
      ),
      color: '#2ecc71',
    },
    {
      title: 'Total Orders',
      value: `${OrderAnalytics?.analytics.totalOrders || '0'}`,
      icon: (
        <Icons.FontAwesome5 name="shopping-cart" size={20} color="#2980b9" />
      ),
      color: '#2980b9',
    },
    {
      title: 'Delivered Orders',
      value: `${OrderAnalytics?.analytics.deliveredOrders || '0'}`,
      icon: (
        <Icons.FontAwesome5 name="check-circle" size={20} color="#27ae60" />
      ),
      color: '#27ae60',
    },
    {
      title: 'Cancelled Orders',
      value: `${OrderAnalytics?.analytics.cancelledOrders || '0'}`,
      icon: (
        <Icons.FontAwesome5 name="times-circle" size={20} color="#c0392b" />
      ),
      color: '#c0392b',
    },
    {
      title: 'Order Success Rate',
      value: `${OrderAnalytics?.analytics.orderSuccessRate || '0'}`,
      icon: <Icons.MaterialIcons name="insights" size={20} color="#8e44ad" />,
      color: '#8e44ad',
    },
    {
      title: 'Active Ads',
      value: `${AdAnalytics?.analytics.totalAdsCount || '0'}`,
      icon: <Icons.FontAwesome5 name="bullhorn" size={20} color="#f39c12" />,
      color: '#f39c12',
    },
    {
      title: 'Ads Impressions',
      value: `${AdAnalytics?.analytics.totalAdClicks || '0'}`,
      icon: (
        <Icons.MaterialCommunityIcons name="radar" size={20} color="#16a085" />
      ),
      color: '#16a085',
    },
    {
      title: 'Ad Spendings',
      value: `${AdAnalytics?.analytics.totalAdSpend || '0'}`,
      icon: <Icons.FontAwesome5 name="wallet" size={20} color="#d35400" />,
      color: '#d35400',
    },
    {
      title: 'Revenue from Ads',
      value: `${AdAnalytics?.analytics.adDrivenRevenue || '0'}`,
      icon: <Icons.FontAwesome5 name="chart-line" size={20} color="#3498db" />,
      color: '#3498db',
    },
    {
      title: 'ROI',
      value: `${AdAnalytics?.analytics.ROI || '0'}`,
      icon: <Icons.FontAwesome5 name="percentage" size={20} color="#27ae60" />,
      color: '#27ae60',
    },
    {
      title: 'Subscriptions',
      value: `${SubscriptionAnalytics?.analytics.totalInvolvedSubscriptions || '0'}`,
      icon: <Icons.FontAwesome5 name="redo" size={20} color="#9b59b6" />,
      color: '#9b59b6',
    },
    {
      title: 'Best Selling Product',
      value: `${BestSeller?.bestseller?.product.name || 'N/A'} (${BestSeller?.bestseller?.totalSold || 0})`,
      icon: <Icons.FontAwesome5 name="medal" size={20} color="#f1c40f" />,
      color: '#f1c40f',
    },
  ].map((item) => ({ ...item, height: getRandomHeight() }));

  return (
    <ScrollView style={[backgrounds.gray100]}>
      <View style={[layout.flex_1, gutters.marginTop_80]}>
        <Text
          style={[
            fonts.gray800,
            fonts.size_24,
            fonts.bold,
            gutters.marginBottom_16,
            gutters.paddingHorizontal_24,
          ]}
        >
          Vendor Analytics
        </Text>

        <MasonryList
          data={analyticsData}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[gutters.paddingHorizontal_12]}
          renderItem={({ item }: any) => (
            <SectionCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              height={item.height}
            />
          )}
          onEndReachedThreshold={0.1}
        />

        <View
          style={[
            gutters.marginVertical_16,
            gutters.marginHorizontal_16,
            gutters.padding_16,
            {
              backgroundColor: '#fff',
              borderRadius: 16,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            },
          ]}
        >
          <Text
            style={[
              fonts.size_24,
              fonts.bold,
              fonts.gray800,
              gutters.marginBottom_12,
            ]}
          >
            Monthly Sales
          </Text>

          <BarChart
            data={barData}
            barWidth={28}
            barBorderRadius={6}
            frontColor="#2ecc71"
            yAxisThickness={1}
            xAxisThickness={1}
            xAxisColor="#bdc3c7"
            yAxisColor="#bdc3c7"
            isAnimated
            spacing={16}
            hideAxesAndRules={false}
            noOfSections={5}
            maxValue={
              Math.max(
                ...barData.map((item: { value: number }) => item.value),
              ) + 100
            }
            showValuesAsTopLabel
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    marginLeft: 10,
    color: '#34495e',
    flexShrink: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default Analytics;
