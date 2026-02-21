import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'chatgpt';

export interface Settings {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  theme: ThemeMode;
}

const SETTINGS_KEY = '@jan_ai_settings';

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: '',
  apiKey: '',
  model: 'Meta-Llama-3_1-8B-Instruct-IQ4_XS',
  temperature: 0.6,
  maxTokens: 512,
  theme: 'light',
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const loadSettings = async (): Promise<Settings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    if (jsonValue == null) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(jsonValue);
    return { ...DEFAULT_SETTINGS, ...parsed, theme: parsed.theme ?? DEFAULT_SETTINGS.theme };
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
};

export const getThemeFromSettings = async (): Promise<ThemeMode> => {
  const s = await loadSettings();
  return s.theme ?? 'light';
};
