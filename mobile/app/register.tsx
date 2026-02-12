import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const categories = [
  'Fashion & Apparel',
  'Electronics',
  'Home & Living',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Food & Beverages',
];

const Register = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [userType, setUserType] = useState<'individual' | 'product provider' | null>(null);
  const [providerType, setProviderType] = useState<'freelancer' | 'small business' | 'specialized' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    alternativePhone: '',
    whatsapp: '',
    telegram: '',
    referralCode: '',
    idDocument: null as any,
    companyName: '',
    productType: '',
    workExperience: '',
    gender: '',
    city: '',
    location: '',
    serviceCenterPhotos: [] as any[],
    introductionVideo: null as any,
    servicePriceList: null as any,
    crCertificate: null as any,
    professionalCertificate: null as any,
    portfolioPhotos: [] as any[],
    logo: null as any, // Logo for product providers
    privacyConsent: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFilePick = async (field: string, multiple: boolean = false) => {
    try {
      if (field.includes('Photos') || field === 'portfolioPhotos' || field === 'serviceCenterPhotos') {
        // Use ImagePicker for photos
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: multiple,
          quality: 0.8,
        });

        if (!result.canceled) {
          if (multiple) {
            const files = result.assets.slice(0, 5);
            setFormData({ ...formData, [field]: files });
          } else {
            setFormData({ ...formData, [field]: result.assets[0] });
          }
        }
      } else {
        // Use DocumentPicker for documents
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          multiple,
        });

        if (!result.canceled) {
          if (multiple) {
            const files = result.assets.slice(0, 5);
            setFormData({ ...formData, [field]: files });
          } else {
            setFormData({ ...formData, [field]: result.assets[0] });
          }
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!userType) {
      setError('Please select a registration type');
      return;
    }

    if (userType === 'product provider' && !providerType) {
      setError('Please select a provider type');
      return;
    }

    // Validate required fields
    if (userType === 'product provider') {
      if ((providerType === 'small business' || providerType === 'specialized') && 
          (!formData.companyName || formData.companyName.trim() === '')) {
        setError('Company name is required');
        return;
      }
      if (providerType === 'freelancer' && (!formData.name || formData.name.trim() === '')) {
        setError('Name is required');
        return;
      }
    } else {
      if (!formData.name || formData.name.trim() === '') {
        setError('Name is required');
        return;
      }
    }

    if (!formData.email || formData.email.trim() === '') {
      setError('Email is required');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.trim() === '') {
      setError('Password is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userType === 'product provider') {
      if (!formData.city || formData.city.trim() === '') {
        setError('City is required');
        return;
      }
      if (!formData.location || formData.location.trim() === '') {
        setError('Location is required');
        return;
      }
    } else {
      if (!formData.address || formData.address.trim() === '') {
        setError('Address is required');
        return;
      }
    }

    if (!formData.phone || formData.phone.trim() === '') {
      setError('Phone number is required');
      return;
    }

    if (!formData.privacyConsent) {
      setError('Please consent to the Privacy Policy & Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const registrationData: any = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: userType === 'individual' ? 'individual' : 'product provider',
        phone: formData.phone.trim(),
        privacyConsent: formData.privacyConsent,
      };

      if (userType === 'product provider') {
        registrationData.address = formData.location.trim();
        registrationData.city = formData.city.trim();
      } else {
        registrationData.address = formData.address.trim();
      }

      if (userType === 'product provider') {
        if (providerType === 'small business' || providerType === 'specialized') {
          registrationData.name = formData.companyName.trim();
        } else if (providerType === 'freelancer') {
          registrationData.name = formData.name.trim();
        }
      } else {
        registrationData.name = formData.name.trim();
      }

      if (formData.alternativePhone?.trim()) {
        registrationData.alternativePhone = formData.alternativePhone.trim();
      }
      if (formData.whatsapp?.trim()) {
        registrationData.whatsapp = formData.whatsapp.trim();
      }
      if (formData.telegram?.trim()) {
        registrationData.telegram = formData.telegram.trim();
      }
      if (formData.city?.trim()) {
        registrationData.city = formData.city.trim();
      }
      if (formData.location?.trim()) {
        registrationData.location = formData.location.trim();
      }
      if (formData.referralCode?.trim()) {
        registrationData.referralCode = formData.referralCode.trim();
      }

      if (userType === 'product provider') {
        registrationData.providerType = providerType;
        registrationData.serviceType = formData.productType;
        registrationData.workExperience = formData.workExperience;
        
        if (providerType === 'freelancer') {
          registrationData.gender = formData.gender;
        }
        
        if (providerType === 'small business' || providerType === 'specialized') {
          registrationData.companyName = formData.companyName.trim();
        }
      }

      // If logo is provided, use FormData
      if (formData.logo && userType === 'product provider') {
        const formDataToSend = new FormData();
        
        // Add all text fields
        Object.keys(registrationData).forEach(key => {
          if (registrationData[key] !== undefined && registrationData[key] !== null) {
            formDataToSend.append(key, String(registrationData[key]));
          }
        });
        
        // Add logo file
        const uri = formData.logo.uri;
        const filename = uri.split('/').pop() || 'logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formDataToSend.append('logo', {
          uri,
          name: filename,
          type,
        } as any);
        
        await register(formDataToSend);
      } else {
        await register(registrationData);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      }
      
      console.error('Registration error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Individual Registration Form
  if (userType === 'individual') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Your Account</Text>
            <Text style={styles.headerSubtitle}>Join thousands of satisfied customers</Text>
          </View>

          <View style={styles.card}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Address *"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Phone *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="WhatsApp (Optional)"
              value={formData.whatsapp}
              onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Telegram (Optional)"
              value={formData.telegram}
              onChangeText={(text) => setFormData({ ...formData, telegram: text })}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Referral Code (Optional)"
              value={formData.referralCode}
              onChangeText={(text) => setFormData({ ...formData, referralCode: text })}
            />

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => handleFilePick('idDocument')}
            >
              <Text style={styles.fileButtonText}>
                {formData.idDocument ? '✓ ID Document Selected' : 'Upload ID Document *'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData({ ...formData, privacyConsent: !formData.privacyConsent })}
            >
              <View style={[styles.checkbox, formData.privacyConsent && styles.checkboxChecked]}>
                {formData.privacyConsent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I consent to the Privacy Policy & Terms of Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Product Provider Registration Form
  if (userType === 'product provider') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Register as Product Provider</Text>
            <Text style={styles.headerSubtitle}>Start your product business journey</Text>
          </View>

          <View style={styles.card}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Provider Type Selection */}
            <Text style={styles.sectionTitle}>Provider Type</Text>
            <View style={styles.providerTypeGrid}>
              {(['freelancer', 'small business', 'specialized'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.providerTypeCard,
                    providerType === type && styles.providerTypeCardSelected,
                  ]}
                  onPress={() => setProviderType(type)}
                >
                  <Text style={styles.providerTypeIcon}>
                    {type === 'freelancer' ? '💼' : type === 'small business' ? '🏪' : '🏭'}
                  </Text>
                  <Text style={styles.providerTypeText}>
                    {type === 'small business' ? 'Small Business' : type === 'specialized' ? 'Specialized' : 'Freelancer'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {providerType && (
              <>
                {(providerType === 'small business' || providerType === 'specialized') && (
                  <TextInput
                    style={styles.input}
                    placeholder="Company Name *"
                    value={formData.companyName}
                    onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                  />
                )}

                {providerType === 'freelancer' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name *"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                )}

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Product Type *</Text>
                  <View style={styles.picker}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.pickerOption,
                          formData.productType === category && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, productType: category })}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.productType === category && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Work Experience *</Text>
                  <View style={styles.picker}>
                    {['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', 'More than 10 years'].map((exp) => (
                      <TouchableOpacity
                        key={exp}
                        style={[
                          styles.pickerOption,
                          formData.workExperience === exp && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, workExperience: exp })}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.workExperience === exp && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {exp}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {providerType === 'freelancer' && (
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Gender *</Text>
                    <View style={styles.picker}>
                      {['Male', 'Female', 'Other'].map((gender) => (
                        <TouchableOpacity
                          key={gender}
                          style={[
                            styles.pickerOption,
                            formData.gender === gender.toLowerCase() && styles.pickerOptionSelected,
                          ]}
                          onPress={() => setFormData({ ...formData, gender: gender.toLowerCase() })}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              formData.gender === gender.toLowerCase() && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {gender}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <Text style={styles.sectionTitle}>Contact Information</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address *"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Primary Phone *"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Alternative Phone (Optional)"
                  value={formData.alternativePhone}
                  onChangeText={(text) => setFormData({ ...formData, alternativePhone: text })}
                  keyboardType="phone-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="WhatsApp (Optional)"
                  value={formData.whatsapp}
                  onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                  keyboardType="phone-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Telegram (Optional)"
                  value={formData.telegram}
                  onChangeText={(text) => setFormData({ ...formData, telegram: text })}
                  autoCapitalize="none"
                />

                <Text style={styles.sectionTitle}>Location Information</Text>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>City *</Text>
                  <View style={styles.picker}>
                    {['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Other'].map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.pickerOption,
                          formData.city === city.toLowerCase() && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, city: city.toLowerCase() })}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.city === city.toLowerCase() && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Location *"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />

                <Text style={styles.sectionTitle}>Logo (Optional)</Text>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => handleFilePick('logo')}
                >
                  <Text style={styles.fileButtonText}>
                    {formData.logo
                      ? '✓ Logo Selected'
                      : 'Upload Company/Personal Logo (Optional)'}
                  </Text>
                </TouchableOpacity>
                {formData.logo && (
                  <View style={styles.logoPreview}>
                    <ExpoImage
                      source={{ uri: formData.logo.uri }}
                      style={styles.logoPreviewImage}
                      contentFit="contain"
                    />
                  </View>
                )}

                <Text style={styles.sectionTitle}>Required Documents</Text>
                
                {(providerType === 'small business' || providerType === 'specialized') && (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => handleFilePick('serviceCenterPhotos', true)}
                  >
                    <Text style={styles.fileButtonText}>
                      {formData.serviceCenterPhotos.length > 0
                        ? `✓ ${formData.serviceCenterPhotos.length} Photos Selected`
                        : 'Upload Product Center Photos (up to 5)'}
                    </Text>
                  </TouchableOpacity>
                )}

                {providerType === 'freelancer' && (
                  <>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => handleFilePick('portfolioPhotos', true)}
                    >
                      <Text style={styles.fileButtonText}>
                        {formData.portfolioPhotos.length > 0
                          ? `✓ ${formData.portfolioPhotos.length} Photos Selected`
                          : 'Upload Product Quality Photos (up to 5)'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => handleFilePick('idDocument')}
                    >
                      <Text style={styles.fileButtonText}>
                        {formData.idDocument ? '✓ ID Document Selected' : 'Upload Government ID *'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {(providerType === 'small business' || providerType === 'specialized') && (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => handleFilePick('crCertificate')}
                  >
                    <Text style={styles.fileButtonText}>
                      {formData.crCertificate ? '✓ CR Certificate Selected' : 'Upload CR Certificate *'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => handleFilePick('professionalCertificate')}
                >
                  <Text style={styles.fileButtonText}>
                    {formData.professionalCertificate
                      ? '✓ Business License Selected'
                      : providerType === 'freelancer'
                      ? 'Upload Business License (Optional)'
                      : 'Upload Business License *'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => handleFilePick('servicePriceList')}
                >
                  <Text style={styles.fileButtonText}>
                    {formData.servicePriceList
                      ? '✓ Price List Selected'
                      : 'Upload Product Price List (Optional)'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Account Security</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setFormData({ ...formData, privacyConsent: !formData.privacyConsent })}
                >
                  <View style={[styles.checkbox, formData.privacyConsent && styles.checkboxChecked]}>
                    {formData.privacyConsent && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I consent to the Privacy Policy & Terms of Service
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Register as Product Provider</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.linkText}>
                    Already have an account? Sign In
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Initial Role Selection Screen
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <ExpoImage
              source={require('@/assets/images/dahi logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join thousands of satisfied customers</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.roleSelectionTitle}>I am registering as:</Text>
          
          <View style={styles.roleSelectionGrid}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => setUserType('individual')}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>👤</Text>
              </View>
              <Text style={styles.roleTitle}>Buyer</Text>
              <Text style={styles.roleSubtitle}>Find products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => setUserType('product provider')}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>🏪</Text>
              </View>
              <Text style={styles.roleTitle}>Product Provider</Text>
              <Text style={styles.roleSubtitle}>Offer products</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink} onPress={() => router.push('/login')}>
                Sign In
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to da-hi's{' '}
            <Text style={styles.footerLink} onPress={() => router.push('/terms-of-service')}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.footerLink} onPress={() => router.push('/privacy-policy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    height: 64,
    width: 200,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F0FDF4',
  },
  fileButtonText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoPreview: {
    marginBottom: 16,
    alignItems: 'center',
  },
  logoPreviewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 16,
  },
  providerTypeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  providerTypeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  providerTypeCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  providerTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  providerTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  pickerOptionSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#16A34A',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
  roleSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  roleSelectionGrid: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    fontSize: 40,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInContainer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInLink: {
    color: '#16A34A',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLink: {
    color: '#16A34A',
  },
});

export default Register;
