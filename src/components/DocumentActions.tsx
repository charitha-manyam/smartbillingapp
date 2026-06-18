import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';

export type ActionItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
};

interface DocumentActionsProps {
  actions: ActionItem[];
}

export function DocumentActions({ actions }: DocumentActionsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: (action.color || theme.colors.primary) + '20' },
            ]}
          >
            <Ionicons
              name={action.icon}
              size={22}
              color={action.color || theme.colors.primary}
            />
          </View>
          <Text
            style={[styles.actionLabel, { color: action.color || theme.colors.primary }]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minWidth: 90,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
