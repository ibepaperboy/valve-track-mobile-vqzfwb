
import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { ValveJob, JobStatus } from '@/types/ValveJob';
import { loadJobs, saveJobs } from '@/utils/storage';

export default function AddJobScreen() {
  const router = useRouter();
  const [valveId, setValveId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<JobStatus>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!valveId.trim()) {
      Alert.alert('Error', 'Please enter a valve ID');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      const jobs = await loadJobs();
      
      // Check if valve ID already exists
      if (jobs.some(job => job.valveId === valveId.trim())) {
        Alert.alert('Error', 'A job with this valve ID already exists');
        return;
      }

      const newJob: ValveJob = {
        id: `job-${Date.now()}`,
        valveId: valveId.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedJobs = [...jobs, newJob];
      await saveJobs(updatedJobs);

      Alert.alert('Success', 'Job created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.alert('Error', 'Failed to create job');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add New Job',
          presentation: 'modal',
        }}
      />
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Valve ID *</Text>
          <TextInput
            style={commonStyles.input}
            value={valveId}
            onChangeText={setValveId}
            placeholder="e.g., VLV-001"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[commonStyles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter job description"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusButtons}>
            {(['pending', 'in-progress', 'on-hold', 'completed'] as JobStatus[]).map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.statusButton,
                  status === s && styles.statusButtonActive,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === s && styles.statusButtonTextActive,
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityButtons}>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Assigned To</Text>
          <TextInput
            style={commonStyles.input}
            value={assignedTo}
            onChangeText={setAssignedTo}
            placeholder="Enter technician name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[commonStyles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter additional notes"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <Pressable style={[buttonStyles.primary, styles.saveButton]} onPress={handleSave}>
          <Text style={commonStyles.buttonText}>Create Job</Text>
        </Pressable>

        <Pressable
          style={[buttonStyles.outline, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.buttonTextOutline}>Cancel</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusButtonTextActive: {
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
  saveButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: Platform.OS !== 'ios' ? 80 : 20,
  },
});
