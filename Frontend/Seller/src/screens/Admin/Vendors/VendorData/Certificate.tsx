import { SafeScreen } from '@/components/templates';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';

type CertificateScreenRouteProp = RouteProp<
  RootStackParamList,
  AdminPaths.Certificate
>;

const Certificate = () => {
  const route = useRoute<CertificateScreenRouteProp>();
  const { certificate } = route.params;

  return (
    <SafeScreen>
    <View style={styles.container}>
      <Text style={styles.heading}>Vendor Certification</Text>

      {certificate ? (
      <Image
        source={{ uri: certificate }}
        style={styles.image}
        resizeMode='contain'
      />
      ) : (
      <Text>No certificate available</Text>
      )}
    </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});

export default Certificate;
