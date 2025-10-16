
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityLabel = () => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <View style={[styles.badge, { borderColor: getPriorityColor() }]}>
      <Text style={[styles.badgeText, { color: getPriorityColor() }]}>
        {getPriorityLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
