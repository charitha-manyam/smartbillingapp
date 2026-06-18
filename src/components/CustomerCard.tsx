import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants';
import { getInitials, getStatusColor, getStatusLabel } from '../utils';

interface CustomerCardProps {
  name: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerCard({ name, phone, email, gstNumber, onPress, onEdit, onDelete }: CustomerCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
          {getInitials(name)}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
        <Text style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}>{phone}</Text>
        {email ? (
          <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{email}</Text>
        ) : null}
        {gstNumber ? (
          <Text style={[styles.gst, { color: theme.colors.onSurfaceVariant }]}>GST: {gstNumber}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  phone: {
    fontSize: FontSize.md,
  },
  email: {
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  gst: {
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: Spacing.sm,
  },
});
