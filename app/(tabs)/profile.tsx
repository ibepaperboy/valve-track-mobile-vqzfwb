
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { loadJobs, clearJobs, saveJobs } from '@/utils/storage';
import { generateMockJobs } from '@/utils/mockData';
import { ValveJob } from '@/types/ValveJob';

export default function ProfileScreen() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const jobs = await loadJobs();
      setStats({
        total: jobs.length,
        pending: jobs.filter(j => j.status === 'pending').length,
        inProgress: jobs.filter(j => j.status === 'in-progress').length,
        onHold: jobs.filter(j => j.status === 'on-hold').length,
        completed: jobs.filter(j => j.status === 'completed').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to delete all jobs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearJobs();
              await loadStats();
              Alert.alert('Success', 'All jobs have been deleted');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  const handleLoadSampleData = () => {
    Alert.alert(
      'Load Sample Data',
      'This will add sample valve repair jobs to your list. Existing jobs will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: async () => {
            try {
              const existingJobs = await loadJobs();
              const sampleJobs = generateMockJobs();
              
              // Add unique IDs to avoid conflicts
              const newJobs = sampleJobs.map((job, index) => ({
                ...job,
                id: `sample-${Date.now()}-${index}`,
                valveId: `${job.valveId}-${Date.now()}`,
              }));
              
              await saveJobs([...existingJobs, ...newJobs]);
              await loadStats();
              Alert.alert('Success', `Added ${newJobs.length} sample jobs`);
            } catch (error) {
              console.error('Error loading sample data:', error);
              Alert.alert('Error', 'Failed to load sample data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={commonStyles.container} 
      contentContainerStyle={[
        styles.content,
        Platform.OS !== 'ios' && styles.contentWithTabBar
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol name="wrench.and.screwdriver.fill" size={48} color={colors.primary} />
        </View>
        <Text style={[commonStyles.title, styles.title]}>Valve Repair Tracker</Text>
        <Text style={[commonStyles.textSecondary, styles.subtitle]}>
          Maintenance Shop Management
        </Text>
      </View>

      <View style={[commonStyles.card, styles.statsCard]}>
        <Text style={styles.statsTitle}>Job Statistics</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.onHold}</Text>
            <Text style={styles.statLabel}>On Hold</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={[commonStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <Pressable style={styles.menuItem} onPress={handleLoadSampleData}>
          <View style={styles.menuIconContainer}>
            <IconSymbol name="doc.badge.plus" size={24} color={colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Load Sample Data</Text>
            <Text style={styles.menuDescription}>Add example valve repair jobs</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.menuDivider} />

        <Pressable style={styles.menuItem} onPress={handleResetData}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.error + '20' }]}>
            <IconSymbol name="trash.fill" size={24} color={colors.error} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: colors.error }]}>Reset All Data</Text>
            <Text style={styles.menuDescription}>Delete all valve repair jobs</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[commonStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          This app helps you track valve repairs in your maintenance shop. You can add jobs manually, 
          update them individually, or upload an Excel file for bulk updates.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  contentWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: Platform.OS !== 'ios' ? 80 : 20,
  },
});
