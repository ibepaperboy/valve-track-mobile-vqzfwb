
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ValveJob, getColorFromPercent } from '@/types/ValveJob';
import { colors, commonStyles } from '@/styles/commonStyles';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { IconSymbol } from './IconSymbol';
import { useRouter } from 'expo-router';

interface ValveJobCardProps {
  job: ValveJob;
}

export default function ValveJobCard({ job }: ValveJobCardProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    router.push(`/jobDetails/${job.id}`);
  };

  const progressColor = getColorFromPercent(job.percentComplete || 0);

  return (
    <Pressable onPress={handlePress}>
      <View style={[commonStyles.card, styles.card]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.valveId}>{job.valveId}</Text>
            <PriorityBadge priority={job.priority} />
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>

        <View style={styles.statusRow}>
          <StatusBadge percentComplete={job.percentComplete || 0} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${job.percentComplete || 0}%`,
                  backgroundColor: progressColor
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{job.percentComplete || 0}%</Text>
        </View>

        {job.assignedTo && (
          <View style={styles.infoRow}>
            <IconSymbol name="person.fill" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{job.assignedTo}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <IconSymbol name="clock.fill" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>Updated: {formatDate(job.updatedAt)}</Text>
          </View>
          {job.estimatedCompletion && (
            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText}>Due: {formatDate(job.estimatedCompletion)}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valveId: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  statusRow: {
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 6,
  },
});
