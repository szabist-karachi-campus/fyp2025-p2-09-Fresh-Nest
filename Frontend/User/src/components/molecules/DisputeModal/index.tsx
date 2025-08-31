import React, { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';
import RNBounceable from '@freakycoder/react-native-bounceable';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '@/theme';
import { ActivityIndicator } from 'react-native-paper';

const DisputeModal = ({
  visible,
  type,
  onClose,
  onSubmit,
  selectedReason,
  setReason = () => {},
  message,
  setMessage,
  loading = false,
}: {
  visible: boolean;
  type: 'vendor' | 'dispute';
  onClose: () => void;
  onSubmit: () => void;
  selectedReason?: string;
  loading: boolean;
  setReason?: React.Dispatch<
    React.SetStateAction<
      'Wrong item' | 'Not as described' | 'Late delivery' | undefined | string
    >
  >;
  setMessage?: React.Dispatch<React.SetStateAction<string>>;
  message?: string;
}) => {
  const { layout, gutters, borders, fonts } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View
        style={[
          layout.flex_1,
          layout.justifyCenter,
          gutters.padding_16,
          { backgroundColor: 'rgba(0,0,0,0.5)' },
        ]}
      >
        <View
          style={[
            borders.rounded_16,
            gutters.padding_16,
            { backgroundColor: '#fff', elevation: 5 },
          ]}
        >
          {/* Header */}
          <View
            style={[
              layout.row,
              layout.justifyBetween,
              layout.itemsCenter,
              gutters.marginBottom_12,
            ]}
          >
            <Text style={fonts.size_16}>
              {type === 'vendor' ? 'Contact Vendor' : 'Register a Dispute'}
            </Text>
            <RNBounceable onPress={onClose}>
              <FontAwesome5Icon name="times" size={20} color="#333" />
            </RNBounceable>
          </View>

          {/* Reason Input or Selection */}
          <Text
            style={[
              gutters.marginTop_12,
              gutters.marginBottom_12,
              type === 'vendor' && { fontWeight: 'bold' },
            ]}
          >
            {type === 'vendor' ? 'Title' : 'Select a Reason:'}
          </Text>

          {type === 'vendor' ? (
            <TextInput
              placeholder="Title"
              value={selectedReason}
              onChangeText={setReason}
              style={[
                borders.w_1,
                borders.rounded_4,
                gutters.padding_12,
                gutters.marginBottom_16,
                {
                  borderColor: '#ddd',
                  textAlignVertical: 'top',
                },
              ]}
            />
          ) : (
            <>
              {['Wrong item', 'Not as described', 'Late delivery'].map(
                (reason: any) => (
                  <View
                    key={reason}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <RNBounceable
                      disabled={loading}
                      onPress={() => setReason(reason)}
                      style={[
                        borders.rounded_16,
                        gutters.marginRight_12,
                        {
                          height: 18,
                          width: 18,
                          borderWidth: 2,
                          borderColor: '#999',
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      {selectedReason === reason && (
                        <View
                          style={{
                            height: 12,
                            width: 12,
                            borderRadius: 6,
                            backgroundColor: '#1976D2',
                          }}
                        />
                      )}
                    </RNBounceable>
                    <Text style={[fonts.size_16, { color: '#333' }]}>
                      {reason}
                    </Text>
                  </View>
                ),
              )}
            </>
          )}

          {/* Message Field */}
          <Text
            style={[gutters.marginTop_12, gutters.marginBottom_12, fonts.bold]}
          >
            Message:
          </Text>
          <TextInput
            multiline
            value={message}
            onChangeText={setMessage}
            numberOfLines={4}
            placeholder="Describe the issue..."
            style={[
              borders.w_1,
              borders.rounded_4,
              gutters.padding_12,
              gutters.marginBottom_16,
              {
                borderColor: '#ddd',
                minHeight: 80,
                textAlignVertical: 'top',
              },
            ]}
          />

          {/* Submit Button */}
          <RNBounceable
            disabled={loading}
            onPress={onSubmit}
            style={[
              gutters.padding_12,
              borders.rounded_4,
              layout.itemsCenter,
              { backgroundColor: '#1976D2' },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  fonts.size_16,
                  {
                    color: '#fff',
                    fontWeight: '600',
                  },
                ]}
              >
                {type === 'vendor' ? 'Contact Vendor' : 'Submit Dispute'}
              </Text>
            )}
          </RNBounceable>
        </View>
      </View>
    </Modal>
  );
};

export default DisputeModal;
