import RNBounceable from '@freakycoder/react-native-bounceable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths, Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { SafeScreen } from '@/components/templates';

import { useGetAllThreads } from '@/queries/chats.queries';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  AdminPaths.DisputeList
>;

export default function ChatList() {
  const { fonts } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: Threads, isPending, isError } = useGetAllThreads();
  console.log('Threads', Threads);

  const ChatListItem = ({ item }: { item: any }) => {
    const { fonts } = useTheme();

    const user = item.initiator;
    const userName = user?.name || 'Customer';

    const orderNo = item.orderId?.orderNo ?? 'N/A';

    const lastChat = item.chats?.[item.chats.length - 1];
    const lastMessage = lastChat?.message ?? 'No messages yet';

    const lastTimestamp = lastChat?.timestamp;
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
            name: userName,
            recieverModel: 'User',
            vendorId: user._id,
          })
        }
        style={styles.card}
      >
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, fonts.gray800]} numberOfLines={1}>
              {userName} - {orderNo}
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
    <SafeScreen>
      <Text style={[fonts.size_24, fonts.bold, fonts.alignCenter]}>Chats</Text>
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
    </SafeScreen>
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
