import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';

interface CommunicationWidgetProps {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

const CommunicationWidget = ({
  phone = '+251977684476',
  whatsapp = '+251977684476',
  email = 'support@dahimart.com',
}: CommunicationWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handlePhoneClick = async () => {
    try {
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open phone dialer');
    }
  };

  const handleWhatsAppClick = async () => {
    try {
      // Format phone number for WhatsApp (remove + and spaces)
      const formattedPhone = whatsapp.replace(/[\s+]/g, '');
      const message = encodeURIComponent('Hello! I would like to get in touch with da-hi Marketplace.');
      const url = `https://wa.me/${formattedPhone}?text=${message}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const handleEmailClick = async () => {
    try {
      const url = `mailto:${email}?subject=${encodeURIComponent('Inquiry from da-hi Marketplace')}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot send emails on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  const handleChatClick = () => {
    Alert.alert(
      'Chat Feature',
      'Chat feature coming soon! Please use WhatsApp, Phone, or Email for now.',
      [{ text: 'OK' }]
    );
  };

  const toggleMenu = () => {
    if (isOpen) {
      // Close animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false);
      });
    } else {
      setIsOpen(true);
      // Open animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const buttonRotation = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Communication Options Menu */}
      {isOpen && (
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              maxWidth: screenWidth * 0.85,
            },
          ]}
        >
          {/* Phone Option */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePhoneClick}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.phoneIcon]}>
              <Text style={styles.iconText}>📞</Text>
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Phone</Text>
              <Text style={styles.menuItemSubtitle}>{phone}</Text>
            </View>
          </TouchableOpacity>

          {/* WhatsApp Option */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleWhatsAppClick}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.whatsappIcon]}>
              <Text style={styles.iconText}>💬</Text>
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>WhatsApp</Text>
              <Text style={styles.menuItemSubtitle}>Chat with us</Text>
            </View>
          </TouchableOpacity>

          {/* Email Option */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEmailClick}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.emailIcon]}>
              <Text style={styles.iconText}>✉️</Text>
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Email</Text>
              <Text style={styles.menuItemSubtitle} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </TouchableOpacity>

          {/* App Chat Option */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChatClick}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.chatIcon]}>
              <Text style={styles.iconText}>💭</Text>
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>App Chat</Text>
              <Text style={styles.menuItemSubtitle}>Live chat support</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main Floating Button */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.buttonContent,
            {
              transform: [{ rotate: buttonRotation }],
            },
          ]}
        >
          {isOpen ? (
            <Text style={styles.buttonIcon}>✕</Text>
          ) : (
            <Text style={styles.buttonIcon}>💬</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginBottom: 16,
    minWidth: 280,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phoneIcon: {
    backgroundColor: '#16A34A',
  },
  whatsappIcon: {
    backgroundColor: '#25D366',
  },
  emailIcon: {
    backgroundColor: '#16A34A',
  },
  chatIcon: {
    backgroundColor: '#16A34A',
  },
  iconText: {
    fontSize: 24,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
});

export default CommunicationWidget;
