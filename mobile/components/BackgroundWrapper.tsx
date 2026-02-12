import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import BackgroundImages from './BackgroundImages';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  return (
    <View style={styles.container}>
      <BackgroundImages opacity={0.1} imagesPerRow={3} />
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 253, 244, 0.3)', // light green overlay - very subtle
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // semi-transparent white to make content readable
  },
});
