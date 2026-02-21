import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
    useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message, sendChatRequest, testConnection } from '../api/jan';
import { loadSettings, Settings } from '../storage/settings';
import {
    getChats,
    saveChat,
    getChat,
    deleteChat,
    createChat,
    chatTitleFromMessages,
    SavedChat,
} from '../storage/chats';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [currentChat, setCurrentChat] = useState<SavedChat | null>(null);
    const [chatList, setChatList] = useState<SavedChat[]>([]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [inputBarHeight, setInputBarHeight] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const chatIdFromParams = route.params?.chatId ?? undefined;

    const loadChatList = useCallback(async () => {
        const list = await getChats();
        setChatList(list);
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            const loaded = await loadSettings();
            setSettings(loaded);
            checkConnection(loaded);
        };
        const unsubscribe = navigation.addListener('focus', () => {
            fetchSettings();
            loadChatList();
        });
        fetchSettings();
        loadChatList();
        return unsubscribe;
    }, [navigation, loadChatList]);

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (chatIdFromParams === undefined) return;
        if (chatIdFromParams === null || chatIdFromParams === '') {
            setCurrentChat(null);
            setMessages([]);
            return;
        }
        getChat(chatIdFromParams).then((loaded) => {
            if (loaded) {
                setCurrentChat(loaded);
                setMessages(loaded.messages);
            } else {
                setCurrentChat(null);
                setMessages([]);
            }
        });
    }, [chatIdFromParams]);

    const checkConnection = async (s: Settings) => {
        if (!s?.baseUrl?.trim()) {
            setIsConnected(false);
            return;
        }
        setIsConnected(null);
        const result = await testConnection(s.baseUrl.trim(), s.apiKey);
        setIsConnected(result.success);
    };

    const persistChat = useCallback(
        async (nextMessages: Message[], title?: string) => {
            let chat = currentChat;
            if (!chat) {
                chat = createChat();
                setCurrentChat(chat);
            }
            chat.messages = nextMessages;
            chat.title = title ?? chatTitleFromMessages(nextMessages);
            await saveChat(chat);
            setCurrentChat(chat);
            loadChatList();
        },
        [currentChat, loadChatList]
    );

    const handleSend = async () => {
        if (!inputText.trim() || loading || !settings) return;

        const userMessage: Message = { role: 'user', content: inputText.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputText('');
        setLoading(true);
        Keyboard.dismiss();

        try {
            const response = await sendChatRequest(
                settings.baseUrl,
                settings.apiKey,
                settings.model,
                newMessages,
                settings.temperature,
                settings.maxTokens
            );

            const assistantMessage: Message = { role: 'assistant', content: response };
            const finalMessages = [...newMessages, assistantMessage];
            setMessages(finalMessages);
            await persistChat(finalMessages);
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error.message}`,
            };
            const finalMessages = [...newMessages, errorMessage];
            setMessages(finalMessages);
            await persistChat(finalMessages);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setCurrentChat(null);
        setMessages([]);
    };

    const horizontalPadding = Math.max(12, Math.min(20, width * 0.04));
    const inputPaddingBottom = Platform.OS === 'ios' ? Math.max(12, insets.bottom) : 14;

    return (
        <View style={[styles.safe, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
                <View style={[styles.header, { paddingHorizontal: horizontalPadding, borderBottomColor: colors.border }]}>
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                {
                                    backgroundColor:
                                        isConnected === true ? colors.statusConnected : isConnected === false ? colors.statusError : colors.statusChecking,
                                },
                            ]}
                        />
                        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                            {isConnected === true ? 'Bağlı' : isConnected === false ? 'Bağlantı yok' : 'Kontrol...'}
                        </Text>
                        {isConnected === false && settings?.baseUrl?.trim() && (
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={() => settings && checkConnection(settings)}
                            >
                                <Ionicons name="refresh" size={16} color={colors.primary} />
                                <Text style={[styles.retryText, { color: colors.primary }]}>Yenile</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={clearChat}>
                        <Text style={[styles.clearText, { color: colors.primary }]}>Temizle</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => <MessageBubble message={item} screenWidth={width} />}
                    contentContainerStyle={[
                        styles.messageList,
                        {
                            paddingHorizontal: horizontalPadding,
                            paddingBottom: Math.max((inputBarHeight || 0) + 24, 140),
                        },
                    ]}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    keyboardShouldPersistTaps="handled"
                    ListFooterComponent={loading ? <TypingIndicator /> : null}
                />

                <View
                    style={[
                        styles.inputContainer,
                        {
                            paddingHorizontal: horizontalPadding,
                            paddingBottom: inputPaddingBottom,
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: keyboardHeight + (Platform.OS === 'ios' ? 12 : 16),
                            borderTopColor: colors.border,
                            backgroundColor: colors.background,
                            zIndex: 10,
                            elevation: 10,
                        },
                    ]}
                    onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
                >
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Mesaj yazın..."
                        placeholderTextColor={colors.placeholder}
                        multiline
                        maxLength={4000}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: colors.primary },
                            (!inputText.trim() || loading) && { backgroundColor: colors.primaryDisabled },
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Ionicons name="send" size={22} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    statusRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    retryText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    clearText: {
        fontSize: 14,
        fontWeight: '500',
    },
    messageList: {
        paddingTop: 16,
        flexGrow: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: 10,
        borderTopWidth: 1,
        minHeight: 56,
    },
    input: {
        flex: 1,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 12,
        fontSize: 16,
        maxHeight: 120,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
