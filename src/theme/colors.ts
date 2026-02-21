import type { ThemeMode } from '../storage/settings';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryDisabled: string;
  border: string;
  userBubble: string;
  assistantBubble: string;
  userBubbleText: string;
  assistantBubbleText: string;
  cardBackground: string;
  cardShadow: string;
  statusConnected: string;
  statusError: string;
  statusChecking: string;
  inputBackground: string;
  placeholder: string;
  headerBackground: string;
  newChatIconBg: string;
  avatarBg: string;
  avatarText: string;
  danger: string;
  success: string;
}

export const LIGHT_COLORS: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  primaryDisabled: '#A1C9F1',
  border: '#E9E9EB',
  userBubble: '#007AFF',
  assistantBubble: '#E9E9EB',
  userBubbleText: '#FFFFFF',
  assistantBubbleText: '#000000',
  cardBackground: '#FFFFFF',
  cardShadow: '#000000',
  statusConnected: '#34C759',
  statusError: '#FF3B30',
  statusChecking: '#FFCC00',
  inputBackground: '#F2F2F7',
  placeholder: '#8E8E93',
  headerBackground: '#FFFFFF',
  newChatIconBg: '#E8F4FF',
  avatarBg: '#E9E9EB',
  avatarText: '#3C3C43',
  danger: '#FF3B30',
  success: '#34C759',
};

export const DARK_COLORS: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#0A84FF',
  primaryDisabled: '#3A3A3C',
  border: '#38383A',
  userBubble: '#0A84FF',
  assistantBubble: '#2C2C2E',
  userBubbleText: '#FFFFFF',
  assistantBubbleText: '#FFFFFF',
  cardBackground: '#1E1E1E',
  cardShadow: '#000000',
  statusConnected: '#30D158',
  statusError: '#FF453A',
  statusChecking: '#FFD60A',
  inputBackground: '#2C2C2E',
  placeholder: '#8E8E93',
  headerBackground: '#1C1C1E',
  newChatIconBg: '#1A3A2E',
  avatarBg: '#38383A',
  avatarText: '#EBEBF0',
  danger: '#FF453A',
  success: '#30D158',
};

export const CHATGPT_COLORS: ThemeColors = {
  background: '#343541',
  surface: '#444654',
  text: '#ECECF1',
  textSecondary: '#C5C5D2',
  primary: '#10a37f',
  primaryDisabled: '#2D4A42',
  border: '#565869',
  userBubble: '#10a37f',
  assistantBubble: '#444654',
  userBubbleText: '#FFFFFF',
  assistantBubbleText: '#ECECF1',
  cardBackground: '#40414F',
  cardShadow: '#000000',
  statusConnected: '#10a37f',
  statusError: '#EF4444',
  statusChecking: '#EAB308',
  inputBackground: '#40414F',
  placeholder: '#8E8E93',
  headerBackground: '#343541',
  newChatIconBg: '#2D4A42',
  avatarBg: '#565869',
  avatarText: '#ECECF1',
  danger: '#EF4444',
  success: '#10a37f',
};

export function getColorsForTheme(theme: ThemeMode): ThemeColors {
  switch (theme) {
    case 'dark':
      return DARK_COLORS;
    case 'chatgpt':
      return CHATGPT_COLORS;
    default:
      return LIGHT_COLORS;
  }
}
