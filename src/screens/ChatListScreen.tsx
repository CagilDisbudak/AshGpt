import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    useWindowDimensions,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getChats, deleteChat, SavedChat } from '../storage/chats';
import { useTheme } from '../theme/ThemeContext';

const formatDate = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const ChatListScreen = () => {
    const { colors } = useTheme();
    const [chatList, setChatList] = useState<SavedChat[]>([]);
    const { width } = useWindowDimensions();
    const navigation = useNavigation<any>();

    const loadList = useCallback(async () => {
        const list = await getChats();
        setChatList(list);
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadList);
        loadList();
        return unsubscribe;
    }, [navigation, loadList]);

    const openChat = (chat: SavedChat | null) => {
        navigation.navigate('Chat', { chatId: chat?.id ?? null });
    };

    const confirmDelete = (item: SavedChat) => {
        Alert.alert(
            'Sohbeti sil',
            `"${item.title}" silinsin mi?`,
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => deleteChat(item.id).then(loadList) },
            ]
        );
    };

    const cardPadding = Math.max(16, Math.min(24, width * 0.05));
    const avatarSize = Math.min(52, width * 0.13);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.hero, { paddingHorizontal: cardPadding, backgroundColor: colors.surface }]}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>Sohbetler</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Konuşmalarınız burada</Text>
            </View>

            <TouchableOpacity
                style={[styles.newChatCard, { marginHorizontal: cardPadding, padding: cardPadding, backgroundColor: colors.cardBackground }]}
                onPress={() => openChat(null)}
                activeOpacity={0.7}
            >
                <View style={[styles.newChatIconWrap, { width: avatarSize, height: avatarSize, backgroundColor: colors.newChatIconBg }]}>
                    <Ionicons name="add" size={28} color={colors.primary} />
                </View>
                <View style={styles.newChatTextWrap}>
                    <Text style={[styles.newChatTitle, { color: colors.primary }]}>Yeni sohbet</Text>
                    <Text style={[styles.newChatSubtitle, { color: colors.textSecondary }]}>Yeni bir konuşma başlat</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <FlatList
                data={chatList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContent, { paddingHorizontal: cardPadding }]}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons name="chatbubbles-outline" size={56} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz sohbet yok</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Yeni sohbet ile başlayın</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const lastMsg = item.messages.length > 0
                        ? item.messages[item.messages.length - 1]?.content?.slice(0, 50) || ''
                        : '';
                    return (
                        <TouchableOpacity
                            style={[styles.chatCard, { padding: cardPadding, backgroundColor: colors.cardBackground }]}
                            onPress={() => openChat(item)}
                            onLongPress={() => confirmDelete(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.avatar, { width: avatarSize, height: avatarSize, backgroundColor: colors.avatarBg }]}>
                                <Text style={[styles.avatarText, { color: colors.avatarText }]} numberOfLines={1}>
                                    {item.title.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                            <View style={styles.chatCardBody}>
                                <View style={styles.chatCardRow}>
                                    <Text style={[styles.chatCardTitle, { color: colors.text }]} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.chatCardDate, { color: colors.textSecondary }]}>{formatDate(item.updatedAt)}</Text>
                                </View>
                                {lastMsg ? (
                                    <Text style={[styles.chatCardPreview, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {lastMsg}
                                    </Text>
                                ) : null}
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hero: {
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    newChatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    newChatIconWrap: {
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    newChatTextWrap: {
        flex: 1,
    },
    newChatTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    newChatSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    listContent: {
        paddingBottom: 24,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    avatar: {
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
    },
    chatCardBody: {
        flex: 1,
        minWidth: 0,
    },
    chatCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chatCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    chatCardDate: {
        fontSize: 12,
        marginLeft: 8,
    },
    chatCardPreview: {
        fontSize: 14,
        marginTop: 4,
    },
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 17,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
    },
});

export default ChatListScreen;
