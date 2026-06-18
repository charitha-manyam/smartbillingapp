import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  visible: boolean;
  value?: Date;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
  title?: string;
}

export function DatePickerModal({ visible, value, onConfirm, onDismiss, title = 'Select Date' }: Props) {
  const theme = useTheme();
  const today = new Date();

  const [viewYear, setViewYear] = useState(() => (value || today).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (value || today).getMonth());
  const [selected, setSelected] = useState<Date | null>(value ?? null);

  useEffect(() => {
    if (visible) {
      const d = value || today;
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setSelected(value ?? null);
    }
  }, [visible]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isSel = (day: number) =>
    selected !== null &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  // Build rows: pad with null for leading blank cells
  const leadingBlanks = Array<null>(firstDayOfWeek).fill(null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCells = [...leadingBlanks, ...dayCells];
  while (allCells.length % 7 !== 0) allCells.push(null as any);
  const rows: (number | null)[][] = Array.from(
    { length: allCells.length / 7 },
    (_, i) => allCells.slice(i * 7, i * 7 + 7) as (number | null)[]
  );

  const handleConfirm = () => {
    if (selected) { onConfirm(selected); onDismiss(); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onDismiss} activeOpacity={1} />
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Month nav */}
          <View style={styles.nav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={20} color="#0D9488" />
            </TouchableOpacity>
            <Text style={[styles.monthYear, { color: theme.colors.onSurface }]}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-forward" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.weekRow}>
            {DAYS.map(d => (
              <Text key={d} style={styles.weekLabel}>{d}</Text>
            ))}
          </View>

          {/* Grid rows */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((day, ci) => {
                const sel = day !== null && isSel(day);
                const tod = day !== null && isToday(day);
                return (
                  <TouchableOpacity
                    key={ci}
                    style={[styles.cell, sel && styles.cellSel, tod && !sel && styles.cellToday]}
                    onPress={() => day !== null && setSelected(new Date(viewYear, viewMonth, day))}
                    disabled={day === null}
                    activeOpacity={0.75}
                  >
                    {day !== null && (
                      <Text style={[
                        styles.cellText,
                        { color: sel ? '#fff' : tod ? '#0D9488' : theme.colors.onSurface },
                        (sel || tod) && styles.cellTextBold,
                      ]}>
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onDismiss} style={styles.btnCancel}>
              <Text style={[styles.btnText, { color: '#64748B' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.btnConfirm, !selected && styles.btnDisabled]}
              disabled={!selected}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function formatDisplayDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: Spacing.xl,
    elevation: 12,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#0D9488',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.4,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYear: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#94A3B8',
    paddingVertical: 4,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    margin: 1,
  },
  cellSel: {
    backgroundColor: '#0D9488',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: '#0D9488',
  },
  cellText: {
    fontSize: FontSize.sm,
  },
  cellTextBold: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  btnCancel: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  btnConfirm: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0D9488',
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  btnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
