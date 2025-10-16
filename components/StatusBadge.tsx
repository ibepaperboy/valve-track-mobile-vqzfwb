
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusFromPercent, getColorFromPercent } from '@/types/ValveJob';

interface StatusBadgeProps {
  percentComplete: number;
}

export default function StatusBadge({ percentComplete }: StatusBadgeProps) {
  const statusLabel = getStatusFromPercent(percentComplete);
  const statusColor = getColorFromPercent(percentComplete);

  return (
    <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
      <Text style={[styles.badgeText, { color: statusColor }]}>
        {statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
