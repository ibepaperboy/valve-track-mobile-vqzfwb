
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ValveJob, JobStatus } from '@/types/ValveJob';
import { loadJobs, saveJobs } from '@/utils/storage';

export default function UploadScreen() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseExcelFile = async (uri: string): Promise<ValveJob[]> => {
    try {
      console.log('Reading file from:', uri);
      
      // Read the file
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      // Parse the Excel file
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Parsed data:', jsonData);

      // Convert to ValveJob format
      const jobs: ValveJob[] = jsonData.map((row: any, index: number) => {
        const now = new Date();
        return {
          id: row.id || `imported-${Date.now()}-${index}`,
          valveId: row.valveId || row.valve_id || row['Valve ID'] || `VLV-${Date.now()}-${index}`,
          description: row.description || row.Description || 'No description',
          status: (row.status || row.Status || 'pending').toLowerCase() as JobStatus,
          priority: (row.priority || row.Priority || 'medium').toLowerCase() as 'low' | 'medium' | 'high',
          assignedTo: row.assignedTo || row.assigned_to || row['Assigned To'] || undefined,
          notes: row.notes || row.Notes || undefined,
          createdAt: row.createdAt ? new Date(row.createdAt) : now,
          updatedAt: now,
          estimatedCompletion: row.estimatedCompletion || row.estimated_completion || row['Estimated Completion']
            ? new Date(row.estimatedCompletion || row.estimated_completion || row['Estimated Completion'])
            : undefined,
        };
      });

      return jobs;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Failed to parse Excel file. Please ensure it has the correct format.');
    }
  };

  const handlePickDocument = async () => {
    try {
      setUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];
      setFileName(file.name);

      // Parse the Excel file
      const newJobs = await parseExcelFile(file.uri);

      if (newJobs.length === 0) {
        Alert.alert('No Data', 'The Excel file contains no valid data.');
        setUploading(false);
        return;
      }

      // Load existing jobs
      const existingJobs = await loadJobs();

      // Merge jobs (update existing or add new)
      const jobMap = new Map(existingJobs.map(job => [job.valveId, job]));
      
      let updatedCount = 0;
      let addedCount = 0;

      newJobs.forEach(newJob => {
        if (jobMap.has(newJob.valveId)) {
          // Update existing job
          const existingJob = jobMap.get(newJob.valveId)!;
          jobMap.set(newJob.valveId, {
            ...existingJob,
            ...newJob,
            id: existingJob.id, // Keep original ID
            createdAt: existingJob.createdAt, // Keep original creation date
            updatedAt: new Date(),
          });
          updatedCount++;
        } else {
          // Add new job
          jobMap.set(newJob.valveId, newJob);
          addedCount++;
        }
      });

      const mergedJobs = Array.from(jobMap.values());
      await saveJobs(mergedJobs);

      setUploading(false);
      
      Alert.alert(
        'Success',
        `Import complete!\n\nAdded: ${addedCount} jobs\nUpdated: ${updatedCount} jobs`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Upload Excel File',
          presentation: 'modal',
        }}
      />
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="arrow.up.doc.fill" size={64} color={colors.primary} />
          </View>
          <Text style={[commonStyles.title, styles.title]}>Upload Excel File</Text>
          <Text style={[commonStyles.textSecondary, styles.subtitle]}>
            Upload an Excel file to add or update multiple valve repair jobs at once.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.instructionsCard]}>
          <Text style={styles.instructionsTitle}>Excel File Format</Text>
          <Text style={styles.instructionsText}>
            Your Excel file should contain the following columns:
          </Text>
          <View style={styles.columnList}>
            <View style={styles.columnItem}>
              <Text style={styles.columnBullet}>•</Text>
              <Text style={styles.columnText}>
                <Text style={styles.columnName}>valveId</Text> - Unique valve identifier (required)
              </Text>
            </View>
            <View style={styles.columnItem}>
              <Text style={styles.columnBullet}>•</Text>
              <Text style={styles.columnText}>
                <Text style={styles.columnName}>description</Text> - Job description (required)
              </Text>
            </View>
            <View style={styles.columnItem}>
              <Text style={styles.columnBullet}>•</Text>
              <Text style={styles.columnText}>
                <Text style={styles.columnName}>status</Text> - pending, in-progress, on-hold, or completed
              </Text>
            </View>
            <View style={styles.columnItem}>
              <Text style={styles.columnBullet}>•</Text>
              <Text style={styles.columnText}>
                <Text style={styles.columnName}>priority</Text> - low, medium, or high
              </Text>
            </View>
            <View style={styles.columnItem}>
              <Text style={styles.columnBullet}>•</Text>
              <Text style={styles.columnText}>
                <Text style={styles.columnName}>assignedTo</Text> - Technician name (optional)
              </Text>
            </View>
            <View style={styles.columnItem}>
              <Text style={styles.columnBullet}>•</Text>
              <Text style={styles.columnText}>
                <Text style={styles.columnName}>notes</Text> - Additional notes (optional)
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.noteCard]}>
          <View style={styles.noteHeader}>
            <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
            <Text style={styles.noteTitle}>Note</Text>
          </View>
          <Text style={styles.noteText}>
            If a valve ID already exists, the job will be updated with the new information. Otherwise, a new job will be created.
          </Text>
        </View>

        {fileName && (
          <View style={[commonStyles.card, styles.fileCard]}>
            <IconSymbol name="doc.fill" size={24} color={colors.secondary} />
            <Text style={styles.fileName}>{fileName}</Text>
          </View>
        )}

        <Pressable
          style={[buttonStyles.primary, styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <IconSymbol name="arrow.up.doc" size={20} color="#ffffff" />
              <Text style={[commonStyles.buttonText, styles.uploadButtonText]}>
                Select Excel File
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[buttonStyles.outline, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={uploading}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  instructionsCard: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  columnList: {
    gap: 8,
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  columnBullet: {
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
    marginTop: 2,
  },
  columnText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  columnName: {
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noteCard: {
    backgroundColor: colors.highlight,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    marginLeft: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
