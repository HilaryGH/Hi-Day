import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface BackgroundImagesProps {
  opacity?: number;
  imagesPerRow?: 2 | 3;
}

const BackgroundImages: React.FC<BackgroundImagesProps> = ({ 
  opacity = 0.1,
  imagesPerRow = 3 
}) => {
  // Generate image paths from image 1.svg to image 17.svg
  // For web, use public folder paths; for native, construct paths based on platform
  const imagePaths = Array.from({ length: 17 }, (_, i) => {
    const imageName = `image ${i + 1}.svg`;
    if (Platform.OS === 'web') {
      return `/${imageName}`;
    }
    // For native platforms, try to use the public folder path if accessible
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
              style={[
                styles.image, 
                { 
                  opacity,
                  tintColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.1)' : undefined,
                }
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
              onError={(error) => {
                console.error(`Failed to load image: ${imagePath}`, error);
              }}
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
    padding: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default BackgroundImages;
