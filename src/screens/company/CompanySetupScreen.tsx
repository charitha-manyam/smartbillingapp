import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';

export default function CompanySetupScreen() {
  const theme = useTheme();
  const { dispatch, uploadImage } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [digitalSignature, setDigitalSignature] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async (type: 'signature' | 'logo') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'signature' ? [4, 1] : [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const srcUri = result.assets[0].uri;
      const filename = type === 'signature' ? 'company_signature.png' : 'company_logo.png';
      let finalUri = srcUri;
      try {
        const destFile = new File(Paths.document, filename);
        await new File(srcUri).copy(destFile, { overwrite: true });
        finalUri = destFile.uri;
      } catch {
        // keep srcUri as fallback
      }
      if (type === 'signature') setDigitalSignature(finalUri);
      else setCompanyLogo(finalUri);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    let signatureUrl = digitalSignature || undefined;
    let logoUrl = companyLogo || undefined;

    try {
      if (digitalSignature) {
        signatureUrl = await uploadImage(digitalSignature, 'signature.png');
      }
      if (companyLogo) {
        logoUrl = await uploadImage(companyLogo, 'logo.png');
      }
    } catch (e) {
      console.warn('Upload failed, using local URI', e);
    }

    const company: Company = {
      id: Date.now().toString(),
      companyName: companyName.trim(),
      gstNumber: gstNumber.trim(),
      panNumber: panNumber.trim(),
      address: address.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      bankDetails: bankDetails.trim(),
      termsConditions: termsConditions.trim(),
      digitalSignature: signatureUrl,
      companyLogo: logoUrl,
    };
    dispatch({ type: 'SET_COMPANY', payload: company });
  };

  const inputTheme = {
    colors: {
      primary: '#0D9488',
    },
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="business" size={32} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Setup Your Company</Text>
        <Text style={styles.headerSubtitle}>
          Enter your business details to get started
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image" size={18} color="#0D9488" />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Logo & Signature
            </Text>
          </View>

          <View style={styles.imageRow}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage('logo')}
              activeOpacity={0.7}
            >
              {companyLogo ? (
                <Image source={{ uri: companyLogo }} style={styles.pickedImage} />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color="#0D9488" />
                  <Text style={styles.imagePickerText}>Company Logo</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage('signature')}
              activeOpacity={0.7}
            >
              {digitalSignature ? (
                <Image source={{ uri: digitalSignature }} style={styles.pickedImage} />
              ) : (
                <>
                  <Ionicons name="create" size={24} color="#0D9488" />
                  <Text style={styles.imagePickerText}>Signature</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={18} color="#0D9488" />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Basic Information
            </Text>
          </View>

          <TextInput
            label="Company Name *"
            value={companyName}
            onChangeText={(t) => { setCompanyName(t); setErrors({ ...errors, companyName: '' }); }}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="office-building" />}
            error={!!errors.companyName}
          />
          {errors.companyName ? <Text style={styles.errorText}>{errors.companyName}</Text> : null}

          <TextInput
            label="GST Number"
            value={gstNumber}
            onChangeText={setGstNumber}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            autoCapitalize="characters"
            left={<TextInput.Icon icon="card-account-details" />}
          />

          <TextInput
            label="PAN Number"
            value={panNumber}
            onChangeText={setPanNumber}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            autoCapitalize="characters"
            left={<TextInput.Icon icon="credit-card" />}
          />
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={18} color="#0D9488" />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Contact Details
            </Text>
          </View>

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: '' }); }}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
            error={!!errors.email}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Business Address *"
            value={address}
            onChangeText={(t) => { setAddress(t); setErrors({ ...errors, address: '' }); }}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="map-marker" />}
            error={!!errors.address}
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={18} color="#0D9488" />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Additional Details
              <Text style={styles.optionalTag}> (Optional)</Text>
            </Text>
          </View>

          <TextInput
            label="Bank Account Details"
            value={bankDetails}
            onChangeText={setBankDetails}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            multiline
            numberOfLines={3}
            placeholder="Bank name, account number, IFSC..."
            left={<TextInput.Icon icon="bank" />}
          />

          <TextInput
            label="Terms & Conditions"
            value={termsConditions}
            onChangeText={setTermsConditions}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            multiline
            numberOfLines={3}
            placeholder="Default terms for your documents..."
            left={<TextInput.Icon icon="file-document" />}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !companyName.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!companyName.trim()}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.saveButtonText}>Save & Continue</Text>
        </TouchableOpacity>

        <Text style={[styles.skipNote, { color: theme.colors.onSurfaceVariant }]}>
          You can update these details later from Profile settings
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0D9488',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 200,
    gap: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  optionalTag: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: '#94A3B8',
  },
  imageRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imagePicker: {
    flex: 1,
    height: 100,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
    resizeMode: 'contain',
  },
  imagePickerText: {
    fontSize: FontSize.xs,
    color: '#64748B',
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: '#EF4444',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#0D9488',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#fff',
  },
  skipNote: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
