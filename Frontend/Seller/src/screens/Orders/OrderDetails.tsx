import { toast } from '@backpackapp-io/react-native-toast';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { useTheme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';

import { Button, FontAwesome5 } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

import {
  useCancelOrder,
  useGetOrders,
  useUpdateOrderStatus,
} from '@/queries/orders.queries';

//@ts-expect-error
Geocoder.init(process.env.GOOGLE_API_KEY);

type NavigationProps = StackNavigationProp<RootStackParamList>;

const OrderDetails = ({ route }: any) => {
  const { id: orderId } = route.params;
  const navigation = useNavigation<NavigationProps>();
  const { layout, gutters, fonts, borders } = useTheme();
  const { data } = useGetOrders();
  const { mutateAsync } = useUpdateOrderStatus();
  const orders = data?.orders || [];
  orders.sort(
    (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const googlePlacesRef = useRef(null);
  const order = orders.find((order: { _id: any }) => order._id === orderId);
  const { mutateAsync: cancelOrder } = useCancelOrder();
  const [status, setStatus] = useState(order?.status || 'Pending');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (isModalVisible && order?.user?.address) {
      const forwardGeocodeAddress = async () => {
        try {
          const response = await Geocoder.from(order.user.address);
          const { lat, lng } = response.results[0].geometry.location;

          setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
          setSelectedLocation({ latitude: lat, longitude: lng });

          if (googlePlacesRef.current) {
            // @ts-ignore
            googlePlacesRef.current.setAddressText(order.user.address);
          }
        } catch (error) {
          console.error('Error forward geocoding:', error);
        }
      };

      forwardGeocodeAddress();
    }
  }, [isModalVisible]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      },
      (error) => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  if (!order) {
    return (
      <SafeScreen>
        <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
          <Text style={[fonts.size_16, fonts.gray800]}>
            {t('OrderDetails.noOrderDetails')}
          </Text>
        </View>
      </SafeScreen>
    );
  }

  const handleStatusUpdate = async () => {
    try {
      let newStatus = status;
      if (status === 'Pending') {
        newStatus = 'Processing';
      } else if (status === 'Processing') {
        newStatus = 'Delivered';
      }
      setStatus(newStatus);
      await mutateAsync({
        status: newStatus,
        orderId,
      });
    } catch (error) {
      setStatus(status);
      console.error('Failed to update status:', error);
    }
  };

  const handleCancelOrder = async () => {
    try {
      //@ts-ignore
      await cancelOrder({ orderNo: order.orderNo });
      navigation.goBack();
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'green';
      case 'Processing':
        return 'orange';
      case 'Cancelled':
        return 'red';
      case 'Pending':
        return 'gray';
      default:
        return 'black';
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });

    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0]?.formatted_address;
      if (address && googlePlacesRef.current) {
        // @ts-ignore
        googlePlacesRef.current.setAddressText(address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  return (
    <SafeScreen>
      <Modal visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              position: 'absolute',
              top: 50,
              left: 10,
              right: 10,
              zIndex: 10,
              backgroundColor: 'white',
              borderRadius: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="Search for location"
              fetchDetails={true}
              query={{
                key: process.env.GOOGLE_API_KEY,
                language: 'en',
              }}
              onPress={(data, details = null) => {
                if (details?.geometry?.location) {
                  const { lat, lng } = details.geometry.location;
                  setSelectedLocation({ latitude: lat, longitude: lng });
                  setRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                  });
                }
              }}
              styles={{
                textInputContainer: {
                  backgroundColor: 'white',
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                },
                textInput: {
                  height: 40,
                  color: '#5d5d5d',
                  fontSize: 16,
                },
                predefinedPlacesDescription: {
                  color: '#1faadb',
                },
              }}
            />
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            region={region}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
              />
            )}
          </MapView>

          <View
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#1faadb',
                padding: 20,
                borderRadius: 30,
                marginBottom: 10,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              onPress={() => {
                if (selectedLocation) {
                  const { latitude, longitude } = selectedLocation;
                  const url = Platform.select({
                    ios: `maps://app?ll=${latitude},${longitude}`,
                    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
                  });
                  if (url) {
                    Linking.openURL(url);
                  } else {
                    toast.error('Unable to generate navigation URL.');
                  }
                } else {
                  toast.error('Please select a location first.');
                }
              }}
            >
              <FontAwesome5 name="route" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#ff4d4d',
                padding: 20,
                borderRadius: 100,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              onPress={toggleModal}
            >
              <FontAwesome5 name="times" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[layout.flex_1, gutters.marginHorizontal_16]}
      >
        <View
          style={[
            gutters.padding_16,
            borders.rounded_16,
            gutters.marginBottom_24,
          ]}
        >
          <Text
            style={[
              fonts.bold,
              fonts.size_24,
              gutters.marginBottom_16,
              fonts.gray800,
            ]}
          >
            {t('OrderDetails.orderSummary')}
          </Text>
          <View
            style={[layout.row, layout.justifyBetween, gutters.marginBottom_8]}
          >
            <Text style={[fonts.size_16, fonts.gray800]}>
              {t('OrderDetails.orderId')}:
            </Text>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
              {order.orderNo}
            </Text>
          </View>
          <View
            style={[layout.row, layout.justifyBetween, gutters.marginBottom_8]}
          >
            <Text style={[fonts.size_16, fonts.gray800]}>
              {t('OrderDetails.orderDate')}:
            </Text>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={[layout.row, layout.justifyBetween, gutters.marginBottom_16]}
          >
            <Text style={[fonts.size_16, fonts.gray800]}>
              {t('OrderDetails.status')}:
            </Text>
            <Text
              style={[
                fonts.size_16,
                { color: getStatusColor(status) },
                fonts.gray800,
              ]}
            >
              {status}
            </Text>
          </View>
          <View style={[layout.row, layout.justifyBetween]}>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
              {t('OrderDetails.total')}:
            </Text>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
              Rs. {order.total}
            </Text>
          </View>
        </View>
        <View
          style={[
            gutters.padding_16,
            borders.rounded_16,
            gutters.marginBottom_24,
          ]}
        >
          <Text
            style={[
              fonts.bold,
              fonts.size_24,
              gutters.marginBottom_16,
              fonts.gray800,
            ]}
          >
            {t('OrderDetails.customerDetails')}
          </Text>
          <View
            style={[layout.row, layout.justifyBetween, gutters.marginBottom_8]}
          >
            <Text style={[fonts.size_16, fonts.gray800]}>
              {t('OrderDetails.name')}:
            </Text>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
              {order.user.name}
            </Text>
          </View>
          <View
            style={[layout.row, layout.justifyBetween, gutters.marginBottom_8]}
          >
            <Text style={[fonts.size_12, fonts.gray800]}>
              {t('OrderDetails.email')}:
            </Text>
            <Text style={[fonts.size_12, fonts.bold, fonts.gray800]}>
              {order.user.email}
            </Text>
          </View>
          <View
            style={[layout.row, layout.justifyBetween, gutters.marginBottom_8]}
          >
            <Text style={[fonts.size_12, fonts.gray800]}>
              {t('OrderDetails.phone')}:
            </Text>
            <Text style={[fonts.size_12, fonts.bold, fonts.gray800]}>
              {order.user.phone}
            </Text>
          </View>
          <View style={[layout.row, layout.justifyBetween]}>
            <Text style={[fonts.size_12, fonts.gray800]}>
              {t('OrderDetails.address')}:
            </Text>
            <Text style={[fonts.size_12, fonts.bold, fonts.gray800]}>
              {order.user.address}
            </Text>
          </View>
        </View>
        <Button
          label="Navigate"
          onPress={toggleModal}
          disabled={status === 'Delivered' || status === 'Cancelled'}
        />
        <View style={[gutters.padding_16, borders.rounded_16]}>
          <Text style={[fonts.bold, fonts.size_24, fonts.gray800]}>
            {t('OrderDetails.orderItem')}
          </Text>
        </View>
        <View style={[gutters.marginTop_16]}>
          <Text style={[fonts.size_16, fonts.bold]}>Products:</Text>
          {order.products.map((product: any, index: any) => (
            <View
              key={product._id}
              style={[
                layout.row,
                layout.itemsCenter,
                gutters.marginTop_12,
                {
                  borderBottomWidth: 1,
                  borderColor: '#eee',
                  paddingBottom: 10,
                },
              ]}
            >
              <Image
                source={{ uri: product.image[0] }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={fonts.size_16}>{product.name}</Text>
                <Text style={fonts.size_12}>Price: Rs {product.price}</Text>
                <Text style={fonts.size_12}>
                  Qty: {order.quantities[index]}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Button
          disabled={status === 'Delivered' || status === 'Cancelled'}
          label={t('OrderDetails.updateStatus')}
          onPress={handleStatusUpdate}
        />
        <Button
          label="Cancel Order"
          disabled={status === 'Delivered' || status === 'Cancelled'}
          onPress={handleCancelOrder}
        />
      </ScrollView>
    </SafeScreen>
  );
};

export default OrderDetails;
