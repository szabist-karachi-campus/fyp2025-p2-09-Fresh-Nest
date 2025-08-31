import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/template';
import { useGetThreadById, useSendMessage } from '@/queries/chats.queries';

type ScreenProps = RouteProp<RootStackParamList, Paths.Chat>;

const Chat = () => {
  const route = useRoute<ScreenProps>();
  const { threadId, name, recieverModel, vendorId } = route.params;
  console.log(route.params);
  const { layout, gutters, fonts, backgrounds, colors, variant } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const { mutateAsync: sendMessage, isPending } = useSendMessage();
  const {
    data: thread,
    isLoading,
    isError,
  } = useGetThreadById(threadId, {
    refetchInterval: 1000,
  });

  const [inputText, setInputText] = useState('');

  const messages = thread?.thread?.chats ?? [];

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      await sendMessage({
        message: inputText.trim(),
        orderId: thread?.thread?.orderId._id,
        title: thread?.thread?.title ?? 'Message',
        receiverModel: recieverModel,
        receiverId: vendorId,
      });

      setInputText('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.senderModel === 'User';
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[fonts.size_16, { color: isUser ? '#fff' : '#333' }]}>
          {item.message}
        </Text>
        <Text
          style={[
            fonts.size_12,
            {
              color: isUser ? '#d0f0d0' : '#888',
              marginTop: 4,
              textAlign: 'right',
            },
          ]}
        >
          {time}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={[layout.itemsCenter, layout.flex_1]}>
          <Text style={fonts.size_16}>Loading chat...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (isError || !thread?.thread) {
    return (
      <SafeScreen>
        <View style={[layout.itemsCenter, layout.flex_1]}>
          <Text style={[fonts.size_16, { color: colors.red500 }]}>
            Failed to load thread.
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[layout.flex_1]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={[layout.flex_1, backgrounds.gray100]}>
        {/* Header */}
        <View style={[gutters.padding_16, gutters.marginBottom_8]}>
          <Text style={[fonts.size_24, fonts.bold, { color: colors.gray800 }]}>
            {recieverModel === 'SuperAdmin' ? 'Fresh Nest' : name}
          </Text>
          <Text style={[fonts.size_16, fonts.bold, { color: colors.gray800 }]}>
            for Order: {thread?.thread?.orderId?.orderNo}
          </Text>
          <Text style={[fonts.size_12, { color: colors.gray400 }]}>
            Receiver: {recieverModel}
          </Text>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={[
            gutters.paddingHorizontal_16,
            { paddingBottom: 60 },
          ]}
          renderItem={renderItem}
          inverted
        />

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              marginHorizontal: 16,
              marginBottom: Platform.OS === 'ios' ? 24 : 12,
            },
          ]}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <RNBounceable disabled={isPending} onPress={handleSendMessage}>
            <Icon
              name="send"
              size={24}
              color={variant === 'dark' ? '#fff' : '#000'}
            />
          </RNBounceable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  myMessage: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
});
