import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Message } from '../api/jan';
import { useTheme } from '../theme/ThemeContext';

interface MessageBubbleProps {
    message: Message;
    screenWidth?: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, screenWidth }) => {
    const { colors } = useTheme();
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';
    const maxBubbleWidth = screenWidth ? Math.min(screenWidth * 0.84, 320) : undefined;

    const opacity = useRef(new Animated.Value(isAssistant ? 0 : 1)).current;
    const translateY = useRef(new Animated.Value(isAssistant ? 8 : 0)).current;

    useEffect(() => {
        if (!isAssistant) return;
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isAssistant, opacity, translateY]);

    if (isSystem) return null;

    const bubbleContent = (
        <View style={[
            styles.bubble,
            maxBubbleWidth ? { maxWidth: maxBubbleWidth } : undefined,
            isUser
                ? { backgroundColor: colors.userBubble, borderBottomRightRadius: 4 }
                : { backgroundColor: colors.assistantBubble, borderBottomLeftRadius: 4 },
        ]}>
            <Text style={[
                styles.text,
                { color: isUser ? colors.userBubbleText : colors.assistantBubbleText }
            ]}>
                {message.content}
            </Text>
        </View>
    );

    const containerStyle = [
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer
    ];

    if (isAssistant) {
        return (
            <Animated.View style={[containerStyle, { opacity, transform: [{ translateY }] }]}>
                {bubbleContent}
            </Animated.View>
        );
    }

    return (
        <View style={containerStyle}>
            {bubbleContent}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: 12,
        flexDirection: 'row',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    assistantContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: 320,
        padding: 12,
        borderRadius: 20,
    },
    text: {
        fontSize: 16,
        lineHeight: 20,
    },
});

export default MessageBubble;
