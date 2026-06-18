import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, useTheme, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { ReportFilter } from '../types';

interface FilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filter: ReportFilter) => void;
  currentFilter: ReportFilter;
}

export function FilterModal({ visible, onDismiss, onApply, currentFilter }: FilterModalProps) {
  const theme = useTheme();
  const [type, setType] = React.useState(currentFilter.type);

  const handleApply = () => {
    const filter: ReportFilter = { type };
    if (type === 'custom') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.startDate = start.toISOString();
      filter.endDate = now.toISOString();
    }
    onApply(filter);
    onDismiss();
  };

  const options: { label: string; value: ReportFilter['type'] }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Filter Reports</Text>
            <TouchableOpacity onPress={onDismiss}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <RadioButton.Group onValueChange={(v) => setType(v as ReportFilter['type'])} value={type}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.option}
                  onPress={() => setType(opt.value)}
                >
                  <RadioButton value={opt.value} />
                  <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </ScrollView>

          <Button mode="contained" onPress={handleApply} style={styles.applyBtn}>
            Apply Filter
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  optionLabel: {
    fontSize: FontSize.lg,
    marginLeft: Spacing.sm,
  },
  applyBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
});
