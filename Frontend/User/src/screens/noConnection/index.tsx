import { useTheme } from '@/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const NoConnection = () => {
  const {
    colors,
    variant,
    changeTheme,
    layout,
    gutters,
    fonts,
    components,
    backgrounds,
  } = useTheme();
  const { t } = useTranslation([`noConnection`]);

  return (
    <View style={styles.container}>
      <Icon name="wifi-off" size={200} color="red" style={styles.icon} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[fonts.size_32, fonts.bold]}
      >
        {t('title')}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[fonts.size_40, fonts.size_16, gutters.marginTop_12]}
      >
        {t('subtitle')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Background color
    padding: 20, // Padding for spacing around content
  },
  icon: {
    marginBottom: 20, // Spacing between icon and text
  },
  titleText: {
    fontSize: 24, // Large text for the title
    fontWeight: 'bold', // Bold for emphasis
    color: '#333', // Dark gray color
    marginBottom: 10, // Spacing between title and subtitle
    textAlign: 'center', // Center align the text
  },
  subText: {
    fontSize: 16, // Smaller text for the subtitle
    color: '#555', // Lighter gray for less emphasis
    textAlign: 'center', // Center align the text
  },
});

export default NoConnection;
