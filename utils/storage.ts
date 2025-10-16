
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ValveJob } from '@/types/ValveJob';

const STORAGE_KEY = '@valve_jobs';

export const saveJobs = async (jobs: ValveJob[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(jobs);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log('Jobs saved successfully');
  } catch (e) {
    console.error('Error saving jobs:', e);
    throw e;
  }
};

export const loadJobs = async (): Promise<ValveJob[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const jobs = JSON.parse(jsonValue);
      // Convert date strings back to Date objects
      return jobs.map((job: any) => ({
        ...job,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
        estimatedCompletion: job.estimatedCompletion ? new Date(job.estimatedCompletion) : undefined,
      }));
    }
    return [];
  } catch (e) {
    console.error('Error loading jobs:', e);
    return [];
  }
};

export const clearJobs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Jobs cleared successfully');
  } catch (e) {
    console.error('Error clearing jobs:', e);
    throw e;
  }
};
