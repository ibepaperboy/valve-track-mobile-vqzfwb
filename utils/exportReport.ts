
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ValveJob, getStatusFromPercent } from '@/types/ValveJob';
import { Platform } from 'react-native';

export interface ExportOptions {
  format: 'excel' | 'csv';
  includeStats?: boolean;
}

/**
 * Formats a date to a readable string
 */
const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date with time to a readable string
 */
const formatDateTime = (date: Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generates statistics from jobs
 */
const generateStats = (jobs: ValveJob[]) => {
  return {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    onHold: jobs.filter(j => j.status === 'on-hold').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    highPriority: jobs.filter(j => j.priority === 'high').length,
    mediumPriority: jobs.filter(j => j.priority === 'medium').length,
    lowPriority: jobs.filter(j => j.priority === 'low').length,
    averageProgress: Math.round(jobs.reduce((sum, j) => sum + (j.percentComplete || 0), 0) / jobs.length),
  };
};

/**
 * Exports valve repair jobs to an Excel or CSV file
 */
export const exportReport = async (
  jobs: ValveJob[],
  options: ExportOptions = { format: 'excel', includeStats: true }
): Promise<void> => {
  try {
    console.log('Starting export with', jobs.length, 'jobs');

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Prepare job data for export
    const jobData = jobs.map(job => ({
      'Valve ID': job.valveId,
      'Description': job.description,
      '% Complete': job.percentComplete || 0,
      'Job Status': getStatusFromPercent(job.percentComplete || 0),
      'Priority': job.priority,
      'Assigned To': job.assignedTo || '',
      'Notes': job.notes || '',
      'Created Date': formatDate(job.createdAt),
      'Updated Date': formatDate(job.updatedAt),
      'Est. Completion': formatDate(job.estimatedCompletion),
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add jobs sheet
    const jobsSheet = XLSX.utils.json_to_sheet(jobData);
    
    // Set column widths
    jobsSheet['!cols'] = [
      { wch: 12 }, // Valve ID
      { wch: 30 }, // Description
      { wch: 10 }, // % Complete
      { wch: 20 }, // Job Status
      { wch: 10 }, // Priority
      { wch: 15 }, // Assigned To
      { wch: 30 }, // Notes
      { wch: 15 }, // Created Date
      { wch: 15 }, // Updated Date
      { wch: 15 }, // Est. Completion
    ];

    XLSX.utils.book_append_sheet(wb, jobsSheet, 'Valve Repair Jobs');

    // Add statistics sheet if requested
    if (options.includeStats) {
      const stats = generateStats(jobs);
      const statsData = [
        { 'Metric': 'Total Jobs', 'Count': stats.total },
        { 'Metric': 'Average Progress', 'Count': `${stats.averageProgress}%` },
        { 'Metric': '', 'Count': '' },
        { 'Metric': 'Status Breakdown', 'Count': '' },
        { 'Metric': 'Pending', 'Count': stats.pending },
        { 'Metric': 'In Progress', 'Count': stats.inProgress },
        { 'Metric': 'On Hold', 'Count': stats.onHold },
        { 'Metric': 'Completed', 'Count': stats.completed },
        { 'Metric': '', 'Count': '' },
        { 'Metric': 'Priority Breakdown', 'Count': '' },
        { 'Metric': 'High Priority', 'Count': stats.highPriority },
        { 'Metric': 'Medium Priority', 'Count': stats.mediumPriority },
        { 'Metric': 'Low Priority', 'Count': stats.lowPriority },
      ];

      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      statsSheet['!cols'] = [
        { wch: 20 }, // Metric
        { wch: 10 }, // Count
      ];

      XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistics');
    }

    // Generate file based on format
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `valve_repair_report_${timestamp}.${options.format === 'csv' ? 'csv' : 'xlsx'}`;
    
    let fileContent: string;
    let mimeType: string;

    if (options.format === 'csv') {
      // For CSV, only export the jobs sheet
      fileContent = XLSX.utils.sheet_to_csv(jobsSheet);
      mimeType = 'text/csv';
    } else {
      // For Excel, export the full workbook
      fileContent = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    // Get cache directory - destructure from FileSystem to avoid namespace issues
    const { cacheDirectory } = FileSystem;
    if (!cacheDirectory) {
      throw new Error('Cache directory is not available');
    }

    // Save file to cache directory
    const fileUri = `${cacheDirectory}${fileName}`;
    
    if (options.format === 'csv') {
      // Use string encoding option directly
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: 'utf8',
      });
    } else {
      // Use base64 encoding option directly
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: 'base64',
      });
    }

    console.log('File saved to:', fileUri);

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: 'Export Valve Repair Report',
      UTI: options.format === 'csv' ? 'public.comma-separated-values-text' : 'com.microsoft.excel.xlsx',
    });

    console.log('Export completed successfully');
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

/**
 * Exports a quick CSV report (lighter weight option)
 */
export const exportQuickCSV = async (jobs: ValveJob[]): Promise<void> => {
  return exportReport(jobs, { format: 'csv', includeStats: false });
};

/**
 * Exports a full Excel report with statistics
 */
export const exportFullReport = async (jobs: ValveJob[]): Promise<void> => {
  return exportReport(jobs, { format: 'excel', includeStats: true });
};
