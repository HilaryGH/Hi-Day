import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface AvatarProps {
  user: {
    name?: string;
    email?: string;
    logo?: string;
    avatar?: string;
  };
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 40 }) => {
  // Get initials from name (first 2 letters)
  const getInitials = () => {
    if (user.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        // First letter of first name + first letter of last name
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts[0].length >= 2) {
        // First 2 letters of name
        return nameParts[0].substring(0, 2).toUpperCase();
      } else {
        return nameParts[0][0].toUpperCase();
      }
    } else if (user.email) {
      // Fallback to email initials
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Priority: logo > avatar > initials
  const imageUrl = user.logo || user.avatar;

  if (imageUrl) {
    return (
      <ExpoImage
        source={{ uri: imageUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
      />
    );
  }

  // Show initials
  const initials = getInitials();
  const backgroundColor = getColorFromName(user.name || user.email || 'User');

  return (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
};

// Generate a color based on name/email for consistent avatar colors
const getColorFromName = (name: string): string => {
  const colors = [
    '#16A34A', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Avatar;
