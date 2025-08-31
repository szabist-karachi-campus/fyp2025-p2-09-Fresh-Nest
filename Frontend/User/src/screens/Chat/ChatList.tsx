import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { FlashList } from '@shopify/flash-list';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { useTheme } from '@/theme';
import { useGetAllThreads } from '@/queries/chats.queries';
import { useNavigation } from '@react-navigation/native';
import { Paths } from '@/navigation/paths';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, Paths.ChatList>;

export default function ChatList() {
  const { fonts } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: Threads, isPending, isError } = useGetAllThreads();
  console.log(Threads);

  const ChatListItem = ({ item }: { item: any }) => {
    const participant =
      item.initiatorModel === 'User' ? item.receiverId : item.initiatorId;
    console.log(participant, 'Participent');
    const participantModel =
      item.initiatorModel === 'User' ? item.receiverModel : item.initiatorModel;
    const name =
      item.initiatorModel === 'User'
        ? item.receiverModel === 'Vendor'
          ? item.receiver.name
          : 'Fresh Nest'
        : item.initiatorModel === 'SuperAdmin'
          ? 'Fresh Nest'
          : item.initiator.name;
    const OrderNo = item.orderId.orderNo;
    console.log('object', item);

    const lastMessage =
      item.chats?.[item.chats.length - 1]?.message ?? 'No messages yet';
    const lastTimestamp = item.chats?.[item.chats.length - 1]?.timestamp;

    const time = lastTimestamp
      ? new Date(lastTimestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <RNBounceable
        onPress={() =>
          navigation.navigate(Paths.Chat, {
            threadId: item._id,
            name: name,
            recieverModel: participantModel,
            vendorId: participant,
          })
        }
        style={styles.card}
      >
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, fonts.gray800]} numberOfLines={1}>
              {name} - {OrderNo}
            </Text>
            <Text style={[styles.time, fonts.gray400]}>{time}</Text>
          </View>
          <Text style={[styles.message, fonts.gray400]} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
      </RNBounceable>
    );
  };

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={fonts.size_16}>Loading chats...</Text>
      </View>
    );
  }

  if (isError || !Threads?.threads?.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={fonts.size_16}>No chats found.</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={Threads.threads}
      keyExtractor={(item: any) => item._id}
      renderItem={({ item }) => <ChatListItem item={item} />}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
      estimatedItemSize={80}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#777',
  },
  message: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
});
