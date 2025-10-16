
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobStatus } from '@/types/ValveJob';
import { colors } from '@/styles/commonStyles';

interface StatusBadgeProps {
  status: JobStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in-progress':
        return colors.primary;
      case 'pending':
        return colors.warning;
      case 'on-hold':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'on-hold':
        return 'On Hold';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() + '20' }]}>
      <Text style={[styles.badgeText, { color: getStatusColor() }]}>
        {getStatusLabel()}
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
