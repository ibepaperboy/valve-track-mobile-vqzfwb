
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { ValveJob, JobStatus, getColorFromPercent } from '@/types/ValveJob';
import { loadJobs, saveJobs } from '@/utils/storage';

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<ValveJob | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<ValveJob | null>(null);

  const loadJobData = useCallback(async () => {
    try {
      const jobs = await loadJobs();
      const foundJob = jobs.find((j) => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        setEditedJob(foundJob);
      } else {
        Alert.alert('Error', 'Job not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert('Error', 'Failed to load job details');
    }
  }, [jobId, router]);

  useEffect(() => {
    loadJobData();
  }, [loadJobData]);

  const handleSave = async () => {
    if (!editedJob) return;

    try {
      const jobs = await loadJobs();
      const updatedJobs = jobs.map((j) =>
        j.id === editedJob.id ? { ...editedJob, updatedAt: new Date() } : j
      );
      await saveJobs(updatedJobs);
      setJob({ ...editedJob, updatedAt: new Date() });
      setIsEditing(false);
      Alert.alert('Success', 'Job updated successfully');
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.alert('Error', 'Failed to save job');
    }
  };

  const handleCancel = () => {
    setEditedJob(job);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const jobs = await loadJobs();
              const updatedJobs = jobs.filter((j) => j.id !== jobId);
              await saveJobs(updatedJobs);
              router.back();
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => {
        if (isEditing) {
          handleSave();
        } else {
          setIsEditing(true);
        }
      }}
      style={styles.headerButton}
    >
      <Text style={[styles.headerButtonText, { color: colors.primary }]}>
        {isEditing ? 'Save' : 'Edit'}
      </Text>
    </Pressable>
  );

  const percentOptions = [0, 10, 15, 20, 30, 40, 60, 65, 70, 80, 95, 100];

  if (!job || !editedJob) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const progressColor = getColorFromPercent(editedJob.percentComplete || 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: job.valveId,
          headerRight: renderHeaderRight,
        }}
      />
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Valve ID</Text>
          {isEditing ? (
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={editedJob.valveId}
              onChangeText={(text) => setEditedJob({ ...editedJob, valveId: text })}
              placeholder="Enter valve ID"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{job.valveId}</Text>
          )}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[commonStyles.input, styles.input, styles.textArea]}
              value={editedJob.description}
              onChangeText={(text) => setEditedJob({ ...editedJob, description: text })}
              placeholder="Enter description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.value}>{job.description}</Text>
          )}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Status & Progress</Text>
          <StatusBadge percentComplete={editedJob.percentComplete || 0} />
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${editedJob.percentComplete || 0}%`,
                    backgroundColor: progressColor
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{editedJob.percentComplete || 0}%</Text>
          </View>

          {isEditing && (
            <View style={styles.percentButtons}>
              {percentOptions.map((percent) => (
                <Pressable
                  key={percent}
                  style={[
                    styles.percentButton,
                    editedJob.percentComplete === percent && styles.percentButtonActive,
                  ]}
                  onPress={() => setEditedJob({ ...editedJob, percentComplete: percent })}
                >
                  <Text
                    style={[
                      styles.percentButtonText,
                      editedJob.percentComplete === percent && styles.percentButtonTextActive,
                    ]}
                  >
                    {percent}%
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Priority</Text>
          {isEditing ? (
            <View style={styles.priorityButtons}>
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <Pressable
                  key={priority}
                  style={[
                    styles.priorityButton,
                    editedJob.priority === priority && styles.priorityButtonActive,
                  ]}
                  onPress={() => setEditedJob({ ...editedJob, priority })}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      editedJob.priority === priority && styles.priorityButtonTextActive,
                    ]}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <PriorityBadge priority={job.priority} />
          )}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Assigned To</Text>
          {isEditing ? (
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={editedJob.assignedTo || ''}
              onChangeText={(text) => setEditedJob({ ...editedJob, assignedTo: text })}
              placeholder="Enter technician name"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{job.assignedTo || 'Not assigned'}</Text>
          )}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[commonStyles.input, styles.input, styles.textArea]}
              value={editedJob.notes || ''}
              onChangeText={(text) => setEditedJob({ ...editedJob, notes: text })}
              placeholder="Enter notes"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.value}>{job.notes || 'No notes'}</Text>
          )}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <View style={styles.infoRow}>
            <IconSymbol name="clock.fill" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(job.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="clock.fill" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(job.updatedAt)}</Text>
          </View>
          {job.estimatedCompletion && (
            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Est. Completion:</Text>
              <Text style={styles.infoValue}>{formatDate(job.estimatedCompletion)}</Text>
            </View>
          )}
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <Pressable style={[buttonStyles.outline, styles.cancelButton]} onPress={handleCancel}>
              <Text style={commonStyles.buttonTextOutline}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {!isEditing && (
          <Pressable style={[buttonStyles.primary, styles.deleteButton]} onPress={handleDelete}>
            <Text style={[commonStyles.buttonText, { color: colors.error }]}>Delete Job</Text>
          </Pressable>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  input: {
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    minWidth: 45,
    textAlign: 'right',
  },
  percentButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  percentButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  percentButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  percentButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  percentButtonTextActive: {
    color: '#ffffff',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  priorityButtonTextActive: {
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  actionButtons: {
    marginTop: 8,
  },
  cancelButton: {
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
    marginTop: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: Platform.OS !== 'ios' ? 80 : 20,
  },
});
