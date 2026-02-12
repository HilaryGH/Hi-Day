import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface SectionBackgroundProps {
  opacity?: number;
  imagesPerRow?: 2 | 3;
}

const SectionBackground: React.FC<SectionBackgroundProps> = ({ 
  opacity = 0.15,
  imagesPerRow = 3 
}) => {
  // Generate image paths from image 1.svg to image 17.svg
  const imagePaths = Array.from({ length: 17 }, (_, i) => {
    const imageName = `image ${i + 1}.svg`;
    if (Platform.OS === 'web') {
      return `/${imageName}`;
    }
    return `/${imageName}`;
  });

  // Calculate width percentage based on imagesPerRow
  const imageWidthPercent = imagesPerRow === 3 ? 33.33 : 50;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.grid}>
        {imagePaths.map((imagePath, index) => (
          <View
            key={index}
            style={[
              styles.imageContainer,
              { width: `${imageWidthPercent}%` },
            ]}
          >
            <ExpoImage
              source={{ uri: imagePath }}
              style={[styles.image, { opacity }]}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    aspectRatio: 1,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default SectionBackground;
