
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import ValveJobCard from '@/components/ValveJobCard';
import { ValveJob } from '@/types/ValveJob';
import { loadJobs, saveJobs } from '@/utils/storage';
import { generateMockJobs } from '@/utils/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ValveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'on-hold'>('all');

  useEffect(() => {
    loadJobsData();
  }, []);

  const loadJobsData = async () => {
    try {
      setLoading(true);
      let loadedJobs = await loadJobs();
      
      // If no jobs exist, create mock data
      if (loadedJobs.length === 0) {
        loadedJobs = generateMockJobs();
        await saveJobs(loadedJobs);
      }
      
      setJobs(loadedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  const getStatusCount = (status: string) => {
    if (status === 'all') return jobs.length;
    return jobs.filter(job => job.status === status).length;
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => router.push('/upload')}
      style={styles.headerButton}
    >
      <IconSymbol name="arrow.up.doc.fill" color={colors.primary} size={24} />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => router.push('/addJob')}
      style={styles.headerButton}
    >
      <IconSymbol name="plus.circle.fill" color={colors.primary} size={24} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Valve Repairs',
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[commonStyles.container, styles.container]}>
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/8fa4f820-7f52-4a4c-b32e-2fe9e3a04387.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Valve Repair Tracker</Text>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <Pressable
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                All ({getStatusCount('all')})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                Pending ({getStatusCount('pending')})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'in-progress' && styles.filterButtonActive]}
              onPress={() => setFilter('in-progress')}
            >
              <Text style={[styles.filterText, filter === 'in-progress' && styles.filterTextActive]}>
                In Progress ({getStatusCount('in-progress')})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'on-hold' && styles.filterButtonActive]}
              onPress={() => setFilter('on-hold')}
            >
              <Text style={[styles.filterText, filter === 'on-hold' && styles.filterTextActive]}>
                On Hold ({getStatusCount('on-hold')})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                Completed ({getStatusCount('completed')})
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={commonStyles.text}>Loading jobs...</Text>
            </View>
          ) : filteredJobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="wrench.and.screwdriver" size={64} color={colors.textSecondary} />
              <Text style={[commonStyles.subtitle, styles.emptyTitle]}>No Jobs Found</Text>
              <Text style={[commonStyles.textSecondary, styles.emptyText]}>
                {filter === 'all' 
                  ? 'Add a new job to get started' 
                  : `No ${filter} jobs at the moment`}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <ValveJobCard key={job.id} job={job} />
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  logoContainer: {
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  filterContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 12,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
});
