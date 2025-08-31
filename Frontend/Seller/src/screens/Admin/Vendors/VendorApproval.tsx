import { toast } from '@backpackapp-io/react-native-toast';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';

import { Button } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

import { useHandleVendorStatus } from '@/queries/super.queries';

type NavigationProp = StackNavigationProp<RootStackParamList, any>;

const VendorApproval = () => {
  const { params }: any = useRoute();
  const { vendor } = params;
  const { fonts, gutters, layout, backgrounds, borders } = useTheme();
  const { mutateAsync } = useHandleVendorStatus();
  const navigation = useNavigation<NavigationProp>();

  const handleApprove = async () => {
    try {
      await mutateAsync({ email: vendor.email, status: 'APPROVE' });
      toast.success('Vendor approved successfully');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async () => {
    try {
      await mutateAsync({ email: vendor.email, status: 'REJECT' });
      toast.success('Vendor rejected successfully');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject vendor');
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View
      style={[
        layout.row,
        layout.justifyBetween,
        layout.itemsCenter,
        gutters.marginBottom_12,
      ]}
    >
      <Text style={[fonts.gray800, fonts.size_16]}>{label}</Text>
      <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>{value}</Text>
    </View>
  );

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.padding_16]}>
        <Text
          style={[
            fonts.size_24,
            fonts.bold,
            fonts.gray800,
            gutters.marginBottom_24,
          ]}
        >
          Vendor Details
        </Text>

        <View
          style={[
            backgrounds.gray100,
            gutters.padding_16,
            borders.rounded_16,
            {
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              marginBottom: 32,
            },
          ]}
        >
          <DetailRow label="Name" value={vendor.name} />
          <DetailRow label="Email" value={vendor.email} />
          <DetailRow label="Phone" value={vendor.phone} />
          <DetailRow label="CNIC" value={vendor.cnic} />
        </View>

        <View>
          <Button
            label="Approve Vendor"
            onPress={handleApprove}
          />

          <View style={gutters.marginTop_12}>
            <Button
              label="Reject Vendor"
              onPress={handleReject}
            />
          </View>
        </View>
      </View>
    </SafeScreen>
  );
};

export default VendorApproval;
