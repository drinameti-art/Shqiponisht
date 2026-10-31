import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseProgress, type Progress } from './progress';

const KEY = 'shqiponisht.progress.v1';

export async function loadProgress(): Promise<Progress> {
  try {
    return parseProgress(await AsyncStorage.getItem(KEY));
  } catch {
    return parseProgress(null);
  }
}

/** Saves progress; a storage failure (e.g. blocked browser storage) keeps the in-memory state. */
export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Progress stays in memory for this session.
  }
}
