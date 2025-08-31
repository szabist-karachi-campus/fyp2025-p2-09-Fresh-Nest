import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { SafeScreen } from '@/components/template';
import {
  useCancelOrder,
  useCancelOrderById,
  useGetOrders,
} from '@/queries/orders.queries';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '@/components/molecules';
import { useTheme } from '@/theme';
import { toast } from '@backpackapp-io/react-native-toast';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as Icons from '@/components/molecules/icons';
import {
  useGetThreadByOrderIdMutation,
  useSendMessage,
} from '@/queries/chats.queries';
import { DisputeModal } from '@/components/molecules';
import { SwipeRow } from 'react-native-swipe-list-view';

type OrderDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.OrderDetails
>;

type OrderDetailScreenProps = RouteProp<RootStackParamList, Paths.OrderDetails>;

const OrderDetails = () => {
  const { layout, gutters, fonts, backgrounds, borders, variant } = useTheme();
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute<OrderDetailScreenProps>();
  const { id } = route.params;

  const { data } = useGetOrders();
  const { mutateAsync: getThreadMutation } = useGetThreadByOrderIdMutation();
  const { mutateAsync: sendMessage, isPending } = useSendMessage();
  const order = data.orders.find((order: any) => order.orderNo === id);
  console.log(order);

  const { mutateAsync } = useCancelOrder();
  const { mutateAsync: HandleDelete } = useCancelOrderById();
  const [selectedReason, setSelectedReason] = useState<
    'Wrong item' | 'Not as described' | 'Late delivery' | undefined | string
  >(undefined);
  const [message, setMessage] = useState<string>('');
  const [disputeModalvisible, setDisputeModalVisible] = React.useState<{
    visible: boolean;
    type: 'vendor' | 'dispute';
    index?: number;
  }>({
    visible: false,
    type: 'dispute',
  });

  const cancelOrder = async () => {
    try {
      await mutateAsync(order);
      toast.success('Order Cancelled Successfully');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: any) => {
    console.log(id);
    try {
      await HandleDelete(id);
      toast.success('Order Cancelled Successfully');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#27ae60';
      case 'Processing':
        return '#f39c12';
      case 'Cancelled':
        return '#e74c3c';
      case 'Pending':
        return '#95a5a6';
      default:
        return '#34495e';
    }
  };

  if (!order) {
    return (
      <SafeScreen>
        <Text style={[fonts.size_16, fonts.alignCenter, gutters.marginTop_24]}>
          Order not found
        </Text>
      </SafeScreen>
    );
  }
  const onModalClose = () => {
    setDisputeModalVisible({ visible: false, type: 'dispute' });
  };
  const onSubmit = async () => {
    if (selectedReason === undefined) {
      toast.error('Please select a reason');
      return;
    }
    if (message.length < 5) {
      toast.error('Please enter a valid message');
      return;
    }
    if (disputeModalvisible.type === 'dispute') {
      try {
        const orderId = order.products[disputeModalvisible.index ?? 0].orderId;

        await sendMessage({
          orderId: orderId,
          message: message,
          title: selectedReason,
          receiverModel: 'SuperAdmin',
        });
        toast.success('Dispute registered successfully');
        setDisputeModalVisible({ visible: false, type: 'dispute' });
        return;
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      const id = order.products[disputeModalvisible.index ?? 0].vendor._id;
      const orderId = order.products[disputeModalvisible.index ?? 0].orderId;
      await sendMessage({
        orderId: orderId,
        message: message,
        title: selectedReason,
        receiverModel: 'Vendor',
        receiverId: id,
      });
      toast.success('Message sent to vendor successfully');
      setDisputeModalVisible({
        visible: false,
        type: 'dispute',
        index: undefined,
      });
      return;
    }
  };
  return (
    <ScrollView
      style={[layout.flex_1]}
      contentContainerStyle={[gutters.padding_16]}
    >
      <View
        style={[
          backgrounds.gray100,
          borders.rounded_16,
          gutters.padding_16,
          gutters.marginBottom_16,
        ]}
      >
        <View style={[layout.row, layout.itemsCenter, layout.justifyBetween]}>
          <Text style={[fonts.bold, fonts.size_16, gutters.marginBottom_8]}>
            Order #{order.orderNo}
          </Text>
          <Text
            style={[
              fonts.size_16,
              gutters.marginBottom_8,
              { color: getStatusColor(order.status), fontWeight: 'bold' },
            ]}
          >
            {order.status}
          </Text>
        </View>
        <Text style={[fonts.size_12, gutters.marginBottom_8]}>
          Date: {new Date(order.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[fonts.size_12]}>Payment: {order.paymentMethod}</Text>
        <Text style={[fonts.size_12]}>
          Payment Status: {order.paymentStatus}
        </Text>
      </View>

      <Text style={[fonts.bold, fonts.size_16, gutters.marginBottom_8]}>
        Products
      </Text>

      <FlashList
        data={order.products}
        estimatedItemSize={120}
        keyExtractor={(item: any, index: number) =>
          Math.random().toString(36).substring(7) + index
        }
        renderItem={({
          item: product,
          index,
        }: {
          item: any;
          index: number;
        }) => (
          //@ts-expect-error
          <SwipeRow
            preview={product.status == 'Cancelled' ? false : true}
            style={{ justifyContent: 'center', overflow: 'hidden' }}
            rightOpenValue={-75}
            disableRightSwipe
            disableLeftSwipe={product.status == 'Cancelled'}
          >
            <View
              style={[
                layout.row,
                borders.rounded_16,
                {
                  borderWidth: 1,
                  borderColor: 'yellow',
                  backgroundColor: 'red',
                  height: '90%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                },
              ]}
            >
              <RNBounceable
                style={{ marginRight: 20 }}
                onPress={() => handleDelete(product.orderId)}
              >
                <Icons.MaterialIcons name="cancel" size={50} color="#fff" />
              </RNBounceable>
            </View>
            <View
              key={product._id}
              style={[
                layout.row,
                backgrounds.gray100,
                borders.rounded_16,
                gutters.padding_12,
                gutters.marginBottom_12,
              ]}
            >
              <Image
                source={{ uri: product?.image[0] }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  marginRight: 12,
                }}
              />
              <View style={layout.flex_1}>
                <Text style={[fonts.bold, fonts.size_12]}>{product?.name}</Text>
                <Text style={[fonts.size_12, gutters.marginBottom_8]}>
                  {product?.category} | Qty: {order?.quantities[index]}
                </Text>
                <Text style={[fonts.size_12, gutters.marginBottom_8]}>
                  {product?.description}
                </Text>
                <Text style={[fonts.size_12, fonts.bold]}>
                  Rs.{product.price}
                  <Text style={[fonts.size_8]}> /{product.unit}</Text>
                </Text>
              </View>

              {product.status == 'Cancelled' ? (
                <Text
                  style={[
                    fonts.size_16,
                    gutters.marginBottom_8,
                    {
                      color: getStatusColor(product.status),
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {product.status}
                </Text>
              ) : (
                <View style={[layout.col, { justifyContent: 'space-between' }]}>
                  <RNBounceable
                    onPress={async () => {
                      const orderId = product.orderId ?? '';

                      try {
                        const response = await getThreadMutation({
                          orderId: orderId,
                          context: 'Vendor',
                        });
                        if (response.thread) {
                          navigation.navigate(Paths.Chat, {
                            threadId: response.thread._id,
                            vendorId: product.vendor._id,
                            name: product.vendor.name,
                            recieverModel: 'Vendor',
                          });
                        }
                      } catch (error) {
                        setDisputeModalVisible({
                          visible: true,
                          type: 'vendor',
                          index: index,
                        });
                      }
                    }}
                  >
                    <Icons.Ionicons
                      name="chatbox"
                      size={24}
                      color={variant === 'dark' ? '#fff' : '#000'}
                    />
                  </RNBounceable>
                  <RNBounceable
                    onPress={async () => {
                      const orderId = product.orderId ?? '';

                      try {
                        const response = await getThreadMutation({
                          orderId: orderId,
                          context: 'SuperAdmin',
                        });
                        if (response.thread) {
                          navigation.navigate(Paths.Chat, {
                            threadId: response.thread._id,
                            vendorId: product.vendor._id,
                            name: product.vendor.name,
                            recieverModel: 'SuperAdmin',
                          });
                        }
                      } catch (error) {
                        setDisputeModalVisible({
                          visible: true,
                          type: 'dispute',
                          index: index,
                        });
                      }
                    }}
                  >
                    <Icons.FontAwesome5
                      name="exclamation-circle"
                      size={22}
                      color={variant === 'dark' ? '#fff' : '#000'}
                    />
                  </RNBounceable>
                </View>
              )}
            </View>
          </SwipeRow>
        )}
      />

      <View
        style={[
          backgrounds.gray100,
          gutters.padding_16,
          borders.rounded_16,
          gutters.marginTop_16,
        ]}
      >
        <Text style={[fonts.bold, fonts.size_16, gutters.marginBottom_8]}>
          Order Summary
        </Text>
        <Text style={[fonts.size_12]}>Total: Rs.{order.total}</Text>
      </View>

      <View style={[gutters.marginTop_24, gutters.marginBottom_32]}>
        <Button
          label="Cancel Order"
          onPress={cancelOrder}
          disabled={['Cancelled', 'Delivered', 'Shipped'].includes(
            order.status,
          )}
        />
      </View>
      <DisputeModal
        visible={disputeModalvisible.visible}
        type={disputeModalvisible.type}
        onClose={onModalClose}
        onSubmit={onSubmit}
        selectedReason={selectedReason}
        setReason={setSelectedReason}
        setMessage={setMessage}
        loading={isPending}
      />
    </ScrollView>
  );
};

export default OrderDetails;
