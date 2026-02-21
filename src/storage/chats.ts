import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../api/jan';

export interface SavedChat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const CHATS_KEY = '@jan_chats';

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const getChats = async (): Promise<SavedChat[]> => {
  try {
    const raw = await AsyncStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a: SavedChat, b: SavedChat) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
};

export const getChat = async (id: string): Promise<SavedChat | null> => {
  const chats = await getChats();
  return chats.find((c) => c.id === id) ?? null;
};

export const saveChat = async (chat: SavedChat): Promise<void> => {
  const chats = await getChats();
  const idx = chats.findIndex((c) => c.id === chat.id);
  const updated = { ...chat, updatedAt: Date.now() };
  if (idx >= 0) chats[idx] = updated;
  else chats.unshift(updated);
  await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
};

export const deleteChat = async (id: string): Promise<void> => {
  const chats = (await getChats()).filter((c) => c.id !== id);
  await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
};

export const createChat = (): SavedChat => ({
  id: genId(),
  title: 'Yeni sohbet',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const chatTitleFromMessages = (messages: Message[]): string => {
  const first = messages.find((m) => m.role === 'user');
  if (!first?.content?.trim()) return 'Yeni sohbet';
  const text = first.content.trim();
  return text.length > 40 ? text.slice(0, 37) + '...' : text;
};
