import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';
import { getInitials } from '../../utils';

export default function ProfileScreen() {
  const theme = useTheme();
  const { state, dispatch, logout, toggleDarkMode } = useApp();
  const companyName = state.company?.companyName || '';
  const companyLogo = state.company?.companyLogo;
  const [isEditing, setIsEditing] = useState(!state.company);
  const [company, setCompany] = useState<Company>(
    state.company || {
      id: '1',
      companyName: '',
      gstNumber: '',
      panNumber: '',
      address: '',
      email: '',
      phoneNumber: '',
      bankDetails: '',
      termsConditions: '',
    }
  );

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const srcUri = result.assets[0].uri;
      let finalUri = srcUri;
      try {
        const destFile = new File(Paths.document, 'company_logo.png');
        await new File(srcUri).copy(destFile, { overwrite: true });
        finalUri = destFile.uri;
      } catch {
        // keep srcUri as fallback
      }
      setCompany((prev) => ({ ...prev, companyLogo: finalUri }));
    }
  };

  const handleSave = () => {
    dispatch({ type: 'SET_COMPANY', payload: { ...company, id: '1' } });
    setIsEditing(false);
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isEditing ? pickLogo : undefined}
          activeOpacity={isEditing ? 0.7 : 1}
        >
          {(isEditing ? company.companyLogo : companyLogo) ? (
            <Image source={{ uri: isEditing ? company.companyLogo : companyLogo }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarInitials}>{getInitials(companyName) || <Ionicons name="business" size={32} color="white" />}</Text>
            </View>
          )}
          {isEditing && (
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Company Details
          </Text>

          {isEditing ? (
            <>
              <TextInput
                label="Company Name"
                value={company.companyName}
                onChangeText={(v) => setCompany({ ...company, companyName: v })}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="GST Number"
                value={company.gstNumber}
                onChangeText={(v) => setCompany({ ...company, gstNumber: v })}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="PAN Number"
                value={company.panNumber}
                onChangeText={(v) => setCompany({ ...company, panNumber: v })}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Address"
                value={company.address}
                onChangeText={(v) => setCompany({ ...company, address: v })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <TextInput
                label="Email"
                value={company.email}
                onChangeText={(v) => setCompany({ ...company, email: v })}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
              />
              <TextInput
                label="Phone Number"
                value={company.phoneNumber}
                onChangeText={(v) => setCompany({ ...company, phoneNumber: v })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
              />
              <TextInput
                label="Bank Details"
                value={company.bankDetails}
                onChangeText={(v) => setCompany({ ...company, bankDetails: v })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <TextInput
                label="Terms & Conditions"
                value={company.termsConditions}
                onChangeText={(v) => setCompany({ ...company, termsConditions: v })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />
              <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
                Save Company Details
              </Button>
            </>
          ) : (
            <>
              <ProfileField icon="business" label="Company" value={company.companyName} theme={theme} />
              <ProfileField icon="card" label="GST" value={company.gstNumber} theme={theme} />
              <ProfileField icon="document" label="PAN" value={company.panNumber} theme={theme} />
              <ProfileField icon="location" label="Address" value={company.address} theme={theme} />
              <ProfileField icon="mail" label="Email" value={company.email} theme={theme} />
              <ProfileField icon="call" label="Phone" value={company.phoneNumber} theme={theme} />
              <ProfileField icon="wallet" label="Bank" value={company.bankDetails} theme={theme} />
              <ProfileField icon="document-text" label="Terms" value={company.termsConditions} theme={theme} />
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editBtn}
              >
                Edit Details
              </Button>
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Settings
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={22} color={theme.colors.onSurface} />
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={state.isDarkMode}
              onValueChange={toggleDarkMode}
              color={theme.colors.primary}
            />
          </View>
        </View>

        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutBtn}
          buttonColor="#EF4444"
        >
          <Ionicons name="log-out" size={18} color="white" /> Logout
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

function ProfileField({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.fieldRow}>
      <Ionicons name={icon} size={18} color={theme.colors.onSurfaceVariant} />
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
        <Text style={[styles.fieldValue, { color: theme.colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: -40,
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarInitials: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#fff',
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.md,
  },
  saveBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  editBtn: {
    marginTop: Spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  logoutBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
